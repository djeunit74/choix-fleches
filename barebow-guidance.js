/* Barebow : le formulaire de saisie est commun au classique ; seules les interpretations sont adaptees. */
(() => {
  const originalUpdateArcSetupCopyForBowStyle = window.updateArcSetupCopyForBowStyle;

  window.updateArcSetupCopyForBowStyle=function(style){
    originalUpdateArcSetupCopyForBowStyle(style);
    if(window.normalizeBowStyle(style)!=='barebow')return;
    const ref=document.getElementById('arcSetupDocRef');
    if(ref)ref.innerHTML='Sources : <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> · <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery - Coaching Manual Level 2</a>.';
  };

  /* Charge la mise en page commune. Aucun champ barebow parallele n est cree ici. */
  const old=document.getElementById('barebowArcSetupCard');
  if(old)old.remove();
  if(!document.querySelector('script[data-barebow-layout]')){
    const s=document.createElement('script');
    s.src='barebow-layout.js?v=20260814e';
    s.dataset.barebowLayout='true';
    document.head.appendChild(s);
  }
  if(!document.querySelector('script[data-expert-audit]')){
    const s=document.createElement('script');
    s.src='expert-audit.js?v=20260814b';
    s.dataset.expertAudit='true';
    document.head.appendChild(s);
  }
  if(!document.querySelector('script[data-merchant-fix]')){
    const s=document.createElement('script');
    s.src='merchant-fix.js?v=20260814a';
    s.dataset.merchantFix='true';
    document.head.appendChild(s);
  }
})();