/* Assistant Archer TEST - couche de précision fabricant Pré-alpha v13.
   Une donnée fabricant inconnue reste inconnue. */
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v13';
  const BASE_DATA_URL = 'manufacturer-reference.json?v=20260822-prealpha-v12';
  const EXTRA_DATA_URL = 'manufacturer-reference-v13.json?v=20260822-prealpha-v13';
  const state = { data: null, patched: false, observer: null };
  const norm = value => String(value || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

  const MODEL_ALIASES = [
    ['x10 parallel pro 3 2 mm','x10 parallel pro 3.2 mm'],['3 2mm x10 parallel pro','x10 parallel pro 3.2 mm'],
    ['x10 parallel pro 4 mm','x10 parallel pro 4 mm'],['4mm x10 parallel pro','x10 parallel pro 4 mm'],
    ['xx75 platinum plus','xx75 platinum plus'],['platinum plus','xx75 platinum plus'],
    ['superdrive micro','superdrive micro'],['avance sport','avance'],['avance','avance'],
    ['vector ready to shoot','vector'],['vector','vector'],['a c e','a/c/e'],['ace','a/c/e'],
    ['x23','x23'],['rx7','rx7'],['rx 7','rx7'],['x7','x7'],['x10','x10'],
    ['preminens','preminens'],['premiens','preminens'],['precium','precium'],['performa','performa'],['paragon','paragon'],
    ['brixxon','brixxon'],['radius','radius'],['edge','edge'],['bruxx','bruxx'],['empros','empros'],
    ['vxt elite v1','vxt'],['vxt v1','vxt'],['vxt v3','vxt'],['vxt v6','vxt'],['vxt','vxt'],
    ['vap target','vap'],['vap sport','vap'],['vap gamer v3','vap'],['vap v3','vap'],['vap v1','vap'],['vap v6','vap'],['vap','vap']
  ].sort((a,b)=>b[0].length-a[0].length);

  function modelKey(name){const value=norm(name);for(const [alias,key] of MODEL_ALIASES){if(value.includes(alias))return key;}return '';}
  function sourceUrl(spec){const key=spec?.source;return key&&state.data?.sources?.[key]?state.data.sources[key]:'';}
  function numbersFromRange(label){return (String(label||'').match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(Number.isFinite);}
  function exactNumericSpines(spec){return Object.keys(spec?.spines||{}).map(Number).filter(Number.isFinite);}
  function closest(values,target){const list=values.map(Number).filter(Number.isFinite);if(!list.length)return null;if(!Number.isFinite(Number(target)))return list[0];return list.slice().sort((a,b)=>Math.abs(a-Number(target))-Math.abs(b-Number(target)))[0];}

  function mergeData(base,extra){
    return {
      ...(base||{}), ...(extra||{}),
      policy:{...(base?.policy||{}),...(extra?.policy||{})},
      sources:{...(base?.sources||{}),...(extra?.sources||{})},
      models:{...(base?.models||{}),...(extra?.models||{})}
    };
  }

  function chooseEastonNumericRange(rangeLabel,spec){
    const available=exactNumericSpines(spec);const nums=numbersFromRange(rangeLabel);
    if(!available.length||!nums.length)return null;
    if(nums.length===1)return available.includes(nums[0])?nums[0]:closest(available,nums[0]);
    const low=Math.min(...nums),high=Math.max(...nums);
    const inRange=available.filter(v=>v>=low&&v<=high).sort((a,b)=>b-a);
    return inRange[0]??null; // recurve Easton : côté le plus souple de la plage.
  }

  function chooseEastonAluSize(rangeLabel,spec,key){
    const text=String(rangeLabel||'').toUpperCase();
    const keys=Object.keys(spec?.spines||{});
    if(key==='rx7'){
      const diameter=(text.match(/RX7[- ]?(21|22|23)/)||[])[1];
      if(diameter)return keys.find(k=>k.startsWith(`${diameter}-`))||null;
      const numeric=numbersFromRange(text);
      return keys.find(k=>numeric.includes(Number(k.split('-').pop())))||null;
    }
    const exact=keys.find(k=>new RegExp(`(^|[^0-9])${k}([^0-9]|$)`).test(text));
    if(exact)return exact;
    return null;
  }

  function eastonChoice(rec,entry,spec,key){
    if(!spec?.spines)return null;
    if(['x7','x23','rx7','xx75 platinum plus'].includes(key))return chooseEastonAluSize(rec.primary,spec,key);
    const numeric=chooseEastonNumericRange(rec.primary,spec);
    return numeric==null?null:String(numeric);
  }

  function refineEaston(rec){
    if(!Array.isArray(rec?.models)||rec?.brand!=='easton')return rec;
    const refined=[];
    for(const entry of rec.models){
      const key=modelKey(entry.model),spec=state.data.models?.[key];
      if(!spec||spec.brand!=='Easton'||!spec.spines){refined.push(entry);continue;}
      const chosen=eastonChoice(rec,entry,spec,key);
      if(chosen==null){continue;}
      refined.push({...entry,advisedSpine:String(chosen),manufacturerVerified:true,manufacturerSpec:spec.spines[String(chosen)]||null,manufacturerSource:sourceUrl(spec),manufacturerModelKey:key});
    }
    if(refined.length)rec.models=refined;
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),
      'Tailles Easton recoupées modèle par modèle avec les références réellement fabriquées.',
      'Pour les tableaux recurve Easton à plage de spine, le côté le plus souple compatible est privilégié; les tubes aluminium utilisent leur code de taille exact.'
    ];
    return rec;
  }

  function refineSkylon(rec){
    if(rec?.brand!=='skylon'||!Array.isArray(rec.models))return rec;
    rec.models=rec.models.map(entry=>{
      const key=modelKey(entry.model),spec=state.data.models?.[key];
      if(!spec||spec.brand!=='Skylon'||!spec.spines)return entry;
      const mentioned=numbersFromRange(entry.model).filter(v=>v>=300&&v<=2500);
      let candidates=mentioned.filter(v=>Object.prototype.hasOwnProperty.call(spec.spines,String(v)));
      if(!candidates.length&&entry.advisedSpine)candidates=exactNumericSpines(spec);
      const chosen=closest(candidates,entry.advisedSpine);
      if(chosen==null)return {...entry,manufacturerVerified:false,manufacturerSource:sourceUrl(spec)};
      return {...entry,advisedSpine:String(chosen),manufacturerVerified:true,manufacturerSpec:spec.spines[String(chosen)]||null,manufacturerSource:sourceUrl(spec),manufacturerModelKey:key};
    });
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),'Spines, GPI, diamètres, longueurs, rectitude et pointes Skylon vérifiés sur la fiche exacte du modèle lorsqu’elle existe.'];
    return rec;
  }

  function normalizeVictoryEntry(entry){
    const text=norm(entry.model),key=modelKey(entry.model),spec=state.data.models?.[key];
    if(!spec||spec.brand!=='Victory')return entry;
    let label=spec.name;
    if(key==='vxt'){
      if(text.includes('v1')||text.includes('elite'))label='VXT V1';
      else if(text.includes('v3'))label='VXT V3';
      else if(text.includes('v6'))label='VXT V6';
    }
    if(key==='vap'){
      if(text.includes('v1'))label='VAP V1';
      else if(text.includes('v3')||text.includes('gamer'))label='VAP V3';
      else if(text.includes('v6'))label='VAP V6';
      else label='VAP';
    }
    return {...entry,model:label,manufacturerFamilyVerified:true,manufacturerSource:sourceUrl(spec),manufacturerFamilySpec:spec,manufacturerModelKey:key};
  }

  function refineVictory(rec){
    if(rec?.brand!=='victory'||!Array.isArray(rec.models))return rec;
    const seen=new Set();
    rec.models=rec.models.map(normalizeVictoryEntry).filter(entry=>{
      const key=`${norm(entry.model)}|${entry.advisedSpine||''}`;if(seen.has(key))return false;seen.add(key);return true;
    });
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),
      'Nomenclature Victory cible normalisée en VAP/VXT et grades V1/V3/V6 (rectitude ±.001/±.003/±.006).',
      'VXT traité comme un tube avant parallèle / arrière conique : coupe avant = assouplit, coupe arrière = raidit, maximum 8 pouces retirés à l’avant.',
      'Aucun GPI Victory n’est inventé lorsqu’il n’est pas publié dans une table fabricant exploitable.'
    ];
    return rec;
  }

  function removeCarbonExpress(){
    const select=document.getElementById('preferredBrand');
    const option=select?.querySelector('option[value="carbon"]');
    if(option){if(select.value==='carbon')select.value='all';option.remove();}
    const result=document.getElementById('result');
    result?.querySelectorAll('[data-aa-brand="carbon"], .mini-card').forEach(node=>{
      const text=norm(node.textContent);if(node.dataset?.aaBrand==='carbon'||text.includes('carbon express'))node.remove();
    });
  }

  function patchBuildBrandRecommendation(){
    if(state.patched||typeof window.buildBrandRecommendation!=='function')return;
    const original=window.buildBrandRecommendation;
    window.buildBrandRecommendation=function manufacturerAwareBuild(input,brand){
      const rec=original.apply(this,arguments);if(!rec||!state.data)return rec;
      if(brand==='carbon')return rec; // retiré de l'interface; aucune promotion dans la couche fabricant.
      refineEaston(rec);refineSkylon(rec);refineVictory(rec);return rec;
    };
    state.patched=true;
  }

  function formatSpec(spec,spine){
    const row=spec?.spines?.[String(spine)]||null,p=[];
    if(spec.innerDiameterMm)p.push(`ID ${spec.innerDiameterMm} mm`);else if(spec.innerDiameterIn)p.push(`ID ${spec.innerDiameterIn}\"`);
    if(spec.straightnessIn)p.push(`rectitude ±${spec.straightnessIn}\"`);
    if(spec.weightToleranceGr!=null)p.push(`tolérance poids ±${spec.weightToleranceGr} gr`);
    if(spec.weightTolerancePercent!=null)p.push(`tolérance poids ±${spec.weightTolerancePercent}%`);
    if(row?.deflection!=null)p.push(`déflexion ${row.deflection}\"`);
    if(row?.gpi!=null)p.push(`${row.gpi} GPI`);
    if(row?.odMm!=null)p.push(`OD ${row.odMm} mm`);if(row?.odIn!=null)p.push(`OD ${row.odIn}\"`);
    if(row?.lengthIn!=null)p.push(`longueur stock ${row.lengthIn}\"`);
    if(Array.isArray(row?.pointGr)&&row.pointGr.length)p.push(`pointes ${row.pointGr.join('/')} gr`);
    if(row?.maxTrimIn!=null)p.push(`coupe avant max ${row.maxTrimIn}\"`);
    return p.join(' · ');
  }

  function inferSpineFromText(text,spec){
    if(!spec?.spines)return null;const raw=String(text||'');
    const keys=Object.keys(spec.spines).sort((a,b)=>b.length-a.length);
    return keys.find(k=>raw.includes(k))||null;
  }

  function decorateManufacturerData(){
    const result=document.getElementById('result');if(!result||!state.data)return;
    result.querySelectorAll('li').forEach(li=>{
      if(li.querySelector(':scope > .manufacturer-reference-line'))return;
      const strong=li.querySelector('strong');if(!strong)return;
      const key=modelKey(strong.textContent),spec=state.data.models?.[key];if(!spec)return;
      const spine=inferSpineFromText(li.textContent,spec),technical=formatSpec(spec,spine),source=sourceUrl(spec);
      const grade=spec.grades?`Grades ${Object.entries(spec.grades).map(([n,t])=>`${n} ±${t}\"`).join(' · ')}`:'';
      const line=document.createElement('p');line.className='manufacturer-reference-line muted';line.style.cssText='margin:.35rem 0 .15rem;font-size:.82rem;line-height:1.35';
      line.innerHTML=`<strong>Donnée fabricant :</strong> ${technical||grade||spec.purpose||'fiche vérifiée'}${source?` · <a href="${source}" target="_blank" rel="noopener noreferrer">source</a>`:''}`;
      li.appendChild(line);
    });
  }

  function installReferenceBanner(){
    const result=document.getElementById('result');if(!result)return;
    document.getElementById('manufacturerReferenceV12')?.remove();document.getElementById('manufacturerReferenceV13')?.remove();
    const details=document.createElement('details');details.id='manufacturerReferenceV13';details.className='manufacturer-reference-status';details.style.cssText='margin:.65rem 0;padding:.65rem .75rem;border:1px solid rgba(0,0,0,.12);border-radius:10px';
    details.innerHTML=`<summary><strong>Références fabricant vérifiées — ${VERSION}</strong></summary><p style="margin:.55rem 0 0">Easton, Victory et Skylon sont traités avec leurs caractéristiques fabricant par modèle. Les estimations restent séparées. Carbon Express a été retiré du périmètre de recommandation TEST.</p>`;
    const heading=result.querySelector('h2');if(heading?.nextSibling)result.insertBefore(details,heading.nextSibling);else result.prepend(details);
  }

  function refresh(){removeCarbonExpress();patchBuildBrandRecommendation();installReferenceBanner();decorateManufacturerData();}

  async function install(){
    try{
      const [baseResponse,extraResponse]=await Promise.all([fetch(BASE_DATA_URL,{cache:'no-store'}),fetch(EXTRA_DATA_URL,{cache:'no-store'})]);
      if(!baseResponse.ok||!extraResponse.ok)throw new Error(`HTTP base=${baseResponse.status} extra=${extraResponse.status}`);
      state.data=mergeData(await baseResponse.json(),await extraResponse.json());
      window.AssistantArcherManufacturerReference=Object.freeze({version:VERSION,data:state.data,model:name=>state.data.models?.[modelKey(name)]||null,refresh});
      const release=document.getElementById('appReleaseStatic');if(release)release.textContent=`Version : ${VERSION}`;
      refresh();
      const result=document.getElementById('result');if(result){let queued=false;state.observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});});state.observer.observe(result,{childList:true,subtree:true});}
    }catch(error){console.error('Assistant Archer: chargement référence fabricant impossible',error);}
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
