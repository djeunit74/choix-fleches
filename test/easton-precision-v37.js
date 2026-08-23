/* Assistant Archer TEST - précision fabricant Easton, Pré-alpha v37.
   Pas d'observer global, pas de boucle permanente.
   Principe : profil -> groupe Easton -> taille recurve exacte X10/A-C-E ;
   autres familles : uniquement tailles réellement fabriquées, sans prétendre à une
   correspondance groupe exacte non documentée. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v37';
  const LENGTHS = Object.freeze([21,22,23,24,25,26,27,28,29,30,31,32,33,34]);
  const RECURVE_BANDS = Object.freeze([
    [-Infinity,20],[21,26],[27,31],[32,35],[36,39],[40,43],
    [44,47],[48,52],[53,57],[58,62],[63,67],[68,73]
  ]);
  const RANGES = Object.freeze([
    ['2000','2000','2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500'],
    ['2000','2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450'],
    ['2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400'],
    ['1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370'],
    ['1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340'],
    ['1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310'],
    ['1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300'],
    ['1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250'],
    ['900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200'],
    ['800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200'],
    ['720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200','250-200'],
    ['675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200','250-200','200-150']
  ]);
  const RANGE_TO_GROUP = Object.freeze({
    '2000':'00','2000-1800':'00','1800-1700':'00','1750-1400':'01',
    '1450-1200':'02','1250-1050':'03','1080-880':'T01','900-750':'T2',
    '800-700':'T3','720-625':'T4','675-600':'T5','640-570':'T6',
    '575-500':'T7','525-450':'T8','475-400':'T9','440-370':'T10',
    '400-340':'T11','370-310':'T12','340-300':'T13','300-250':'T14','250-200':'T14'
  });
  /* Valeur marquée R dans les pages de groupe Easton : recommandation recurve. */
  const RECURVE_GROUP_SPINE = Object.freeze({
    x10:Object.freeze({T01:1000,T2:830,T3:750,T4:700,T5:650,T6:600,T7:550,T8:500,T9:450,T10:410,T11:380,T12:350,T13:325}),
    ace:Object.freeze({'03':1100,T01:1000,T2:850,T3:780,T4:720,T5:670,T6:620,T7:570,T8:520,T9:470,T10:430,T11:400,T12:370})
  });
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  function modelKey(name) {
    const n=norm(name);
    if(n.includes('protour')) return 'protour';
    if(n.includes('parallel pro') && (n.includes('3 2') || n.includes('3.2'))) return 'x10 parallel pro 3.2 mm';
    if(n.includes('parallel pro')) return 'x10 parallel pro 4 mm';
    if(/^x10(?:\s|$)/.test(n)) return 'x10';
    if(n==='a c e'||n==='ace'||n.startsWith('a c e ')) return 'a/c/e';
    return '';
  }
  function roundedLength(v){const n=Number(v);return Number.isFinite(n)?Math.floor(n+0.5):null;}
  function rowFor(weight){return Number.isFinite(weight)?RECURVE_BANDS.findIndex(([a,b],i)=>i===0?weight<21:weight>=a&&weight<=b):-1;}
  function parseRange(text){const v=String(text||'').match(/\d+/g)?.map(Number)||[];if(!v.length)return null;return v.length===1?{weak:v[0],stiff:v[0],label:String(v[0])}:{weak:Math.max(...v),stiff:Math.min(...v),label:`${Math.max(...v)}-${Math.min(...v)}`};}
  function pointWeight(){const n=Number(document.getElementById('eastonPointWeightV37')?.value);return Number.isFinite(n)&&n>0?n:100;}
  function limbAdjustment(){return document.getElementById('eastonLimbProfileV37')?.value==='beginner'?-5:0;}
  function manufacturerRange(){
    const draw=Number(document.getElementById('drawWeight')?.value), length=roundedLength(document.getElementById('arrowLength')?.value);
    if(!Number.isFinite(draw)||!Number.isFinite(length))return null;
    const col=LENGTHS.indexOf(length), adjusted=draw+limbAdjustment()+3*((pointWeight()-100)/25), row=rowFor(adjusted);
    if(col<0||row<0)return null;const range=parseRange(RANGES[row][col]);
    return range?{...range,length,adjustedDrawWeight:adjusted,pointWeight:pointWeight()}:null;
  }
  function currentGroup(){const r=manufacturerRange();return r?.label?(RANGE_TO_GROUP[r.label]||null):null;}
  function sourceFor(spec){const key=spec?.source;return key?window.AssistantArcherManufacturerReference?.data?.sources?.[key]||'':'';}
  function specFor(key){return window.AssistantArcherManufacturerReference?.data?.models?.[key]||null;}
  function closestManufactured(spec,target){
    const sizes=Object.keys(spec?.spines||{}).map(Number).filter(Number.isFinite);if(!sizes.length)return null;
    const t=Number(target);return sizes.slice().sort((a,b)=>Math.abs(a-t)-Math.abs(b-t))[0];
  }
  function pointRangeFor(key,row,previous){
    if(Array.isArray(row?.pointGr)&&row.pointGr.length)return [Math.min(...row.pointGr),Math.max(...row.pointGr)];
    if(Array.isArray(previous?.pointRange)&&previous.pointRange.length>=2)return previous.pointRange;
    if(key==='x10'||key==='x10 parallel pro 3.2 mm')return [80,120];
    if(key==='a/c/e'||key==='x10 parallel pro 4 mm')return [80,130];
    return null;
  }
  function metaFromManufacturer(key,spec,row,previous){
    const pointRange=pointRangeFor(key,row,previous);
    if(!pointRange)return previous||null;
    return {
      ...(previous||{}),
      seriesTier: previous?.seriesTier || (key.includes('x10')?'elite':'competition'),
      material: previous?.material || 'carbon',
      diameters: previous?.diameters || ['thin'],
      massClass: previous?.massClass || 'light',
      toleranceClass: previous?.toleranceClass || 'tight',
      componentSystem: previous?.componentSystem || 'manufacturer',
      distanceBand: previous?.distanceBand || 'long',
      useCase: previous?.useCase || 'target',
      pointRange,
      manufacturerMaterial:spec?.material||null,
      manufacturerProfile:spec?.profile||null,
      manufacturerStraightnessIn:spec?.straightnessIn??null,
      manufacturerWeightToleranceGr:spec?.weightToleranceGr??null
    };
  }
  function enrichEntry(entry,group){
    const key=modelKey(entry.model);if(!key||key==='protour')return entry;
    const spec=specFor(key);if(!spec?.spines)return entry;
    let size=Number(entry.advisedSpine), basis='taille déjà sélectionnée par le moteur';
    if((key==='x10'||key==='a/c/e')&&group&&Number.isFinite(RECURVE_GROUP_SPINE[key==='a/c/e'?'ace':'x10']?.[group])){
      size=RECURVE_GROUP_SPINE[key==='a/c/e'?'ace':'x10'][group];basis=`groupe Easton ${group}, taille recurve marquée R`;
    }else if(!spec.spines[String(size)]){
      const nearest=closestManufactured(spec,size);if(Number.isFinite(nearest)){size=nearest;basis='taille réellement fabriquée la plus proche de la base app (pas une équivalence groupe fabricant)';}
    }
    const row=spec.spines[String(size)];if(!row)return entry;
    return {...entry,advisedSpine:String(size),manufacturerVerified:true,manufacturerSpec:row,manufacturerSource:sourceFor(spec),manufacturerModelKey:key,manufacturerSelectionBasis:basis,meta:metaFromManufacturer(key,spec,row,entry.meta)};
  }
  function applyPrecision(rec,input){
    if(!rec||rec.brand!=='easton'||!Array.isArray(rec.models))return rec;
    const group=currentGroup();
    rec.models=rec.models.filter(e=>modelKey(e.model)!=='protour').map(e=>enrichEntry(e,group));
    rec.models=rec.models.map((e,i)=>({e,i,exact:/groupe Easton/.test(e.manufacturerSelectionBasis||'')})).sort((a,b)=>Number(b.exact)-Number(a.exact)||a.i-b.i).map(x=>x.e);
    const x10=group?RECURVE_GROUP_SPINE.x10[group]:null,ace=group?RECURVE_GROUP_SPINE.ace[group]:null;
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),`Easton ${VERSION} : ${group?`groupe ${group}`:'groupe non déterminé'}${Number.isFinite(x10)?` · X10 recurve ${x10}`:''}${Number.isFinite(ace)?` · A/C/E recurve ${ace}`:''}. Les données GPI/OD/longueur proviennent de la fiche fabricant du spine affiché. X10 ProTour est exclue du recurve.`];
    return rec;
  }
  function ensureWrapped(){
    const current=window.buildBrandRecommendation;if(typeof current!=='function'||current.__eastonPrecisionV37)return false;
    const wrapped=function(input,brand){return applyPrecision(current.apply(this,arguments),input);};
    wrapped.__eastonPrecisionV37=true;window.buildBrandRecommendation=wrapped;return true;
  }
  function updateHint(){
    const wrap=document.getElementById('eastonPrecisionV37'),brand=document.getElementById('preferredBrand')?.value;if(wrap)wrap.hidden=brand!=='easton';
    const hint=document.getElementById('eastonPrecisionHintV37');if(!hint||brand!=='easton')return;
    const r=manufacturerRange(),g=currentGroup(),x=g?RECURVE_GROUP_SPINE.x10[g]:null,a=g?RECURVE_GROUP_SPINE.ace[g]:null;
    hint.textContent=r&&g?`Référence Easton : ${r.label} → groupe ${g}${Number.isFinite(x)?` · X10 recurve ${x}`:''}${Number.isFinite(a)?` · A/C/E recurve ${a}`:''}.`:'Référence Easton : renseignez puissance et longueur. La pointe de référence vaut 100 gr par défaut.';
  }
  function installFields(){
    const form=document.getElementById('spine-form'),brand=document.getElementById('preferredBrand');if(!form||!brand)return;
    if(!document.getElementById('eastonPrecisionV37')){
      const wrap=document.createElement('div');wrap.id='eastonPrecisionV37';wrap.innerHTML=`<p style="margin:.2rem 0 .4rem;font-weight:800">Référence Easton</p><label>Poids de pointe de référence (gr)<input id="eastonPointWeightV37" type="number" min="40" max="200" step="5" value="100" inputmode="numeric"></label><label>Type de branches<select id="eastonLimbProfileV37"><option value="carbon" selected>Carbone compétition</option><option value="beginner">Bois / fibre débutant</option></select></label><small id="eastonPrecisionHintV37" class="field-hint"></small>`;
      const anchor=document.getElementById('arrowLength')?.closest('label');anchor?.insertAdjacentElement('afterend',wrap)||form.appendChild(wrap);
      wrap.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',updateHint));
    }
    if(!brand.dataset.eastonPrecisionV37){brand.dataset.eastonPrecisionV37='1';brand.addEventListener('change',updateHint);}
    if(!form.dataset.eastonPrecisionV37){form.dataset.eastonPrecisionV37='1';form.addEventListener('submit',()=>{ensureWrapped();updateHint();},{capture:true});}
    updateHint();
  }
  function install(){installFields();ensureWrapped();setTimeout(ensureWrapped,800);window.AssistantArcherEastonPrecision=Object.freeze({version:VERSION,manufacturerRange,currentGroup,applyPrecision});}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
