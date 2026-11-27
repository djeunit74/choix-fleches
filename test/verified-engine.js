/* Lectures de tableaux publiés. Aucun rapprochement de tailles ni score de performance. */
(() => {
  'use strict';
  function lookup(data, brand, input) {
    const weight = input.weight;
    const length = brand === 'skylon' ? input.skylonLength : input.length;
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(length) || length <= 0)
      return { ok:false, reason:'Mesurez la puissance et la longueur selon la convention de cette marque.' };
    if (brand === 'carbon') return { ok:false, reason:'Le PDF Carbon Express comporte des codes ambigus (notamment NPX7500). La convention de longueur doit aussi être confirmée. Consultez le document original ; aucun code de modèle n’est converti en spine générique.' };
    if (brand === 'easton') {
      if (!['carbon','beginner'].includes(input.limbs)) return {ok:false,reason:'Indiquez le type de branches pour appliquer la correction publiée par Easton.'};
      if (!Number.isFinite(input.front) || input.front < 25 || input.front % 25 !== 0)
        return {ok:false,reason:'Cette lecture prend en charge les masses avant par pas de 25 grains. Pour une autre masse, utilisez le sélecteur officiel Easton.'};
      const lengths=input.material==='alu'?data.easton.lengthsAlu:data.easton.lengthsCarbon;
      if(length<lengths[0]||length>lengths.at(-1)) return {ok:false,reason:'Longueur hors tableau : aucune extrapolation.'};
      const column=Math.floor(length+0.5);
      const adjusted=weight+(input.limbs==='beginner'?-5:0)+3*(input.front-100)/25;
      const rows=(input.material==='alu'?data.easton.alu:data.easton.carbon).filter(r=>adjusted>=r.range[0]&&(r.exclusiveMax?adjusted<r.range[1]:adjusted<=r.range[1]));
      if(rows.length!==1) return {ok:false,reason:'Puissance corrigée sans ligne publiée correspondante. Aucune interpolation entre les lignes.'};
      const value=rows[0].cells[lengths.indexOf(column)];
      return value?{ok:true,value:value.replaceAll('|',' / '),column,row:rows[0].label,adjusted,kind:input.material==='alu'?'Codes de tailles aluminium':'Plage de spine du tableau'}:{ok:false,reason:'Case vide du tableau : aucune taille proposée.'};
    }
    if(!Number.isInteger(length)) return {ok:false,reason:'Le tableau ne précise pas ici une règle d’arrondi pour les longueurs fractionnaires. Consultez les colonnes voisines dans le document original.'};
    if(brand==='skylon') {
      const col=data.skylon.lengths.indexOf(length);
      const rows=data.skylon.rows.filter(r=>weight>=r.min&&weight<=r.max);
      const value=rows.length===1&&col>=0?rows[0].values[col]:null;
      return value?{ok:true,value,column:length,row:`${rows[0].min}–${rows[0].max} lb`,kind:'Groupe Skylon',models:data.skylon.groups[value]}:{ok:false,reason:'Aucune case Skylon publiée pour ces mesures cut-to-cut.'};
    }
    if(brand==='victory') {
      const rows=input.front>=100&&input.front<=125?data.victory.light:input.front>=150&&input.front<=175?data.victory.heavy:null;
      if(!rows) return {ok:false,reason:'Masse avant hors des bandes publiées 100–125 ou 150–175 grains. Aucune correction inventée.'};
      const col=data.victory.lengths.indexOf(length);
      if(col<0) return {ok:false,reason:'Longueur hors tableau Victory.'};
      const matches=rows.filter(r=>weight>=r.min&&weight<=r.max);
      // Shared bounds (14, 16, 18, 22 lb) can belong to two different rows.
      const values=[...new Set(matches.map(r=>r.values[col]))];
      if(!matches.length||values.length!==1||!values[0]) return {ok:false,reason:'Case absente ou limite commune à deux lignes différentes. Le tableau ne permet pas de choisir un spine unique.'};
      return {ok:true,value:String(values[0]),column:length,row:matches.map(r=>`${r.min}–${r.max} lb`).join(' / '),kind:'Spine de référence Victory'};
    }
    return {ok:false,reason:'Marque sans tableau vérifié.'};
  }
  function measuredFoc(length,balance) {
    if(!Number.isFinite(length)||!Number.isFinite(balance)||length<=0||balance<0)return null;
    return 100*(balance-length/2)/length;
  }
  const api=Object.freeze({lookup,measuredFoc});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.AssistantArcherVerifiedEngine=api;
})();
