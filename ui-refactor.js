/* Navigation simplifiee et assistant de reglage dynamique guide. */
(() => {
  function simplifyExistingTabs() {
    const labels = { spine: "Fleches", "arc-setup": "Reglage de base", notebook: "Mes reglages", sight: "Reperes" };
    document.querySelectorAll('.tab-button[data-tab]').forEach((button) => { if (labels[button.dataset.tab]) button.textContent = labels[button.dataset.tab]; });
    const heroText = document.querySelector('.hero > p');
    if (heroText) heroText.textContent = "Choisir ses fleches, regler son arc et garder ses reperes.";
    const history = document.getElementById('history');
    if (history && !history.closest('details')) {
      const details = document.createElement('details'); details.className = 'card notes';
      const summary = document.createElement('summary'); summary.textContent = 'Historique des calculs';
      history.parentNode.insertBefore(details, history); details.append(summary, history); history.classList.remove('card', 'notes');
    }
    const spinePanel = document.querySelector('[data-panel="spine"]');
    if (spinePanel) [...spinePanel.querySelectorAll('.card.notes')].forEach((card) => {
      if (card.id === 'history' || card.closest('details')) return;
      if (card.querySelector('h3')?.textContent.trim() === 'Important') {
        const details = document.createElement('details'); details.className = 'card notes';
        const summary = document.createElement('summary'); summary.textContent = 'References et conseils';
        card.parentNode.insertBefore(details, card); details.append(summary, card); card.classList.remove('card', 'notes');
      }
    });
    const arcIntro = document.getElementById('arcSetupIntro');
    if (arcIntro) arcIntro.textContent = "Entrez vos mesures. L'app vous indique uniquement ce qu'il faut verifier ou corriger.";
  }

  function ensureDynamicTab() {
    if (document.querySelector('[data-tab="dynamic"]')) return;
    const arcButton = document.querySelector('.tab-button[data-tab="arc-setup"]');
    const arcPanel = document.querySelector('[data-panel="arc-setup"]');
    if (!arcButton || !arcPanel) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'tab-button'; button.dataset.tab = 'dynamic'; button.textContent = 'Reglage dynamique';
    arcButton.insertAdjacentElement('afterend', button);
    const panel = document.createElement('section');
    panel.className = 'tab-panel'; panel.dataset.panel = 'dynamic'; panel.hidden = true;
    panel.innerHTML = `
      <section class="card">
        <h2>Reglage dynamique</h2>
        <p>Assistant guide : commencez par le fut nu. Ne modifiez qu'un seul reglage a la fois puis recommencez le test.</p>
        <form id="dynamicTuningForm" novalidate autocomplete="off">
          <div class="field-grid">
            <label>Archer<select id="dynamicHand"><option value="right">Droitier</option><option value="left">Gaucher</option></select></label>
            <label>Test<select id="dynamicTest"><option value="bareshaft">Test fut nu</option><option value="contact">Verification des contacts de fleche</option><option value="validation">Validation du groupement</option></select></label>
            <label id="dynamicDistanceWrap">Distance<select id="dynamicDistance"><option value="10">10 m</option><option value="15">15 m</option><option value="18" selected>18 m</option><option value="20">20 m</option><option value="30">30 m</option></select></label>
            <label id="dynamicObservationWrap">Observation<select id="dynamicObservation"></select></label>
          </div>
          <div id="dynamicProtocol" class="measurement-guide"></div>
          <button type="submit">Analyser le test</button>
        </form>
      </section>
      <section class="card result" id="dynamicTuningResult" aria-live="polite"><h2>Conseil</h2><p>Realisez le protocole puis indiquez ce que vous observez.</p></section>
      <details class="card notes"><summary>Sources et methode</summary>
        <p>Le test fut nu et la verification des contacts suivent les principes de reglage Easton. En barebow, la validation tient aussi compte du stringwalking.</p>
        <p><a href="https://eastonarchery.com/wp-content/uploads/2019/08/TuningGuideEaston.pdf" target="_blank" rel="noopener noreferrer">Easton Arrow Tuning Guide</a> · <a href="https://eastonarchery.com/2018/08/tuning-tips-for-the-toxophilite/" target="_blank" rel="noopener noreferrer">Easton - bare shaft tuning</a> · <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Barebow</a></p>
      </details>`;
    arcPanel.insertAdjacentElement('afterend', panel);
    document.getElementById('dynamicTest')?.addEventListener('change', updateDynamicTestUI);
    document.getElementById('dynamicTuningForm')?.addEventListener('submit', handleDynamicSubmit);
    updateDynamicTestUI();
  }

  const OBS = {
    bareshaft: [
      ['center','Futs nus dans le groupement'], ['left','Futs nus a gauche'], ['right','Futs nus a droite'],
      ['high','Futs nus au-dessus'], ['low','Futs nus en-dessous'], ['mixed','Resultats disperses / non repetables']
    ],
    contact: [['none','Aucun contact visible'], ['rest','Plumes touchent le repose-fleche'], ['riser','Plumes touchent la fenetre / poignee'], ['button','Contact pres du berger button'], ['unknown','Trace presente mais origine incertaine']],
    validation: [['stable','Groupement stable ou meilleur'], ['worse','Groupement moins bon'], ['variable','Resultat trop variable pour conclure']]
  };

  function updateDynamicTestUI() {
    const test = document.getElementById('dynamicTest')?.value || 'bareshaft';
    const select = document.getElementById('dynamicObservation');
    const protocol = document.getElementById('dynamicProtocol');
    const distanceWrap = document.getElementById('dynamicDistanceWrap');
    if (!select || !protocol) return;
    select.innerHTML = OBS[test].map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
    if (distanceWrap) distanceWrap.hidden = test === 'contact';
    if (test === 'bareshaft') protocol.innerHTML = '<h3>Protocole</h3><ol><li>Reglez d abord le band et le detalonnage de base.</li><li>A 15-20 m, tirez au moins <strong>3 fleches empennees + 2 futs nus</strong> avec la meme visee.</li><li>Repetez plusieurs volees. N interpretez que la tendance repetable des futs nus.</li><li>Traitez d abord un ecart vertical avant le diagnostic horizontal.</li></ol>';
    if (test === 'contact') protocol.innerHTML = '<h3>Protocole</h3><ol><li>Inspectez les plumes, le repose-fleche, le berger button et la fenetre de l arc.</li><li>Recherchez frottements, traces ou plumes abimees.</li><li>Un contact doit etre resolu avant d affiner le spine dynamique.</li></ol>';
    if (test === 'validation') protocol.innerHTML = '<h3>Protocole</h3><ol><li>Apres une petite correction, revenez aux memes conditions de tir.</li><li>Tirez plusieurs volees sans changer un second parametre.</li><li>Conservez la correction seulement si le resultat est repetable et meilleur.</li></ol>';
  }

  function handleDynamicSubmit(event) {
    event.preventDefault();
    const hand = document.getElementById('dynamicHand').value;
    const test = document.getElementById('dynamicTest').value;
    const obs = document.getElementById('dynamicObservation').value;
    const distance = Number(document.getElementById('dynamicDistance').value);
    const style = window.currentBowStyle?.() || 'classique';
    const result = document.getElementById('dynamicTuningResult');
    if (!result) return;
    let title = 'Ne modifiez rien pour l instant';
    let advice = 'Repetez le test avant de conclure.';

    if (test === 'bareshaft') {
      if (obs === 'center') { title = 'Reglage coherent'; advice = 'Les futs nus rejoignent le groupement. Conservez ce reglage et confirmez sur plusieurs volees.'; }
      else if (obs === 'mixed') { title = 'Test non exploitable'; advice = 'Les resultats ne sont pas assez repetables. Verifiez la regularite de tir et les contacts de fleche avant toute correction.'; }
      else if (obs === 'high') { title = 'Corriger d abord le detalonnage'; advice = 'Les futs nus arrivent haut : montez legerement le point d encochage, puis refaites le test avant de toucher au berger ou au spine dynamique.'; }
      else if (obs === 'low') { title = 'Corriger d abord le detalonnage'; advice = 'Les futs nus arrivent bas : descendez legerement le point d encochage, puis refaites le test avant de toucher au berger ou au spine dynamique.'; }
      else {
        const stiff = hand === 'right' ? obs === 'left' : obs === 'right';
        title = stiff ? 'Fleche dynamiquement trop raide' : 'Fleche dynamiquement trop souple';
        advice = stiff
          ? 'Tendance a confirmer : commencez par une petite correction reversible du berger selon votre reglage actuel. Si l ecart persiste, examinez ensuite poids de pointe et puissance tiree. Ne changez qu un parametre.'
          : 'Tendance a confirmer : commencez par une petite correction reversible du berger selon votre reglage actuel. Si l ecart persiste, examinez ensuite poids de pointe et puissance tiree. Ne changez qu un parametre.';
      }
      if (distance < 15) advice += ' Pour un diagnostic horizontal plus fiable, refaites ensuite le test vers 15-20 m.';
    }

    if (test === 'contact') {
      if (obs === 'none') { title = 'Pas de contact detecte'; advice = 'Vous pouvez poursuivre le reglage dynamique. Verifiez quand meme que les plumes restent intactes apres plusieurs volees.'; }
      else if (obs === 'unknown') { title = 'Identifier le contact avant de regler'; advice = 'Ne compensez pas avec le berger. Localisez d abord la zone de frottement et controlez repose-fleche, centrage et orientation des plumes.'; }
      else { title = 'Contact de fleche a corriger'; advice = 'Un contact peut fausser le test fut nu. Corrigez d abord la clearance : controlez centrage, repose-fleche, orientation des plumes et position du berger, puis refaites le test.'; }
    }

    if (test === 'validation') {
      if (obs === 'stable') { title = 'Correction validee'; advice = 'Le resultat est stable ou meilleur. Conservez ce reglage et notez-le dans Mes reglages.'; }
      if (obs === 'worse') { title = 'Revenir au reglage precedent'; advice = 'La correction a degrade le groupement. Revenez au reglage precedent avant d essayer une autre modification.'; }
      if (obs === 'variable') { title = 'Pas de conclusion fiable'; advice = 'Le resultat varie trop. Revenez a une execution reguliere et refaites plusieurs volees sans modifier le materiel.'; }
    }

    if (style === 'barebow') advice += ' En barebow, confirmez aussi a crawl courte, moyenne et longue : le stringwalking modifie le comportement dynamique.';
    result.innerHTML = `<h2>${title}</h2><p>${advice}</p><p><strong>Regle :</strong> une seule correction a la fois, puis nouveau test.</p>`;
  }

  function addTabClickSupport() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.tab-button[data-tab]'); if (!button) return;
      const tab = button.dataset.tab;
      document.querySelectorAll('.tab-button[data-tab]').forEach((b) => { const active = b.dataset.tab === tab; b.classList.toggle('is-active', active); b.setAttribute('aria-selected', active ? 'true' : 'false'); });
      document.querySelectorAll('.tab-panel[data-panel]').forEach((panel) => { const active = panel.dataset.panel === tab; panel.classList.toggle('is-active', active); panel.hidden = !active; });
      localStorage.setItem('activeMainTab', tab);
    });
  }

  simplifyExistingTabs(); ensureDynamicTab(); addTabClickSupport();
})();
