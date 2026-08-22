/* Assistant Archer TEST - audit + injection catalogue fabricant Pré-alpha v17. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v17';
  const DATA_URL='catalog-audit-v17.json?v=20260822-prealpha-v17';
  const EXTRA_URL='catalog-audit-v17-extra.json?v=20260822-prealpha-v17';
  const TECH_URL='manufacturer-reference-v17.json?v=20260822-prealpha-v17';
  let data=null,tech=null,patched=false;
  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const aliases=[
    ['x10 parallel pro 3 2 mm','x10 parallel pro 3.2 mm'],['x10 parallel pro 4 mm','x10 parallel pro 4 mm'],
    ['xx75 platinum plus','xx75 platinum plus'],['xx75 jazz','xx75 jazz'],['inspire','inspire'],
    ['v tac 23','v-tac 23'],['v tac23','v-tac 23'],['vft gamer v3','vft'],['vft','vft'],['3dhv','3dhv'],['vx 27','vx-27'],
    ['premiens','preminens'],['preminens','preminens'],['superdrive micro','superdrive micro'],['avance sport','avance sport'],['avance','avance'],
    ['vector','vector'],['a c e','a/c/e'],['ace','a/c/e'],['rx7','rx7'],['x23','x23'],['x7','x7'],['x10','x10'],
    ['novice','novice'],['radius','radius'],['brixxon','brixxon'],['performa','performa'],['precium','precium'],['paragon','paragon'],
    ['bruxx','bruxx'],['empros','empros'],['edge','edge'],['vap','vap'],['vxt','vxt'],
    ['avalon tyro','tyro carbon arrows'],['tyro carbon arrows','tyro carbon arrows'],['avalon classic','classic carbon arrows'],['classic carbon arrows','classic carbon arrows'],
    ['hybrid carbon arrows','hybrid carbon arrows'],['tyro carbon shafts','tyro carbon shafts']
  ].sort((a,b)=>b[0].length-a[0].length);
  const keyOf=name=>{const t=norm(name);for(const [a,k] of aliases)if(t.includes(a))return k;return t;};
  const mergeCatalog=(base,extra)=>{
    const merged={...(base||{}),brands:{...(base?.brands||{})}};
    for(const [brand,b] of Object.entries(extra?.brands||{})){
      merged.brands[brand]={...(merged.brands[brand]||{}),...(b||{}),models:{...(merged.brands[brand]?.models||{}),...(b?.models||{})}};
    }
    return merged;
  };
  const registry=(brand,key)=>data?.brands?.[brand]?.models?.[key]||null;
  const autoStatus=new Set(['auto','auto_variant','auto_specialized','auto_if_selector','auto_historical_selector']);
  const numericParts=v=>(String(v||'').match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(Number.isFinite);
  const closest=(values,target)=>values.slice().sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];

  function mergedTechnicalModels(){return {...(window.AssistantArcherManufacturerReference?.data?.models||{}),...(tech?.models||{})};}
  function mergedSources(){return {...(window.AssistantArcherManufacturerReference?.data?.sources||{}),...(tech?.sources||{})};}
  function sourceFor(spec){const s=spec?.source;return s?mergedSources()[s]||'':'';}

  function canonical(entry,brand){
    let model=String(entry.model||'');const key=keyOf(model);
    if(key==='preminens')model=model.replace(/premiens/i,'Preminens');
    if(key==='vft')model=/v3|gamer/i.test(model)?'VFT V3':'VFT';
    if(key==='v-tac 23')model=/elite|v1/i.test(model)?'V-Tac 23 V1':'V-Tac 23';
    return {...entry,model,catalogAuditKey:key,catalogAudit:registry(brand,key)||null};
  }

  function environment(input){return input?.shootingEnvironment||document.getElementById('shootingEnvironment')?.value||'outdoor';}
  function contextAllows(info,input){
    if(!info?.recurve)return false;
    const env=environment(input),cat=String(info.category||'');
    if(cat.includes('indoor')&&!cat.includes('outdoor')&&env==='outdoor')return false;
    if(cat.includes('outdoor')&&!cat.includes('indoor')&&env==='indoor')return false;
    return true;
  }

  function targetFromRecommendation(rec){
    const nums=numericParts(rec?.primary||rec?.comparisonSpine||'').filter(n=>n>=200&&n<=2500);
    if(!nums.length)return Number(rec?.comparisonSpine)||null;
    return Math.max(...nums);
  }

  function chooseSpecRow(spec,rec){
    if(!spec?.spines)return null;
    const target=targetFromRecommendation(rec);if(!Number.isFinite(target))return null;
    const rows=Object.entries(spec.spines);
    const numericKeys=rows.map(([k])=>Number(k)).filter(n=>Number.isFinite(n)&&n>=200&&n<=2500);
    if(numericKeys.length===rows.length){const chosen=closest(numericKeys,target);return {size:String(chosen),row:spec.spines[String(chosen)]};}
    const byDeflection=rows.map(([size,row])=>({size,row,equivalent:Number(row?.deflection)*1000})).filter(x=>Number.isFinite(x.equivalent));
    if(byDeflection.length){const best=byDeflection.sort((a,b)=>Math.abs(a.equivalent-target)-Math.abs(b.equivalent-target))[0];return {size:best.size,row:best.row};}
    return null;
  }

  function stockLengthCompatible(row,input){
    const requested=Number(input?.arrowLength),stock=Number(row?.lengthIn);
    return !Number.isFinite(requested)||!Number.isFinite(stock)||stock+1e-9>=requested;
  }

  const INJECTABLE={
    easton:['x10 parallel pro 3.2 mm','x10 parallel pro 4 mm','x10','a/c/e','avance','avance sport','superdrive micro','vector','inspire','rx7','x7','x23','xx75 platinum plus','xx75 jazz'],
    skylon:['novice','radius','brixxon','performa','precium','paragon','preminens','bruxx','empros']
  };

  function modelSpec(brand,key){
    const all=mergedTechnicalModels();
    if(brand==='easton'&&key==='avance sport')return all.avance?{...all.avance,name:'Avance Sport',straightnessIn:0.005}:null;
    return all[key]||null;
  }

  function injectVerified(rec,input){
    const list=INJECTABLE[rec.brand];if(!list)return rec;
    const seen=new Set(rec.models.map(e=>keyOf(e.model)));
    for(const key of list){
      if(seen.has(key))continue;
      const info=registry(rec.brand,key);if(!info||!autoStatus.has(info.status)||!contextAllows(info,input))continue;
      const spec=modelSpec(rec.brand,key);if(!spec)continue;
      const chosen=chooseSpecRow(spec,rec);if(!chosen||!stockLengthCompatible(chosen.row,input))continue;
      rec.models.push({model:info.label,advisedSpine:chosen.size,score:0,meta:null,manufacturerVerified:true,manufacturerSpec:chosen.row,manufacturerSource:sourceFor(spec),manufacturerModelKey:key,catalogAuditKey:key,catalogAudit:info,verifiedCatalogInjection:true});
      seen.add(key);
    }
    return rec;
  }

  function auditRecommendation(rec,input){
    if(!rec||!Array.isArray(rec.models)||!['easton','victory','skylon','avalon'].includes(rec.brand))return rec;
    let unknown=0,blocked=0;const kept=[];
    for(const raw of rec.models){
      const entry=canonical(raw,rec.brand),info=entry.catalogAudit;
      if(!info){unknown++;continue;}
      if(!autoStatus.has(info.status)||!contextAllows(info,input)){blocked++;continue;}
      kept.push(entry);
    }
    rec.models=kept;injectVerified(rec,input);
    if(window.AssistantArcherExpertModelRanking?.rankRecommendation&&['easton','victory','skylon'].includes(rec.brand))window.AssistantArcherExpertModelRanking.rankRecommendation(rec,input);
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),`Catalogue ${VERSION} : toutes les familles actuelles Easton/Victory/Skylon/Avalon sont enregistrées; seules celles avec sélection exploitable peuvent être proposées automatiquement.`];
    if(unknown)rec.confidenceReasons.push(`${unknown} ancien libellé ou modèle non reconnu écarté par sécurité.`);
    if(blocked)rec.confidenceReasons.push(`${blocked} famille(s) enregistrée(s) mais hors contexte recurve courant ou sans table de sélection exploitable.`);
    return rec;
  }

  function patch(){
    if(patched||!data||!tech||typeof window.buildBrandRecommendation!=='function'||!window.AssistantArcherExpertModelRanking)return false;
    const original=window.buildBrandRecommendation;
    window.buildBrandRecommendation=function(input,brand){return auditRecommendation(original.apply(this,arguments),input);};
    patched=true;window.AssistantArcherCatalogAudit=Object.freeze({version:VERSION,data,tech,auditRecommendation});return true;
  }

  function polishObjective(){
    const select=document.getElementById('expertObjective'),label=select?.closest('label');if(!select||!label)return;
    const first=label.childNodes[0];if(first?.nodeType===Node.TEXT_NODE)first.nodeValue='Priorité de sélection';
    const labels={progression:'Progression / simplicité',performance:'Polyvalence / performance',competition:'Compétition',elite:'Performance maximale / tuning expert'};
    [...select.options].forEach(o=>{if(labels[o.value])o.textContent=labels[o.value]});
    const hint=label.querySelector('.field-hint');if(hint)hint.textContent='Ce réglage ne classe pas les flèches par niveau. Il départage uniquement des modèles déjà compatibles techniquement.';
  }

  function installBanner(){
    const result=document.getElementById('result');if(!result)return;
    document.getElementById('catalogAuditV15')?.remove();document.getElementById('catalogAuditV17')?.remove();
    const counts=Object.fromEntries(Object.entries(data.brands).map(([b,v])=>[b,Object.keys(v.models).length]));
    const d=document.createElement('details');d.id='catalogAuditV17';d.className='manufacturer-reference-status';d.style.cssText='margin:.65rem 0;padding:.65rem .75rem;border:1px solid rgba(0,0,0,.12);border-radius:10px';
    d.innerHTML=`<summary><strong>Catalogue complet audité — ${VERSION}</strong></summary><p style="margin:.55rem 0 0">Familles enregistrées : Easton ${counts.easton}, Victory ${counts.victory}, Skylon ${counts.skylon}, Avalon ${counts.avalon}. Une famille peut être présente dans le registre sans être auto-recommandable si son tableau fabricant n’est pas exploitable pour ce calcul.</p>`;
    const ref=document.getElementById('manufacturerReferenceV13');if(ref?.nextSibling)result.insertBefore(d,ref.nextSibling);else result.prepend(d);
  }

  function refresh(){polishObjective();patch();installBanner();const release=document.getElementById('appReleaseStatic');if(release&&patched)release.textContent=`Version : ${VERSION}`;}
  async function install(){
    try{
      const [a,e,b]=await Promise.all([fetch(DATA_URL,{cache:'no-store'}),fetch(EXTRA_URL,{cache:'no-store'}),fetch(TECH_URL,{cache:'no-store'})]);
      if(!a.ok||!e.ok||!b.ok)throw new Error(`HTTP catalog=${a.status} extra=${e.status} tech=${b.status}`);
      data=mergeCatalog(await a.json(),await e.json());tech=await b.json();refresh();let n=0;const t=setInterval(()=>{n++;refresh();if(patched||n>100)clearInterval(t);},100);
    }catch(e){console.error('Audit catalogue v17 indisponible',e);}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
