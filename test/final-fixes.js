/* TEST v30 : modeles Easton compatibles + offres marchands coherentes. */
(() => {
 const VERSION='2026.08.18-test.30';
 const MODELS=[
  {name:'Avance / Avance Sport',aliases:['avance sport','avance'],material:'Carbone',spines:[340,400,450,500,550,600,660,730,810,900,1000,1150,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Tube carbone 4 mm de cible. Pertinent en arc classique ou arc nu pour la cible et la progression vers la competition.'},
  {name:'Superdrive Micro',aliases:['superdrive micro'],material:'Carbone',spines:[325,375,425,475,525,575,625,675,750,850,950],bows:['recurve','barebow','compound'],why:'Tube carbone 4 mm oriente performance exterieure, campagne et 3D lorsque la discipline le justifie.'},
  {name:'Vector',aliases:['vector'],material:'Carbone',spines:[600,800,1000,1200,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Tube carbone accessible, adapte au club, a la progression et au loisir cible.'},
  {name:'Vector Ready To Shoot',aliases:['vector ready to shoot','vector rts'],material:'Carbone',spines:[600,800,1000,1200,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Version prete a tirer du Vector, utile pour debuter avec une configuration simple.'},
  {name:'X10',aliases:['x10'],material:'Aluminium/Carbone — hybride',spines:[325,350,380,410,450,500,550,600,650,700,750,830,900,1000],bows:['recurve','compound'],why:'Tube aluminium/carbone haut de gamme pour la cible et la competition exterieure.'},
  {name:'A/C/E',aliases:['a/c/e','a c e',' ace '],material:'Aluminium/Carbone — hybride',spines:[370,400,430,470,520,570,620,670,720,780,850,920,1000,1100,1250],bows:['recurve','compound'],why:'Tube aluminium/carbone de cible, pertinent pour la performance et les longues distances.'},
  {name:'X10 Parallel Pro 4 mm',aliases:['x10 parallel pro','parallel pro'],material:'Aluminium/Carbone — hybride',spines:[250,300,340,380,420,470,520,570,610,660,710,810,880,1000,1150],bows:['recurve','compound'],why:'Tube aluminium/carbone 4 mm de competition cible lorsque sa taille couvre la plage fabricant.'}
 ];
 function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
 function bow(){const raw=(document.getElementById('bowType')?.value||document.querySelector('[name="bowType"]:checked')?.value||document.getElementById('bowStyle')?.value||document.documentElement.dataset.bowType||'recurve').toLowerCase();return /bare|nu/.test(raw)?'barebow':/compound|poul/.test(raw)?'compound':'recurve'}
 function settings(){const s=document.querySelector('.app-settings-toggle');if(s)s.innerHTML='<span class="gear-icon" aria-hidden="true">⚙</span><span class="settings-label">Réglages Paramètres</span>';const b=document.querySelector('.app-settings-body');if(!b)return;const sv=document.getElementById('appVersionStatic');if(sv)sv.textContent='Version : '+VERSION;document.getElementById('appVersionInfo')?.remove();if(!document.getElementById('appUpdateBtn')){const d=document.createElement('div');d.className='app-update-setting';d.style.cssText='margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)';d.innerHTML='<button type="button" id="appUpdateBtn">Mettre a jour l\'application</button><p id="appUpdateStatus">Force le chargement de la derniere version TEST.</p>';d.querySelector('button').onclick=async()=>{const st=d.querySelector('p');st.textContent='Mise a jour...';try{if('serviceWorker'in navigator){for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}if(window.caches){for(const k of await caches.keys())await caches.delete(k)}const u=new URL(location.href);u.searchParams.set('v',Date.now());location.replace(u.toString())}catch(e){st.textContent='Echec de mise a jour.'}};b.appendChild(d)}}
 function labels(){const g=document.getElementById('aaNeedsGuide');if(!g)return;const n=g.querySelector('[data-go="notebook"]'),s=g.querySelector('[data-go="sight"]');if(n)n.textContent='Enregistrer / retrouver mes reglages';if(s)s.textContent='Enregistrer / consulter mes reperes'}
 function packageLabel(title){const t=norm(title);if(/\b(douzaine|lot de 12|12 tubes|12 futs)\b/.test(t))return'lot de 12';if(/\b(unite|a l unite|tube carbone competition|tube aluminium)\b/.test(t)&&!t.includes('tubes'))return'prix a l unite';return'conditionnement a verifier'}
 function matchesModel(title,model){const t=' '+norm(title)+' ';return model.aliases.some(a=>{const n=norm(a);if(n==='x10'&&t.includes(' parallel pro '))return false;if(n==='vector'&&(t.includes(' ready to shoot ')||t.includes(' vector rts ')))return false;return t.includes(' '+n+' ')||t.includes(n)})}
 function filterMerchantOffers(r,compatible,min,max){
  const allowed=compatible;
  const blocks=[...r.querySelectorAll('.merchant-block')];
  if(!blocks.length)return;
  blocks.forEach(block=>{
   const key=`${min}-${max}-${allowed.map(x=>x.name).join('|')}`;
   if(block.dataset.eastonFilterKey===key)return;
   block.dataset.eastonFilterKey=key;
   let kept=0;
   block.querySelectorAll('.merchant-deals li').forEach(li=>{
    const a=li.querySelector('a');const title=a?.textContent||li.textContent||'';const model=allowed.find(m=>matchesModel(title,m));
    if(!model){li.remove();return}
    kept++;
    li.querySelector('.aa-offer-meta')?.remove();
    const meta=document.createElement('div');meta.className='aa-offer-meta';meta.style.cssText='font-size:.88em;margin-top:.2rem;opacity:.82';meta.textContent=`Modele coherent : ${model.name} · ${model.material} · ${packageLabel(title)}`;li.appendChild(meta);
   });
   block.querySelectorAll('.merchant-shop').forEach(shop=>{if(!shop.querySelector('.merchant-deals li'))shop.remove()});
   let intro=block.querySelector('.merchant-intro');if(!intro){intro=document.createElement('p');intro.className='merchant-intro';block.prepend(intro)}
   if(kept){intro.innerHTML=`<strong>Offres marchands filtrees :</strong> uniquement les modeles Easton compatibles avec la plage ${min}-${max} et le type d arc selectionne. Les prix viennent de la base marchands actualisee quotidiennement.`}
   else{intro.innerHTML=`<strong>Aucune offre marchande coherente actuellement :</strong> aucun prix de notre base quotidienne ne correspond aux modeles Easton compatibles avec la plage ${min}-${max}. L application n affiche pas d offre de remplacement hors recommandation.`}
  })
 }
 function easton(){const r=document.getElementById('result');if(!r||!/Recommandation\s+Easton/i.test(r.textContent||''))return;
  const text=r.textContent||'';let min,max;let m=text.match(/(?:base\s+)?(\d{3,4})\s*[-–]\s*(\d{3,4})\s*\/\s*eq\.\s*(\d{3,4})/i)||text.match(/Plage fabricant\s*:\s*(\d{3,4})\s*[-–]\s*(\d{3,4})/i);if(m){min=Math.min(+m[1],+m[2]);max=Math.max(+m[1],+m[2])}else return;
  r.querySelectorAll('.easton-compatible-models').forEach(x=>x.remove());r.querySelectorAll('p,li').forEach(el=>{if(/^\s*Alternatives spine\s*:/i.test(el.textContent||''))el.remove()});
  const old=[...r.querySelectorAll('p,div')].find(el=>/^\s*Modeles conseilles\s*:/i.test(el.textContent||''));if(old){const nx=old.nextElementSibling;if(nx?.tagName==='UL')nx.remove();old.remove()}
  const currentBow=bow();const compatible=MODELS.map(x=>({...x,available:x.spines.filter(s=>s>=min&&s<=max)})).filter(x=>x.bows.includes(currentBow)&&x.available.length);
  const sec=document.createElement('section');sec.className='easton-compatible-models';sec.style.cssText='margin-top:1rem;padding:1rem;border:1px solid #d7d7d7;border-radius:14px;background:#fff';sec.innerHTML=`<p><strong>Modeles Easton compatibles avec cette plage</strong></p><p>Plage fabricant ${min}-${max}. Un modele est affiche seulement si une taille reellement fabriquee tombe dans cette zone pour le type d arc selectionne.</p>`;
  const ul=document.createElement('ul');compatible.forEach(x=>{const li=document.createElement('li');li.style.marginBottom='.8rem';li.innerHTML=`<strong>${x.name}</strong> — <strong>${x.material}</strong> — spine(s) disponible(s) : <strong>${x.available.join(', ')}</strong>.<br><span><strong>Pourquoi :</strong> ${x.why}</span>`;ul.appendChild(li)});if(!compatible.length){const li=document.createElement('li');li.textContent='Aucun modele de la base verifiee ne possede actuellement une taille dans cette plage pour cet arc.';ul.appendChild(li)}sec.appendChild(ul);
  const note=document.createElement('p');note.innerHTML='<strong>Important :</strong> le choix final reste a confirmer par les composants, l usage et l affinage au tir.';sec.appendChild(note);
  const source=[...r.querySelectorAll('p,div')].find(el=>/^\s*Sources des tableaux\s*:/i.test(el.textContent||''));if(source)source.before(sec);else{const merchant=r.querySelector('.merchant-block');merchant?merchant.before(sec):r.appendChild(sec)}
  filterMerchantOffers(r,compatible,min,max);
 }
 let queued=false;function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;settings();labels();easton()})}
 function init(){document.documentElement.dataset.testFixVersion=VERSION;run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('submit',()=>{setTimeout(run,0);setTimeout(run,100);setTimeout(run,400)},true);document.addEventListener('change',()=>setTimeout(run,50),true)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
