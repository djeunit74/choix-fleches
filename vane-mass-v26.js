/* Assistant Archer TEST - masses d'empennages et confiance FOC, Pré-alpha v26. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v26';
  const DATA_URL = './vane-mass-v26.json?v=20260822-prealpha-v26';
  let masses = new Map();

  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function annotate() {
    document.querySelectorAll('[data-vane]').forEach(button => {
      const card = button.closest('.arrow-component-card');
      const mass = masses.get(button.dataset.vane || '');
      if (!card || !mass || card.querySelector('.vane-mass-confidence')) return;
      const p = document.createElement('p');
      p.className = 'vane-mass-confidence muted';
      const usable = mass.focUsable === true;
      const value = mass.weight || (mass.weightEstimateGrains ? `≈${mass.weightEstimateGrains} gr` : 'masse variable/non verrouillée');
      p.innerHTML = `<strong>Masse empennage :</strong> ${esc(value)} · confiance ${esc(mass.weightConfidence || 'non définie')} · ${usable ? 'utilisée pour le FOC théorique' : 'non utilisée pour le FOC théorique'}.`;
      const source = card.querySelector('.arrow-source');
      if (source) source.before(p); else card.appendChild(p);
    });
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  async function install() {
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      masses = new Map((data.masses || []).map(entry => [entry.id, entry]));
      annotate();
      let queued = false;
      new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; annotate(); });
      }).observe(document.body, { childList: true, subtree: true });
      window.AssistantArcherVaneMass = Object.freeze({ version: VERSION, data });
    } catch (error) {
      console.warn('[Assistant Archer] masses empennages v26 indisponibles', error);
    }
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once: true }) : install();
})();
