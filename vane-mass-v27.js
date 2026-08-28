/* Assistant Archer TEST - masse d'empennage complete et confiance FOC, Pré-alpha v28. */
(() => {
  'use strict';
  const VERSION='Pré-alpha v28';
  const DATA_URL='./vane-mass-v27.json?v=20260822-prealpha-v27';
  let masses=new Map();
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  function flatten(data){
    const out=[];
    for(const entry of data.masses||[]){
      out.push(entry);
      for(const variant of entry.variants||[]) out.push({...entry,...variant,variants:undefined});
    }
    return out;
  }
  function fmtRange(range){
    if(!Array.isArray(range)||range.length<2)return '';
    const [a,b]=range.map(Number);if(!Number.isFinite(a)||!Number.isFinite(b))return '';
    return Math.abs(a-b)<1e-9?`${a.toFixed(1)} gr`:`${a.toFixed(1)}–${b.toFixed(1)} gr`;
  }
  function annotate(){
    document.querySelectorAll('[data-vane]').forEach(button=>{
      const card=button.closest('.arrow-component-card');const mass=masses.get(button.dataset.vane||'');
      if(!card||!mass)return;
      card.querySelector('.vane-mass-confidence')?.remove();
      const p=document.createElement('p');p.className='vane-mass-confidence muted';
      const raw=mass.weight||'masse plume non verrouillée';
      if(mass.focUsable===true&&Number.isFinite(Number(mass.focAssemblyMassGrains))){
        const range=fmtRange(mass.focAssemblyRangeGrains);
        const fixation=mass.mountingProfile==='direct-measured-assembly'?'ensemble directement pesé':mass.mountingProfile==='spin-tape'?'double-face + ruban inclus (proxy documenté)':mass.mountingProfile==='glue-average'?'colle incluse (moyenne fabricant)':'fixation incluse';
        p.innerHTML=`<strong>Masse plume :</strong> ${esc(raw)} · <strong>FOC :</strong> empennage complet ${Number(mass.focAssemblyMassGrains).toFixed(2)} gr${range?` (plage ${esc(range)})`:''} · ${esc(fixation)} · confiance ${esc(mass.weightConfidence||'non définie')}.`;
      }else{
        p.innerHTML=`<strong>Masse plume :</strong> ${esc(raw)} · <strong>FOC théorique non calculé avec cette plume</strong> : masse/fixation insuffisamment verrouillée.`;
      }
      if(mass.note){const small=document.createElement('span');small.style.display='block';small.textContent=mass.note;p.appendChild(small);}
      const source=card.querySelector('.arrow-source');source?source.before(p):card.appendChild(p);
    });
    const release=document.getElementById('appReleaseStatic');if(release)release.textContent=`Version : ${VERSION}`;
  }
  async function install(){
    try{
      const response=await fetch(DATA_URL,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();masses=new Map(flatten(data).map(x=>[x.id,x]));annotate();
      let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;annotate();});}).observe(document.body,{childList:true,subtree:true});
      window.AssistantArcherVaneMass=Object.freeze({version:VERSION,data});
    }catch(error){console.warn('[Assistant Archer] masses empennages v28 indisponibles',error);}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
