/* Refonte legere de navigation et ajout d'un onglet Reglage dynamique. */
(() => {
  function simplifyExistingTabs() {
    const labels = {
      spine: "Fleches",
      "arc-setup": "Reglage de base",
      notebook: "Mes reglages",
      sight: "Reperes"
    };
    document.querySelectorAll('.tab-button[data-tab]').forEach((button) => {
      if (labels[button.dataset.tab]) button.textContent = labels[button.dataset.tab];
    });

    const heroText = document.querySelector('.hero > p');
    if (heroText) heroText.textContent = "Choisir ses fleches, regler son arc et garder ses reperes.";

    const history = document.getElementById('history');
    if (history && !history.closest('details')) {
      const details = document.createElement('details');
      details.className = 'card notes';
      const summary = document.createElement('summary');
      summary.textContent = 'Historique des calculs';
      history.parentNode.insertBefore(details, history);
      details.append(summary, history);
      history.classList.remove('card', 'notes');
    }

    const spinePanel = document.querySelector('[data-panel="spine"]');
    if (spinePanel) {
      [...spinePanel.querySelectorAll('.card.notes')].forEach((card) => {
        if (card.id === 'history' || card.closest('details')) return;
        if (card.querySelector('h3')?.textContent.trim() === 'Important') {
          const details = document.createElement('details');
          details.className = 'card notes';
          const summary = document.createElement('summary');
          summary.textContent = 'References et conseils';
          card.parentNode.insertBefore(details, card);
          details.append(summary, card);
          card.classList.remove('card', 'notes');
        }
      });
    }

    const arcIntro = document.getElementById('arcSetupIntro');
    if (arcIntro) arcIntro.textContent = "Entrez vos mesures. L'app vous indique uniquement ce qu'il faut verifier ou corriger.";
  }

  function ensureDynamicTab() {
    if (document.querySelector('[data-tab="dynamic"]')) return;
    const nav = document.querySelector('.tab-nav');
    const arcButton = document.querySelector('.tab-button[data-tab="arc-setup"]');
    if (!nav || !arcButton) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab-button';
    button.dataset.tab = 'dynamic';
    button.textContent = 'Reglage dynamique';
    arcButton.insertAdjacentElement('afterend', button);

    const arcPanel = document.querySelector('[data-panel="arc-setup"]');
    if (!arcPanel) return;
    const panel = document.createElement('section');
    panel.className = 'tab-panel';
    panel.dataset.panel = 'dynamic';
    panel.hidden = true;
    panel.innerHTML = `
      <section class="card">
        <h2>Reglage dynamique</h2>
        <p>Faites un test, indiquez ce que vous observez, puis appliquez une seule correction a la fois.</p>
        <form id="dynamicTuningForm" novalidate autocomplete="off">
          <div class="field-grid">
            <label>Archer
              <select id="dynamicHand">
                <option value="right">Droitier</option>
                <option value="left">Gaucher</option>
              </select>
            </label>
            <label>Test
              <select id="dynamicTest">
                <option value="bareshaft">Fut nu</option>
                <option value="grouping">Groupement</option>
                <option value="berger">Berger button</option>
              </select>
            </label>
            <label>Distance
              <select id="dynamicDistance">
                <option value="10">10 m</option>
                <option value="18" selected>18 m</option>
                <option value="30">30 m</option>
              </select>
            </label>
            <label>Observation
              <select id="dynamicObservation">
                <option value="center">Dans le groupement</option>
                <option value="left">A gauche</option>
                <option value="right">A droite</option>
                <option value="high">Au-dessus</option>
                <option value="low">En-dessous</option>
                <option value="wide">Groupement trop large</option>
              </select>
            </label>
          </div>
          <button type="submit">Analyser</button>
        </form>
      </section>
      <section class="card result" id="dynamicTuningResult" aria-live="polite">
        <h2>Conseil</h2>
        <p>Choisissez votre test et votre observation.</p>
      </section>
      <details class="card notes">
        <summary>Comment utiliser ce test</summary>
        <p>Ne changez qu'un seul parametre a la fois, puis refaites plusieurs volees avant de conclure. En barebow, validez aussi sur plusieurs crawls.</p>
      </details>`;
    arcPanel.insertAdjacentElement('afterend', panel);

    button.addEventListener('click', () => window.setActiveTab?.('dynamic'));
    document.getElementById('dynamicTuningForm')?.addEventListener('submit', handleDynamicSubmit);
  }

  function invertHorizontal(side, hand) {
    if (hand === 'right') return side;
    return side === 'left' ? 'right' : side === 'right' ? 'left' : side;
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

    let title = 'Ne touchez a rien pour l instant';
    let advice = 'Refaites plusieurs volees pour confirmer avant toute correction.';

    if (obs === 'center') {
      title = 'Reglage coherent';
      advice = 'Le resultat est dans le groupement. Conservez le reglage et confirmez sur plusieurs volees.';
    } else if (obs === 'high' || obs === 'low') {
      title = 'Verifier d abord le detalonnage';
      advice = obs === 'high'
        ? 'Le fut nu arrive haut : controlez le point d encochage/detalonnage avant de toucher au berger.'
        : 'Le fut nu arrive bas : controlez le point d encochage/detalonnage avant de toucher au berger.';
    } else if (obs === 'wide') {
      title = 'Ne corrigez pas tout de suite';
      advice = 'Un groupement large peut venir de la technique, du vent ou d un reglage instable. Refaites plusieurs volees avant de modifier le materiel.';
    } else {
      const effective = invertHorizontal(obs, hand);
      if (test === 'bareshaft') {
        title = 'Diagnostic horizontal a confirmer';
        advice = effective === 'left'
          ? 'Le fut nu est du cote gauche pour votre configuration. Confirmez sur plusieurs volees, puis travaillez progressivement le berger/centrage ou la dynamique de fleche selon votre reglage actuel.'
          : 'Le fut nu est du cote droit pour votre configuration. Confirmez sur plusieurs volees, puis travaillez progressivement le berger/centrage ou la dynamique de fleche selon votre reglage actuel.';
      } else if (test === 'berger') {
        title = 'Ajuster le berger par petites etapes';
        advice = `Le decalage est ${obs === 'left' ? 'a gauche' : 'a droite'}. Faites une petite correction de pression/centrage, puis refaites une volee avant toute autre modification.`;
      } else {
        title = 'Verifier la regularite avant correction';
        advice = `Le groupement decale ${obs === 'left' ? 'a gauche' : 'a droite'} doit d abord etre confirme sur plusieurs volees avant de modifier le reglage.`;
      }
    }

    if (style === 'barebow') {
      advice += ' En barebow, validez ensuite le resultat sur une crawl courte, moyenne et longue.';
    }
    if (distance < 15 && test === 'bareshaft') {
      advice += ' A courte distance, utilisez surtout le test pour verifier le vertical et la coherence globale.';
    }

    result.innerHTML = `<h2>${title}</h2><p>${advice}</p><p><strong>Regle :</strong> une seule correction a la fois.</p>`;
  }

  function addTabClickSupport() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.tab-button[data-tab]');
      if (!button) return;
      const tab = button.dataset.tab;
      document.querySelectorAll('.tab-button[data-tab]').forEach((b) => {
        const active = b.dataset.tab === tab;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('.tab-panel[data-panel]').forEach((panel) => {
        const active = panel.dataset.panel === tab;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
      localStorage.setItem('activeMainTab', tab);
    });
  }

  simplifyExistingTabs();
  ensureDynamicTab();
  addTabClickSupport();
})();
