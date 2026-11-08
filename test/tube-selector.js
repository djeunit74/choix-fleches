/* Validation des mesures, conversion d’unités et orchestration des tableaux contrôlés. */
(() => {
  'use strict';
  const engine=typeof module!=='undefined'&&module.exports?require('./verified-engine.js'):window.AssistantArcherVerifiedEngine;
  const stable=n=>Number.isFinite(n)?Math.round(n*1e10)/1e10:n;
  function evaluate(data,input) {
    if(!['all','easton','victory','skylon','carbon'].includes(input.brand))return {ok:false,message:'Choisissez une marque ou la comparaison des trois tableaux.',fields:['preferredBrand']};
    if(input.brand==='carbon')return {ok:true,documentOnly:true,records:[],count:0};
    if(!['all','carbon','alu'].includes(input.material))return {ok:false,message:'Choisissez le type de tube.',fields:['shaftMaterial']};
    if(!['lb','kg'].includes(input.weightUnit)||!['in','cm'].includes(input.lengthUnit))return {ok:false,message:'Vérifiez les unités de mesure.',fields:['tube-weight-unit','tube-length-unit']};
    if(!Number.isFinite(input.weight)||input.weight<=0)return {ok:false,message:'Renseignez la puissance mesurée à votre allonge, avec son unité.',fields:['drawWeight']};
    const weight=stable(input.weightUnit==='kg'?input.weight/0.45359237:input.weight);
    const convert=n=>stable(input.lengthUnit==='cm'?n/2.54:n);
    const length=convert(input.length),skylonLength=input.brand==='skylon'?length:convert(input.skylonLength);
    const brands=input.brand==='all'?['easton','victory','skylon']:[input.brand];
    const records=[];
    for(const brand of brands){
      const materials=brand==='easton'&&input.material==='all'?['carbon','alu']:[input.material==='all'?'carbon':input.material];
      for(const material of materials){
        const fields=[];
        if(!Number.isFinite(brand==='skylon'?skylonLength:length)||(brand==='skylon'?skylonLength:length)<=0)fields.push(brand==='skylon'&&input.brand==='all'?'verifiedSkylonLength':'arrowLength');
        if(brand!=='skylon'&&(!Number.isFinite(input.front)||input.front<=0))fields.push('verifiedFront');
        if(brand==='easton'&&!['carbon','beginner'].includes(input.limbs))fields.push('verifiedLimbs');
        let reading;
        if(brand!=='easton'&&material==='alu')reading={ok:false,reason:'Aucun tableau aluminium contrôlé pour cette marque.'};
        else if(fields.length)reading={ok:false,reason:fields.includes('verifiedSkylonLength')?'Renseignez la longueur Skylon de coupe à coupe pour ajouter ce résultat.':'Complétez les mesures et conditions nécessaires à ce tableau.'};
        else reading=engine.lookup(data,brand,{weight,length,skylonLength,front:input.front,limbs:input.limbs,material});
        records.push({brand,material,reading,fields});
      }
    }
    const missing=[...new Set(records.flatMap(r=>r.fields))];
    if(input.brand!=='all'&&missing.length)return {ok:false,message:'Complétez les champs indiqués avant de lire ce tableau.',fields:missing};
    return {ok:true,records,count:records.filter(r=>r.reading.ok).length,measurements:{weight,length,skylonLength,front:input.front}};
  }
  const api=Object.freeze({evaluate});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.AssistantArcherTubeSelector=api;
})();
