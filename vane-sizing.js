/* Assistant Archer TEST - recommandation de taille d'empennage, Pré-alpha v44.
   Cette couche ne modifie ni le spine, ni la compatibilite fabricant, ni le calcul FOC.
   Elle classe seulement les empennages FOC-ready deja proposes par le constructeur.

   Regle d'interpretation app (pas une table fabricant universelle) :
   - cible + tube fin : 1.5-1.75 pouces, pour limiter la trainee a longue distance ;
   - campagne / 3D : 1.75-2.5 pouces, compromis stabilisation / trainee ;
   - cible + tube large/aluminium salle : 2-4 pouces, stabilisation rapide a courte distance.
   La masse FOC et la compatibilite discipline/type d'arc restent prioritaires.
*/
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v44';
  const PANEL_ID = 'arrowBuilderPanel';

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  function selectedTubeName() {
    const summary = document.getElementById('arrowBuilderSummary')?.textContent || '';
    const match = summary.match(/Tube\s*:\s*([^\n]+?)(?=Empennage\s*:|$)/i);
    return norm(match?.[1] || '');
  }

  function isLargeIndoorTube(name) {
    return /\b(x23|x7|rx7|xx75|platinum plus|jazz|v tac 23|vx 27)\b/.test(name);
  }

  function recommendation() {
    const discipline = document.getElementById('themeSelect')?.value || 'cible';
    const tube = selectedTubeName();

    if (discipline === 'campagne' || discipline === '3d') {
      return {
        min: 1.75,
        max: 2.5,
        label: '1,75–2,5"',
        reason: 'Compromis app entre stabilisation rapide et trainee pour campagne / 3D.'
      };
    }

    if (isLargeIndoorTube(tube)) {
      return {
        min: 2,
        max: 4,
        label: '2–4"',
        reason: 'Tube de cible large / salle : stabilisation rapide privilegiee, la trainee etant moins penalisante a courte distance.'
      };
    }

    return {
      min: 1.5,
      max: 1.75,
      label: '1,5–1,75"',
      reason: 'Tube fin de cible : faible trainee privilegiee pour l exterieur et la longue distance.'
    };
  }

  function cardLength(card) {
    const text = card.querySelector('.arrow-component-specs')?.textContent || card.textContent || '';
    const match = text.replace(',', '.').match(/Longueur\s+(\d+(?:\.\d+)?)/i);
    return match ? Number(match[1]) : null;
  }

  function inRange(length, rec) {
    return Number.isFinite(length) && length >= rec.min && length <= rec.max;
  }

  function ensureHint(panel, rec) {
    let hint = panel.querySelector('[data-vane-size-guidance]');
    if (!hint) {
      hint = document.createElement('div');
      hint.dataset.vaneSizeGuidance = '1';
      hint.className = 'arrow-builder-callout vane-size-guidance';
      const list = panel.querySelector('.arrow-component-list');
      if (list) list.insertAdjacentElement('beforebegin', hint);
      else panel.prepend(hint);
    }
    hint.innerHTML = `<strong>Taille conseillee : ${rec.label}</strong><br><span>${rec.reason}</span><br><small>Repere de classement de l app : la discipline, le type de plume, sa masse et le FOC restent a verifier.</small>`;
  }

  function decorate() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel || !/Empennage/i.test(panel.textContent || '')) return;
    const list = panel.querySelector('.arrow-component-list');
    if (!list) return;

    const rec = recommendation();
    ensureHint(panel, rec);

    const cards = [...list.querySelectorAll(':scope > .arrow-component-card')];
    if (!cards.length) return;

    cards.forEach((card, index) => {
      if (!card.dataset.vaneOriginalOrder) card.dataset.vaneOriginalOrder = String(index);
      const length = cardLength(card);
      card.dataset.vaneSizeFit = inRange(length, rec) ? '1' : '0';

      const specs = card.querySelector('.arrow-component-specs');
      if (specs && !specs.querySelector('[data-vane-size-note]')) {
        const note = document.createElement('span');
        note.dataset.vaneSizeNote = '1';
        note.textContent = inRange(length, rec) ? ' · taille dans la plage conseillee' : ' · taille hors plage prioritaire';
        specs.appendChild(note);
      } else if (specs) {
        const note = specs.querySelector('[data-vane-size-note]');
        if (note) note.textContent = inRange(length, rec) ? ' · taille dans la plage conseillee' : ' · taille hors plage prioritaire';
      }
    });

    cards.sort((a, b) => {
      const af = Number(a.dataset.vaneSizeFit || 0);
      const bf = Number(b.dataset.vaneSizeFit || 0);
      if (af !== bf) return bf - af;
      return Number(a.dataset.vaneOriginalOrder || 0) - Number(b.dataset.vaneOriginalOrder || 0);
    }).forEach(card => list.appendChild(card));
  }

  function schedule() {
    window.setTimeout(decorate, 0);
    window.setTimeout(decorate, 80);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-arrow-part="vane"], .arrow-model-select, [data-vane]')) schedule();
  });
  document.getElementById('themeSelect')?.addEventListener('change', schedule);
  document.getElementById('bowStyle')?.addEventListener('change', schedule);
  document.getElementById('arrowLength')?.addEventListener('change', schedule);

  window.AssistantArcherVaneSizing = Object.freeze({ version: VERSION, recommendation, refresh: decorate });
})();
