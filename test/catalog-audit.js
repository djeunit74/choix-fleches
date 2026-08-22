/* Assistant Archer TEST - audit catalogue fabricant Pré-alpha v16. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v16';
  const DATA_URL='catalog-audit-v15.json?v=20260822-prealpha-v15';
  let data=null,patched=false;
  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const aliases=[
    ['x10 parallel pro 3 2 mm','x10 parallel pro 3.2 mm'],['x10 parallel pro 4 mm','x10 parallel pro 4 mm'],['xx75 platinum plus','xx75 platinum plus'],
    ['v tac 23','v-tac 23'],['v tac23','v-tac 23'],['vft gamer v3','vft'],['vft','vft'],['3dhv','3dhv'],['vx 27','vx-27'],
    ['premiens','preminens'],['preminens','preminens'],['superdrive micro','superdrive micro'],['avance sport','avance sport'],['avance','avance'],
    ['vector','vector'],['a c e','a/c/e'],['ace','a/c/e'],['rx7','rx7'],['x23','x23'],['x7','x7'],['x10','x10'],
    ['novice','novice'],['radius','radius'],['brixxon','brixxon'],['performa','performa'],['precium','precium'],['paragon','paragon'],['bruxx','bruxx'],['empros','empros'],['edge','edge'],['vap','vap'],['vxt','vxt']
  ].sort((a,b)=>b[0].length-a[0].length);
  const keyOf=name=>{const t=norm(name);for(const [a,k] of aliases)if(t.includes(a))return k;return t;};
  const registry=(brand,key)=>data?.brands?.[brand]?.models?.[key]||null;
  const blockedStatus=new Set(['discontinued','nonrecurve_default','traditional','out_of_scope','ruleset_required','audited_pending_selector']);

  function canonical(entry,brand){
    let model=String(entry.model||''); const key=keyOf(model);
    if(key==='preminens') model=model.replace(/premiens/i,'Preminens');
    if(key==='vft') model=/v3|gamer/i.test(model)?'VFT V3':'VFT';
    if(key==='v-tac 23') model=/elite|v1/i.test(model)?'V-Tac 23 V1':'V-Tac 23';
    return {...entry,model,catalogAuditKey:key,catalogAudit:registry(brand,key)||null};
  }

  function numbers(label){
    return (String(label||'').match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(Number.isFinite);
  }

  function chooseNumericManufacturerSpine(primary,spec){
    const available=Object.keys(spec?.spines||{}).map(Number).filter(Number.isFinite);
    const requested=numbers(primary);
    if(!available.length||!requested.length)return null;
    if(requested.length===1){
      const exact=requested[0];
      if(available.includes(exact))return exact;
      return available.slice().sort((a,b)=>Math.abs(a-exact)-Math.abs(b-exact))[0]??null;
    }
    const low=Math.min(...requested),high=Math.max(...requested);
    const within=available.filter(v=>v>=low&&v<=high).sort((a,b)=>b-a);
    return within[0]??null;
  }

  function injectAuditedEastonFamilies(rec,input){
    if(rec?.brand!=='easton'||!Array.isArray(rec.models))return rec;
    const ref=window.AssistantArcherManufacturerReference;
    if(!ref?.data?.models)return rec;

    const environment=input?.shootingEnvironment||document.getElementById('shootingEnvironment')?.value||'outdoor';
    if(environment==='indoor')return rec;

    const wanted=['x10','a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm'];
    const present=new Set(rec.models.map(e=>keyOf(e.model)));
    for(const key of wanted){
      if(present.has(key))continue;
      const audit=registry('easton',key);
      const spec=ref.data.models?.[key];
      if(!audit||blockedStatus.has(audit.status)||!spec?.spines)continue;
      const spine=chooseNumericManufacturerSpine(rec.primary,spec);
      if(spine==null)continue;
      const row=spec.spines[String(spine)]||null;
      const requestedLength=Number(input?.arrowLength);
      const stockLength=Number(row?.lengthIn);
      if(Number.isFinite(requestedLength)&&Number.isFinite(stockLength)&&stockLength+1e-9<requestedLength)continue;
      rec.models.push({
        model:spec.name||audit.name||key,
        advisedSpine:String(spine),
        score:0,
        meta:null,
        manufacturerVerified:true,
        manufacturerSpec:row,
        manufacturerSource:ref.data.sources?.[spec.source]||'',
        manufacturerModelKey:key,
        injectedFromManufacturerCatalog:true
      });
    }
    return rec;
  }

  function auditRecommendation(rec,input){
    if(!rec||!Array.isArray(rec.models)||!['easton','victory','skylon'].includes(rec.brand))return rec;
    let unknown=0,blocked=0; const kept=[];
    for(const raw of rec.models){
      const entry=canonical(raw,rec.brand), info=entry.catalogAudit;
      if(!info){unknown++;continue;}
      if(blockedStatus.has(info.status)){blocked++;continue;}
      kept.push(entry);
    }
    rec.models=kept;
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),`Audit catalogue ${VERSION} : seules les familles Easton/Victory/Skylon explicitement auditées et compatibles avec le périmètre recurve sont conservées.`];
    if(unknown)rec.confidenceReasons.push(`${unknown} modèle(s) non audité(s) écarté(s) par sécurité.`);
    if(blocked)rec.confidenceReasons.push(`${blocked} modèle(s) écarté(s) car discontinué(s), hors recurve ou nécessitant un règlement spécifique.`);
    return rec;
  }

  function patch(){
    if(patched||!data||typeof window.buildBrandRecommendation!=='function'||!window.AssistantArcherExpertModelRanking||!window.AssistantArcherManufacturerReference)return false;
    const original=window.buildBrandRecommendation;
    window.buildBrandRecommendation=function(input,brand){
      let rec=original.apply(this,arguments);
      rec=injectAuditedEastonFamilies(rec,input);
      if(rec?.brand==='easton'&&rec.models?.some(e=>e.injectedFromManufacturerCatalog)){
        rec=window.AssistantArcherExpertModelRanking.rankRecommendation(rec,input);
      }
      return auditRecommendation(rec,input);
    };
    patched=true;
    window.AssistantArcherCatalogAudit=Object.freeze({version:VERSION,data,auditRecommendation,injectAuditedEastonFamilies});
    return true;
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
    document.getElementById('catalogAuditV15')?.remove();
    if(document.getElementById('catalogAuditV16'))return;
    const counts=Object.fromEntries(Object.entries(data.brands).map(([b,v])=>[b,Object.keys(v.models).length]));
    const d=document.createElement('details');d.id='catalogAuditV16';d.className='manufacturer-reference-status';d.style.cssText='margin:.65rem 0;padding:.65rem .75rem;border:1px solid rgba(0,0,0,.12);border-radius:10px';
    d.innerHTML=`<summary><strong>Couverture catalogue vérifiée — ${VERSION}</strong></summary><p style="margin:.55rem 0 0">Inventaire audité : Easton ${counts.easton} familles/références, Victory ${counts.victory}, Skylon ${counts.skylon}. Les familles Easton cible auditées absentes de l’ancien catalogue interne (X10, A/C/E et X10 Parallel Pro) sont maintenant injectées directement depuis la référence fabricant avant classement.</p>`;
    const ref=document.getElementById('manufacturerReferenceV13');if(ref?.nextSibling)result.insertBefore(d,ref.nextSibling);else result.prepend(d);
  }

  function refresh(){polishObjective();patch();installBanner();const release=document.getElementById('appReleaseStatic');if(release&&patched)release.textContent=`Version : ${VERSION}`;}
  async function install(){try{const r=await fetch(DATA_URL,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);data=await r.json();refresh();let n=0;const t=setInterval(()=>{n++;refresh();if(patched||n>100)clearInterval(t);},100);}catch(e){console.error('Audit catalogue v16 indisponible',e);}}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
