/* Barebow : meme formulaire de reglage de base que le classique ; seule l interpretation change. */
(() => {
  function field(id){return document.getElementById(id)}

  function findPowerCard(){
    return [...document.querySelectorAll('[data-panel="arc-setup"] .subcard')].find(section=>section.querySelector('h3')?.textContent.trim().toLowerCase().includes('puissance tiree estimee'))||null;
  }

  function classicSetupCard(){
    const upper=field('upperTiller');
    return upper?.closest('.subcard')||null;
  }

  function applyMode(){
    const bare=field('bowStyle')?.value==='barebow';
    const classic=classicSetupCard();
    const oldBare=field('barebowArcSetupCard');
    const power=findPowerCard();

    /* Un seul formulaire pour les deux types d arc. */
    if(classic){
      classic.classList.remove('arc-classic-only');
      classic.hidden=false;
      classic.style.display='';
    }
    if(oldBare){
      oldBare.hidden=true;
      oldBare.style.display='none';
    }

    if(power){
      power.classList.remove('arc-classic-only');
      power.hidden=false;
      power.style.display='';
      const p=power.querySelector('p');
      if(p)p.innerHTML='Le calcul utilise la <strong>taille de poignee</strong>, la <strong>puissance marquee des branches</strong> et l <strong>allonge reelle</strong>. Il donne une estimation de la puissance tiree.';
    }

    const heading=field('arcSetupHeading');
    const intro=field('arcSetupIntro');
    if(bare){
      if(heading)heading.textContent='Reglage de base';
      if(intro)intro.textContent='Renseignez les memes mesures de l arc : taille, distances corde/branches, band, puissance des branches et allonge. L interpretation est adaptee au barebow.';
    }
  }

  const bow=field('bowStyle');
  if(bow)bow.addEventListener('change',()=>setTimeout(applyMode,30));
  setTimeout(applyMode,250);
  setTimeout(applyMode,1200);
})();