/* Assistant Archer TEST - classement expert des modèles, Pré-alpha v23.
   Les faits fabricant restent dans manufacturer-reference*.json.
   Ici : compatibilité physique puis interprétation explicable entre modèles compatibles. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v23';
  let patched=false, observer=null;
  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const aliases=[
    ['x10 parallel pro 3 2 mm','x10 parallel pro 3.2 mm'],['3 2mm x10 parallel pro','x10 parallel pro 3.2 mm'],
    ['x10 parallel pro 4 mm','x10 parallel pro 4 mm'],['4mm x10 parallel pro','x10 parallel pro 4 mm'],
    ['xx75 platinum plus','xx75 platinum plus'],['platinum plus','xx75 platinum plus'],['superdrive micro','superdrive micro'],
    ['avance','avance'],['vector','vector'],['a c e','a/c/e'],['ace','a/c/e'],['x23','x23'],['rx7','rx7'],['x7','x7'],['x10','x10'],
    ['preminens','preminens'],['premiens','preminens'],['precium','precium'],['paragon','paragon'],['performa','performa'],
    ['brixxon','brixxon'],['radius','radius'],['edge','edge'],['bruxx','bruxx'],['empros','empros'],['vxt','vxt'],['vap','vap']
  ].sort((a,b)=>b[0].length-a[0].length);
  const modelKey=name=>{const t=norm(name);for(const [a,k] of aliases)if(t.includes(a))return k;return '';};
  const objective=()=>document.getElementById('expertObjective')?.value||'performance';

  function installObjectiveInput(){
    const form=document.getElementById('spine-form'); if(!form||document.getElementById('expertObjective'))return;
    const discipline=document.getElementById('disciplineWrap'), label=document.createElement('label');
    label.id='expertObjectiveWrap';
    label.innerHTML=`Priorité de sélection<select id="expertObjective"><option value="progression">Progression / simplicité</option><option value="performance" selected>Performance / compétition</option><option value="elite">Performance maximale / tuning expert</option></select><small class="field-hint">Ce choix ne change pas le spine fabricant. Il sert uniquement à départager plusieurs modèles techniquement compatibles.</small>`;
    if(discipline?.nextSibling)form.insertBefore(label,discipline.nextSibling);else form.appendChild(label);
  }

  const ctx=input=>({objective:objective(),discipline:input?.discipline||document.getElementById('discipline')?.value||'target',environment:input?.shootingEnvironment||'outdoor',bowType:input?.bowType||'recurve'});
  const ow=(c,t)=>{
    if(c.objective==='performance'){
      const a=Number(t?.performance||0),b=Number(t?.competition||a);
      return (a+b)/2;
    }
    return Number(t?.[c.objective]||0);
  };

  const EASTON={
    'x10 parallel pro 3.2 mm':[{progression:-6,performance:7,competition:13,elite:18},9,5,-8,'Micro-diamètre 3,2 mm aluminium/carbone, conçu par Easton pour la compétition extérieure de très haut niveau, faible dérive et réglage parallèle.'],
    x10:[{progression:-5,performance:8,competition:14,elite:18},8,2,-8,'X10 barrelled aluminium/carbone : référence compétition extérieure, très haute précision, avec mise au point plus exigeante qu’un tube parallèle.'],
    'x10 parallel pro 4 mm':[{progression:-2,performance:9,competition:13,elite:14},7,8,-5,'Parallel Pro 4 mm : niveau X10, profil parallèle plus simple à régler et usage fabricant cible/campagne/barebow.'],
    'a/c/e':[{progression:-1,performance:9,competition:10,elite:7},7,4,-6,'A/C/E aluminium/carbone léger et précis : choix performance extérieure quand le niveau X10 n’est pas nécessaire.'],
    avance:[{progression:8,performance:8,competition:4,elite:0},5,2,-5,'Avance : tube cible orienté progression vers la performance.'],
    'superdrive micro':[{progression:4,performance:8,competition:8,elite:5},5,10,-4,'SuperDrive Micro : petit diamètre et positionnement tournoi/campagne/3D ; pertinent quand la polyvalence parcours prime.'],
    vector:[{progression:10,performance:2,competition:-2,elite:-5},2,0,-2,'Vector : gamme club/progression ; priorité à la simplicité plutôt qu’au dernier niveau de performance.'],
    rx7:[{progression:2,performance:9,competition:14,elite:13},-12,-8,18,'RX7 : aluminium à arrière conique spécifiquement conçu par Easton pour le recurve en salle et le dégagement.'],
    x7:[{progression:3,performance:9,competition:12,elite:9},-10,-7,14,'X7 Eclipse : aluminium cible de précision, rectitude ±.001", particulièrement cohérent pour la salle.'],
    x23:[{progression:-2,performance:7,competition:12,elite:10},-12,-8,13,'X23 : grand diamètre de compétition salle ; avantage de coupe de ligne mais masse et diamètre élevés.'],
    'xx75 platinum plus':[{progression:8,performance:7,competition:4,elite:1},-8,-5,10,'XX75 Platinum Plus : aluminium salle/intermédiaire, cohérent pour progression et performance club.']
  };
  function eastonRule(key,c){const r=EASTON[key];if(!r)return{score:0,why:''};const indoor=c.environment==='indoor',field=c.discipline==='field';return{score:ow(c,r[0])+(indoor?r[3]:r[1])+(field?r[2]:0),why:r[4]};}
  function victoryRule(key,c){
    if(key==='vxt')return{score:ow(c,{progression:-4,performance:7,competition:13,elite:17})+(c.environment==='indoor'?-4:7),why:'VXT : cible haut de gamme à avant parallèle/arrière conique. Potentiel élevé mais coupe/tuning plus techniques ; pertinent pour un archer expérimenté.'};
    if(key==='vap')return{score:ow(c,{progression:5,performance:10,competition:11,elite:9})+(c.environment==='indoor'?-2:7),why:'VAP : micro-diamètre parallèle .166, spine aligné et poids appairé ; performance/compétition avec réglage plus conventionnel que VXT.'};
    return{score:0,why:''};
  }
  const SKYLON={
    preminens:[{progression:-4,performance:8,competition:14,elite:16},10,5,-5,'Preminens : positionnée par Skylon comme “ultimate outdoor arrow”; micro-diamètre 3,2 mm et niveau de précision le plus élevé de la famille extérieure.'],
    paragon:[{progression:0,performance:10,competition:12,elite:10},9,5,-5,'Paragon : 40T, ID 3,2 mm et rectitude serrée ; choix compétition/performance extérieur.'],
    precium:[{progression:2,performance:10,competition:9,elite:6},8,5,-4,'Precium : famille outdoor 3,2 mm ; compromis performance/précision.'],
    performa:[{progression:5,performance:9,competition:6,elite:2},8,5,-4,'Performa : 40T, ID 3,2 mm, clairement orientée outdoor ; pertinente pour progresser vers la compétition.'],
    brixxon:[{progression:9,performance:6,competition:2,elite:-2},4,2,0,'Brixxon : Skylon la positionne comme flèche intermédiaire recurve/compound.'],
    radius:[{progression:10,performance:2,competition:-3,elite:-5},2,1,0,'Radius : gamme débutant/progression recurve/compound selon Skylon.'],
    bruxx:[{progression:3,performance:8,competition:10,elite:8},-5,8,12,'Bruxx : Skylon la classe indoor et 3D ; grand diamètre 8 mm adapté à ces usages.'],
    empros:[{progression:2,performance:9,competition:12,elite:10},-5,8,13,'Empros : 24T 3K, ID 8 mm et rectitude ±.003", positionnée salle/3D par Skylon.'],
    edge:[{progression:-20,performance:-20,competition:-20,elite:-20},-20,-20,-20,'Edge est positionnée par Skylon pour compound outdoor/hunting : elle est exclue d’une recommandation recurve.']
  };
  function skylonRule(key,c){const r=SKYLON[key];if(!r)return{score:0,why:''};const indoor=c.environment==='indoor',field=c.discipline==='field';return{score:ow(c,r[0])+(indoor?r[3]:r[1])+(field?r[2]:0),why:r[4]};}
  const ruleFor=(brand,key,c)=>brand==='easton'?eastonRule(key,c):brand==='victory'?victoryRule(key,c):brand==='skylon'?skylonRule(key,c):{score:0,why:''};

  function manufacturerLengthCompatible(entry,input){
    const stock=Number(entry?.manufacturerSpec?.lengthIn); const requested=Number(input?.arrowLength);
    if(!Number.isFinite(stock)||!Number.isFinite(requested))return true;
    return stock+1e-9>=requested;
  }

  function rankRecommendation(rec,input){
    if(!rec||!Array.isArray(rec.models)||!['easton','victory','skylon'].includes(rec.brand))return rec;
    const c=ctx(input), ranked=[]; let rejectedLength=0;
    for(const entry of rec.models){
      const key=modelKey(entry.model);
      if(rec.brand==='skylon'&&key==='edge'&&c.bowType==='recurve')continue;
      if(!manufacturerLengthCompatible(entry,input)){rejectedLength++;continue;}
      const expert=ruleFor(rec.brand,key,c),base=Number.isFinite(Number(entry.score))?Number(entry.score):0;
      ranked.push({...entry,expertRankScore:expert.score*100+base,expertWhy:expert.why,expertModelKey:key});
    }
    ranked.sort((a,b)=>b.expertRankScore-a.expertRankScore); rec.models=ranked;
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),`Interprétation app ${VERSION} : classement entre modèles compatibles selon discipline, environnement et priorité. Pour « Performance / compétition », les anciens niveaux Performance et Compétition sont fusionnés. Le spine fabricant n’est pas modifié.`];
    if(rejectedLength)rec.confidenceReasons.push(`${rejectedLength} modèle(s) écarté(s) car la longueur stock fabricant est inférieure à la longueur de flèche demandée.`);
    return rec;
  }

  function patchRecommendationEngine(){
    if(patched||typeof window.buildBrandRecommendation!=='function'||!window.AssistantArcherManufacturerReference)return false;
    const original=window.buildBrandRecommendation;
    window.buildBrandRecommendation=function(input,brand){return rankRecommendation(original.apply(this,arguments),input);};
    patched=true;window.AssistantArcherExpertModelRanking=Object.freeze({version:VERSION,rankRecommendation});return true;
  }

  function decorateInterpretation(){
    const result=document.getElementById('result');if(!result)return;
    result.querySelectorAll('li').forEach(li=>{
      if(li.querySelector(':scope > .expert-model-why'))return;
      const strong=li.querySelector('strong');if(!strong)return;const key=modelKey(strong.textContent);if(!key)return;
      const brand=['vap','vxt'].includes(key)?'victory':Object.hasOwn(SKYLON,key)?'skylon':'easton';const why=ruleFor(brand,key,ctx({})).why;if(!why)return;
      const p=document.createElement('p');p.className='expert-model-why muted';p.style.cssText='margin:.25rem 0 .15rem;font-size:.82rem;line-height:1.35';p.innerHTML=`<strong>Interprétation app :</strong> ${why}`;li.appendChild(p);
    });
  }
  function refresh(){installObjectiveInput();patchRecommendationEngine();decorateInterpretation();const release=document.getElementById('appReleaseStatic');if(release&&patched)release.textContent=`Version : ${VERSION}`;}
  function install(){refresh();let attempts=0;const timer=setInterval(()=>{attempts++;refresh();if(patched||attempts>80)clearInterval(timer);},100);const result=document.getElementById('result');if(result){let queued=false;observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateInterpretation();});});observer.observe(result,{childList:true,subtree:true});}}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
