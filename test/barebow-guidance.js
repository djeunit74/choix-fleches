/* Barebow : mise en page commune au classique. Ce module ne gere que l'affichage barebow. */
(() => {
  function field(id){ return document.getElementById(id); }
  function setupCard(){ return field('upperTiller')?.closest('.subcard') || null; }
  function powerCard(){ return field('riserLength')?.closest('.subcard') || null; }

  function applyBarebowLayout(){
    const isBarebow = field('bowStyle')?.value === 'barebow';
    const setup = setupCard();
    const power = powerCard();
    const legacy = field('barebowArcSetupCard');

    /* Un seul formulaire de saisie pour classique et barebow. */
    [setup, power].forEach((card) => {
      if (!card) return;
      card.classList.remove('arc-classic-only');
      card.hidden = false;
      card.removeAttribute('hidden');
      card.style.removeProperty('display');
    });
    if (legacy?.isConnected) legacy.remove();

    if (!isBarebow) return;

    const heading = field('arcSetupHeading');
    const intro = field('arcSetupIntro');
    const ref = field('arcSetupDocRef');
    if (heading) heading.textContent = 'Reglage de base';
    if (intro) intro.textContent = "Renseignez les mesures de l'arc puis lancez le calcul. L'interpretation est adaptee au barebow.";
    if (ref) ref.innerHTML = 'Sources : <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> · <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery - Coaching Manual Level 2</a>.';

    const setupIntro = setup?.querySelector('p');
    if (setupIntro) setupIntro.innerHTML = 'Le <strong>band</strong> depend surtout de la taille d arc. Le <strong>tiller</strong> se calcule avec les deux distances corde / branches. Une valeur faible sert de point de depart, puis le reglage se valide au tir.';

    const powerIntro = power?.querySelector('p');
    if (powerIntro) powerIntro.innerHTML = 'Le calcul utilise la <strong>taille de poignee</strong>, la <strong>puissance marquee des branches</strong> et l <strong>allonge reelle</strong> pour estimer la puissance tiree.';
  }

  field('bowStyle')?.addEventListener('change', () => {
    applyBarebowLayout();
    requestAnimationFrame(applyBarebowLayout);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-tab="arc-setup"]')) setTimeout(applyBarebowLayout, 0);
  });

  applyBarebowLayout();
  requestAnimationFrame(applyBarebowLayout);
})();