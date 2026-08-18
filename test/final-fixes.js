/* TEST v29 : affichage robuste des modeles Easton compatibles. */
(() => {
 const VERSION='2026.08.18-test.29';
 const MODELS=[
  {name:'Avance / Avance Sport',spines:[340,400,450,500,550,600,660,730,810,900,1000,1150,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Tube carbone 4 mm de cible. Pertinent en arc classique ou arc nu pour la cible et la progression vers la competition.'},
  {name:'Superdrive Micro',spines:[325,375,425,475,525,575,625,675,750,850,950],bows:['recurve','barebow','compound'],why:'Tube carbone 4 mm oriente performance exterieure, campagne et 3D lorsque la discipline le justifie.'},
  {name:'Vector',spines:[600,800,1000,1200,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Tube carbone accessible, adapte au club, a la progression et au loisir cible.'},
  {name:'Vector Ready To Shoot',spines:[600,800,1000,1200,1400,1600,1800,2000],bows:['recurve','barebow'],why:'Version prete a tirer du Vector, utile pour debuter avec une configuration simple.'},
  {name:'X10',spines:[325,350,380,410,450,500,550,600,650,700,750,830,900,1000],bows:['recurve','compound'],why:'Tube aluminium/carbone haut de gamme pour la cible et la competition exterieure.'},
  {name:'A/C/E',spines:[370,400,430,470,520,570,620,670,720,780,850,920,1000,1100,1250],bows:['recurve','compound'],why:'Tube aluminium/carbone de cible, pertinent pour la performance et les longues distances.'},
  {name:'X10 Parallel Pro 4 mm',spines:[250,300,340,380,420,470,520,570,610,660,710,810,880,1000,1150],bows:['recurve','compound'],why:'Tube aluminium/carbone 4 mm de competition cible lorsque sa taille couvre la plage fabricant.'}
 ];
 function bow(){const raw=(document.getElementById('bowType')?.value||document.querySelector('[name="bowType"]:checked')?.value||document.documentElement.dataset.bowType||'recurve').toLowerCase();return /bare|nu/.test(raw)?'barebow':/compound|poul/.test(raw)?'compound':'recurve'}
 function settings(){const s=document.querySelector('.app-settings-toggle');if(s)s.innerHTML='<span class="gear-icon" aria-hidden="true">⚙</span><span class="settings-label">Réglages Paramètres</span>';const b=document.querySelector('.app-settings-body');if(!b)return;const sv=document.getElementById('appVersionStatic');if(sv)sv.textContent='Version : '+VERSION;let v=document.getElementById('appVersionInfo');if(v)v.remove();if(!document.getElementById('appUpdateBtn')){const d=document.createElement('div');d.className='app-update-setting';d.style.cssText='margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)';d.innerHTML='<button type="button" id="appUpdateBtn">Mettre a jour l\'application</button><p id="appUpdateStatus">Force le chargement de la derniere version TEST.</p>';d.querySelector('button').onclick=async()=>{const st=d.querySelector('p');st.textContent='Mise a jour...';try{if('serviceWorker'in navigator){for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}if(window.caches){for(const k of await caches.keys())await caches.delete(k)}const u=new URL(location.href);u.searchParams.set('v',Date.now());location.replace(u.toString())}catch(e){st.textContent='Echec de mise a jour.'}};b.appendChild(d)}}
 function labels(){const g=document.getElementById('aaNeedsGuide');if(!g)return;const n=g.querySelector('[data-go="notebook"]'),s=g.querySelector('[data-go="sight"]');if(n)n.textContent='Enregistrer / retrouver mes reglages';if(s)s.textContent='Enregistrer / consulter mes reperes'}
 function easton(){const r=document.getElementById('result');if(!r||!/Recommandation\s+Easton/i.test(r.textContent||''))return;
  const text=r.textContent||'';let min,max;
  let m=text.match(/(?:base\s+)?(\d{3,4})\s*[-–]\s*(\d{3,4})\s*\/\s*eq\.\s*(\d{3,4})/i)||text.match(/Plage fabricant\s*:\s*(\d{3,4})\s*[-–]\s*(\d{3,4})/i);
  if(m){min=Math.min(+m[1],+m[2]);max=Math.max(+m[1],+m[2])}else return;
  r.querySelectorAll('.easton-compatible-models').forEach(x=>x.remove());
  r.querySelectorAll('p,li').forEach(el=>{if(/^\s*Alternatives spine\s*:/i.test(el.textContent||''))el.remove()});
  const old=[...r.querySelectorAll('p,div')].find(el=>/^\s*Modeles conseilles\s*:/i.test(el.textContent||''));if(old){const nx=old.nextElementSibling;if(nx?.tagName==='UL')nx.remove();old.remove()}
  const currentBow=bow();const compatible=MODELS.map(x=>({...x,available:x.spines.filter(s=>s>=min&&s<=max)})).filter(x=>x.bows.includes(currentBow)&&x.available.length);
  const sec=document.createElement('section');sec.className='easton-compatible-models';sec.style.cssText='margin-top:1rem;padding:1rem;border:1px solid #d7d7d7;border-radius:14px;background:#fff';
  const title=document.createElement('p');title.innerHTML='<strong>Modeles Easton compatibles avec cette plage</strong>';sec.appendChild(title);
  const intro=document.createElement('p');intro.textContent=`Plage fabricant ${min}-${max}. Les modeles ci-dessous ne sont affiches que si Easton fabrique au moins une taille dans cette zone pour le type d arc selectionne.`;sec.appendChild(intro);
  const ul=document.createElement('ul');compatible.forEach(x=>{const li=document.createElement('li');li.style.marginBottom='.8rem';li.innerHTML=`<strong>${x.name}</strong> — spine(s) disponible(s) dans la plage : <strong>${x.available.join(', ')}</strong>.<br><span><strong>Pourquoi :</strong> ${x.why}</span>`;ul.appendChild(li)});if(!compatible.length){const li=document.createElement('li');li.textContent='Aucun modele de la base verifiee ne possede actuellement une taille dans cette plage pour cet arc.';ul.appendChild(li)}sec.appendChild(ul);
  const note=document.createElement('p');note.innerHTML='<strong>Important :</strong> cette liste filtre les modeles et les tailles disponibles ; le choix final reste a confirmer par l usage, les composants et l affinage au tir.';sec.appendChild(note);
  const source=[...r.querySelectorAll('p,div')].find(el=>/^\s*Sources des tableaux\s*:/i.test(el.textContent||''));if(source)source.before(sec);else{const offers=[...r.querySelectorAll('*')].find(el=>/Offres chez les marchands/i.test(el.textContent||'')&&el.children.length<5);offers?offers.before(sec):r.appendChild(sec)}
 }
 let queued=false;function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;settings();labels();easton()})}
 function init(){document.documentElement.dataset.testFixVersion=VERSION;run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('submit',()=>{setTimeout(run,0);setTimeout(run,100);setTimeout(run,400)},true);document.addEventListener('change',()=>setTimeout(run,50),true)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
