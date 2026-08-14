/* Barebow : meme formulaire de reglage de base que le classique ; seule l interpretation change. */
(() => {
  function field(id){return document.getElementById(id)}
  function classicSetupCard(){return field('upperTiller')?.closest('.subcard')||null}
  function findPowerCard(){return field('riserLength')?.closest('.subcard')||null}
  function forceSharedLayout(){
    const bare=field('bowStyle')?.value==='barebow';
    const classic=classicSetupCard();
    const power=findPowerCard();
    const legacy=field('barebowArcSetupCard');
    [classic,power].forEach(card=>{if(!card)return;card.classList.remove('arc-classic-only');card.hidden=false;card.removeAttribute('hidden');card.style.setProperty('display','block','important')});
    if(legacy){legacy.hidden=true;legacy.setAttribute('hidden','');legacy.style.setProperty('display','none','important')}
    if(!bare)return;
    const heading=field('arcSetupHeading');
    const intro=field('arcSetupIntro');
    if(heading)heading.textContent='Reglage de base';
    if(intro)intro.textContent='Renseignez les mesures principales de l arc, puis lancez le calcul. Les resultats sont interpretes pour le barebow.';
    const p=classic?.querySelector('p');
    if(p)p.innerHTML='Le <strong>band</strong> depend surtout de la taille d arc. Le tiller se calcule avec les deux distances corde / branches. En barebow, partez d un tiller faible puis affinez au tir.';
    const pp=power?.querySelector('p');
    if(pp)pp.innerHTML='La puissance tiree estimee utilise la <strong>taille de poignee</strong>, la <strong>puissance marquee des branches</strong> et l <strong>allonge reelle</strong>.';
  }
  const observer=new MutationObserver(()=>forceSharedLayout());
  const panel=document.querySelector('[data-panel="arc-setup"]');
  if(panel)observer.observe(panel,{attributes:true,subtree:true,attributeFilter:['hidden','class','style']});
  field('bowStyle')?.addEventListener('change',()=>{forceSharedLayout();requestAnimationFrame(forceSharedLayout);setTimeout(forceSharedLayout,100)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-tab="arc-setup"]'))setTimeout(forceSharedLayout,0)});
  forceSharedLayout();
  requestAnimationFrame(forceSharedLayout);
  setTimeout(forceSharedLayout,250);
  setTimeout(forceSharedLayout,1200);
})();