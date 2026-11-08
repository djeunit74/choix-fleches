/* Comparaison du tube possédé aux références publiées. Les candidats sont saisis par l’archer. */
(() => {
  'use strict';
  const engine=typeof module!=='undefined'&&module.exports?require('./verified-engine.js'):window.AssistantArcherVerifiedEngine;
  function compare(reading,brand,input) {
    if(!reading.ok)return {status:'unknown',reason:reading.reason};
    const code=String(input.spine).trim();
    if(input.material==='alu')return {status:reading.value.split(' / ').includes(code)?'match':'outside',reference:reading.value};
    const spine=Number(code);
    if(brand==='skylon') {
      const entry=reading.models?.find(([name])=>name.toLowerCase()===input.model.trim().toLowerCase());
      if(!entry)return {status:'unknown',reason:'Ce modèle exact ne figure pas dans le groupe Skylon lu. Aucune correspondance avec un autre modèle n’est déduite.'};
      return {status:entry[1].includes(spine)?'match':'outside',reference:entry[1].join(' / ')};
    }
    const values=reading.value.split('-').map(Number);
    if(values.some(n=>!Number.isFinite(n)))return {status:'unknown',reason:'Code du tableau non comparable à un spine numérique.'};
    const min=Math.min(...values),max=Math.max(...values);
    return {status:spine>=min&&spine<=max?'match':'outside',reference:reading.value,reaction:spine<min?'stiff':spine>max?'weak':'within'};
  }
  function trialAdvice({hand,impact,repeatable,clearance,bowStyle}) {
    if(!impact||impact==='none')return {kind:'untested',text:'Le tableau est un point de départ. Sans essai au tir, il ne démontre pas qu’une autre pointe est nécessaire.'};
    if(!repeatable||!clearance||!['right','left'].includes(hand))return {kind:'inconclusive',text:'Essai non interprétable : confirmez la latéralité, des impacts répétés et l’absence de contact parasite. Un écart isolé ne permet pas de choisir une pointe.'};
    const extra=bowStyle==='barebow'?' En arc nu, refaites le contrôle avec les prises de corde et distances réellement utilisées.':'';
    if(impact==='center')return {kind:'keep',text:'L’essai décrit ne justifie pas de changer la pointe à lui seul. Conservez cette base et comparez les groupements.'+extra};
    if(!['left','right'].includes(impact))return {kind:'inconclusive',text:'Observation non reconnue.'};
    const stiff=(hand==='right'&&impact==='left')||(hand==='left'&&impact==='right');
    return {kind:stiff?'heavier':'lighter',text:(stiff?'La réaction observée suggère une flèche trop raide. Une pointe plus lourde est une piste d’essai pour l’assouplir.':'La réaction observée suggère une flèche trop souple. Une pointe plus légère est une piste d’essai pour la raidir.')+' Vérifiez d’abord le détalonnage, le centrage et les contacts. Changez un seul paramètre puis comparez plusieurs volées ; aucun nombre de grains ne se déduit de cet écart.'+extra};
  }
  function massProposal(current,trial,input,candidates) {
    const titles={heavier:'Essayer d’alourdir l’avant',lighter:'Essayer d’alléger la pointe',keep:'Conserver la masse actuelle pour l’instant',unknown:'Contrôler avant de modifier',conflict:'Recouper le tableau et l’essai avant de modifier'};
    let fromChart=null;
    if(['easton','victory'].includes(input.brand)&&input.material==='carbon'&&current.status!=='unknown'){
      fromChart=current.reaction==='stiff'?'heavier':current.reaction==='weak'?'lighter':current.status==='match'?'keep':null;
    }
    let kind='unknown',basis='Sans conclusion',reason='Les données disponibles ne permettent pas de choisir un sens de modification. Un essai régulier avec contrôle des contacts est nécessaire.';
    if(trial.kind==='inconclusive')reason='L’essai renseigné n’est pas interprétable. Reprenez-le avant de changer la pointe ou l’insert.';
    else if(['heavier','lighter','keep'].includes(trial.kind)){
      kind=trial.kind;basis='Piste issue de votre essai au tir';reason=trial.text;
      if(['heavier','lighter'].includes(fromChart)&&['heavier','lighter'].includes(kind)&&fromChart!==kind){kind='conflict';reason='Le tableau et votre essai suggèrent des sens opposés. Revérifiez la longueur, la puissance, les masses avant, la latéralité et les contacts avant de modifier le montage.';}
      else if(kind==='keep'&&['heavier','lighter'].includes(fromChart))reason+=' Le tableau reste discordant : revérifiez ses conditions et vos mesures avant de conclure.';
    }else if(fromChart){
      kind=fromChart;basis='Piste issue du tableau, à confirmer au tir';
      reason=kind==='heavier'?'Votre tube est plus raide que la référence lue. Augmenter la masse avant est une piste pour l’assouplir ; le tableau seul ne démontre pas qu’une autre pointe suffira.':kind==='lighter'?'Votre tube est plus souple que la référence lue. Diminuer la masse de pointe est une piste pour le raidir ; le tableau seul ne démontre pas qu’une autre pointe suffira.':'Votre spine figure dans la référence lue. Le tableau ne justifie pas à lui seul de modifier la pointe ; vérifiez les groupements avec cette base.';
    }
    const options=['heavier','lighter'].includes(kind)?candidates.filter(r=>r.status==='match'&&(kind==='heavier'?r.point>input.point:r.point<input.point)).map(r=>r.point):[];
    return {kind,title:titles[kind],basis,reason,options,action:kind==='heavier'?'À essayer : une pointe plus lourde, ou une masse additionnelle / un insert plus lourd explicitement compatible avec votre montage. Relevez le nouveau total avant et refaites le contrôle.':kind==='lighter'?'À essayer : une pointe plus légère compatible. Ne retirez un segment sécable que si cette opération et la masse obtenue sont prévues par le fabricant. Relevez le nouveau total avant et refaites le contrôle.':null};
  }
  function assess(data,input) {
    if(!['easton','victory','skylon','carbon'].includes(input.brand)||!['carbon','alu'].includes(input.material))return {ok:false,reason:'Choisissez la marque et le type de tube.'};
    if(!input.model?.trim()||!String(input.spine??'').trim())return {ok:false,reason:'Renseignez le modèle exact et le spine ou code inscrit sur votre tube.'};
    if(input.material==='carbon'&&(!/^\d+(\.\d+)?$/.test(String(input.spine).trim())||Number(input.spine)<=0))return {ok:false,reason:'Saisissez un spine numérique positif. Les codes de taille aluminium ne sont pas des spines carbone.'};
    if(![input.weight,input.length,input.point,input.insert].every(Number.isFinite)||input.weight<=0||input.length<=0||input.point<=0||input.insert<0)return {ok:false,reason:'Renseignez puissance et longueur positives, masse de pointe positive et masse des autres composants avant positive ou nulle (0 s’il n’y en a pas).'};
    if(!Array.isArray(input.candidates)||input.candidates.length>12||input.candidates.some(n=>!Number.isFinite(n)||n<=0))return {ok:false,reason:'Indiquez au maximum 12 masses de pointe positives, séparées par un point-virgule.'};
    const read=point=>input.brand!=='easton'&&input.material==='alu'?{ok:false,reason:'Aucun tableau aluminium contrôlé pour cette marque.'}:engine.lookup(data,input.brand,{weight:input.weight,length:input.length,skylonLength:input.length,front:point+input.insert,limbs:input.limbs,material:input.material});
    const evaluate=point=>{const reading=read(point);return {point,total:point+input.insert,...compare(reading,input.brand,input),reading};};
    const current=evaluate(input.point);
    // Skylon does not publish a point-mass adjustment in this source. Do not simulate one.
    const candidates=input.brand==='skylon'?[]:[...new Set(input.candidates)].filter(n=>n!==input.point).map(evaluate);
    const trial=trialAdvice(input);
    return {ok:true,current,candidates,proposal:massProposal(current,trial,input,candidates),pointRule:input.brand==='skylon'?'Le tableau Skylon utilisé ne publie pas de correction de masse de pointe. La comparaison du groupe ne valide donc pas votre masse actuelle ; aucune simulation de changement de pointe n’est produite.':null,trial};
  }
  const api=Object.freeze({assess,trialAdvice});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.AssistantArcherPointAdvisor=api;
})();
