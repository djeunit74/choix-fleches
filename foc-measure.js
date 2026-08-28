/* Assistant Archer TEST - mesure reelle du FOC d'une fleche terminee.
   Formule AMO : FOC % = 100 * (A - L/2) / L.
   L = fond de gorge de l'encoche -> fin du tube ; A = meme origine -> point d'equilibre. */
(() => {
  'use strict';

  function calculateMeasuredFoc(lengthCm, balanceCm) {
    const length = Number(lengthCm);
    const balance = Number(balanceCm);
    if (!Number.isFinite(length) || !Number.isFinite(balance) || length <= 0 || balance <= 0 || balance >= length) return null;
    return 100 * (balance - length / 2) / length;
  }

  function classifyMeasuredFoc(foc) {
    if (!Number.isFinite(foc)) return { key: 'invalid', label: 'Mesure invalide' };
    if (foc < 0) return { key: 'negative', label: 'FOC negatif - a corriger' };
    if (foc < 7) return { key: 'low', label: 'FOC faible' };
    if (foc < 10) return { key: 'indoor', label: 'Dans le repere salle 7-15 % ; a confirmer pour l exterieur' };
    if (foc <= 15) return { key: 'coherent', label: 'Dans le repere cible 10-15 %' };
    return { key: 'high', label: 'Au-dessus du repere general 15 % - a valider au tir' };
  }

  globalThis.AssistantArcherFocMeasureMath = Object.freeze({ calculateMeasuredFoc, classifyMeasuredFoc });
  if (typeof document === 'undefined') return;

  let measured = null;
  let scheduled = false;

  const esc = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function defaultLengthCm() {
    const inches = Number(document.getElementById('arrowLength')?.value);
    return Number.isFinite(inches) && inches > 0 ? Math.round(inches * 2.54 * 10) / 10 : '';
  }

  function updateBuilderSummary() {
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary || !Number.isFinite(measured?.foc)) return;
    const spans = [...summary.querySelectorAll(':scope > span')];
    const balance = spans.find(span => /^Equilibre\s*:/i.test(span.textContent || '')) || spans.at(-1);
    if (!balance) return;
    const html = `<strong>Equilibre :</strong> FOC mesure ${measured.foc.toFixed(1)} %`;
    if (balance.innerHTML !== html) balance.innerHTML = html;
  }

  function renderResult(section, length, balance) {
    const output = section.querySelector('[data-foc-measure-result]');
    if (!output) return;
    const foc = calculateMeasuredFoc(length, balance);
    if (!Number.isFinite(foc)) {
      measured = null;
      output.innerHTML = '<strong>Mesure impossible.</strong> Verifiez que les deux distances sont positives et que le point d equilibre est compris dans la longueur de reference.';
      output.dataset.state = 'invalid';
      return;
    }
    const status = classifyMeasuredFoc(foc);
    measured = { foc, length: Number(length), balance: Number(balance), status };
    output.dataset.state = status.key;
    output.innerHTML = `<span>FOC mesure</span><strong>${foc.toFixed(1)} %</strong><small>${esc(status.label)}</small>`;
    updateBuilderSummary();
  }

  function installMeasure(panel) {
    if (!(panel instanceof HTMLElement)) return;
    if (!/4\.\s*Equilibre/i.test(panel.textContent || '')) return;
    if (panel.querySelector('[data-foc-measure]')) {
      updateBuilderSummary();
      return;
    }

    const section = document.createElement('section');
    section.className = 'foc-measure-card';
    section.dataset.focMeasure = '1';
    section.innerHTML = `
      <div class="foc-measure-head">
        <div>
          <p class="arrow-builder-kicker">Controle reel</p>
          <h4>Mesurer le FOC de ma fleche terminee</h4>
        </div>
        <span class="foc-measure-badge">Plus fiable que l estimation</span>
      </div>
      <p>Montez la fleche complete, trouvez son point d equilibre sur un bord fin, puis mesurez depuis le <strong>fond de gorge de l encoche</strong>.</p>
      <div class="foc-measure-grid">
        <label>Longueur de reference L (cm)
          <input type="number" inputmode="decimal" min="1" step="0.1" data-foc-length value="${esc(defaultLengthCm())}">
          <small>Fond de gorge de l encoche → fin du tube, sans la pointe. Valeur pre-remplie a verifier.</small>
        </label>
        <label>Point d equilibre A (cm)
          <input type="number" inputmode="decimal" min="1" step="0.1" data-foc-balance placeholder="Ex : 40,5">
          <small>Fond de gorge de l encoche → point ou la fleche tient en equilibre.</small>
        </label>
      </div>
      <button type="button" class="foc-measure-button" data-foc-calculate>Calculer mon FOC reel</button>
      <div class="foc-measure-result" data-foc-measure-result aria-live="polite">Saisissez le point d equilibre pour obtenir le FOC mesure.</div>
      <p class="foc-measure-reference">Repere Easton cible : 7-15 % en salle, 10-15 % en exterieur. Ce sont des plages de depart, pas une valeur parfaite universelle. <a href="https://eastonarchery.com/faqs/" target="_blank" rel="noopener noreferrer">Formule et reference Easton</a>.</p>`;

    const doneButton = panel.querySelector('[data-balance-done]');
    if (doneButton) panel.insertBefore(section, doneButton);
    else panel.appendChild(section);

    const calculate = () => {
      const length = Number(section.querySelector('[data-foc-length]')?.value);
      const balance = Number(section.querySelector('[data-foc-balance]')?.value);
      renderResult(section, length, balance);
    };
    section.querySelector('[data-foc-calculate]')?.addEventListener('click', calculate);
    section.querySelector('[data-foc-balance]')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        calculate();
      }
    });
  }

  function scan() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (panel) installMeasure(panel);
    updateBuilderSummary();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  function install() {
    scan();
    const dialog = document.getElementById('arrowBuilderDialog');
    if (dialog) new MutationObserver(schedule).observe(dialog, { childList: true, subtree: true });
    const builder = document.getElementById('arrowBuilder');
    if (builder) new MutationObserver(schedule).observe(builder, { childList: true, subtree: true });
  }

  globalThis.AssistantArcherFocMeasure = Object.freeze({ refresh: scan, version: 'v59' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();