/* Assistant Archer TEST - presentation compacte des raisons de recommandation, Pré-alpha v40.
   Cette couche ne modifie aucun calcul, spine, modèle ou composant.
   Elle déduplique uniquement les explications déjà rendues et replie les détails techniques. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v40';

  const norm = value => String(value || '').replace(/\s+/g, ' ').trim();

  function isTechnical(text) {
    const t = norm(text).toLowerCase();
    return /pré-alpha|pre-alpha|catalogue|interprétation app|interpretation app|familles .* auditées|familles .* auditees|tailles .* recoupées|tailles .* recoupees/.test(t);
  }

  function compactResult() {
    const result = document.getElementById('result');
    if (!result) return;

    const labels = [...result.querySelectorAll('p')].filter(p => /pourquoi ce niveau\s*:?/i.test(p.textContent || ''));
    labels.forEach(label => {
      const list = label.nextElementSibling;
      if (!list || list.tagName !== 'UL' || list.dataset.compactedV40 === '1') return;

      const unique = [];
      const seen = new Set();
      [...list.children].forEach(li => {
        const text = norm(li.textContent);
        const key = text.toLowerCase();
        if (!text || seen.has(key)) return;
        seen.add(key);
        unique.push({ text, html: li.innerHTML, technical: isTechnical(text) });
      });

      const userFacing = unique.filter(item => !item.technical);
      const technical = unique.filter(item => item.technical);
      const visible = userFacing.slice(0, 4);
      const overflow = [...userFacing.slice(4), ...technical];

      list.innerHTML = visible.map(item => `<li>${item.html}</li>`).join('');
      list.dataset.compactedV40 = '1';

      const old = list.nextElementSibling;
      if (old?.classList?.contains('recommendation-details-v40')) old.remove();

      if (overflow.length) {
        const details = document.createElement('details');
        details.className = 'recommendation-details-v40';
        details.innerHTML = `<summary>Détails techniques (${overflow.length})</summary><ul>${overflow.map(item => `<li>${item.html}</li>`).join('')}</ul>`;
        list.insertAdjacentElement('afterend', details);
      }
    });
  }

  function wrapRenderer() {
    const current = window.renderRecommendation;
    if (typeof current !== 'function' || current.__compactReasonsV40) return false;
    const wrapped = function() {
      const result = current.apply(this, arguments);
      queueMicrotask(compactResult);
      return result;
    };
    wrapped.__compactReasonsV40 = true;
    window.renderRecommendation = wrapped;
    return true;
  }

  function install() {
    wrapRenderer();
    [250, 800, 1800].forEach(ms => setTimeout(wrapRenderer, ms));
    document.getElementById('spine-form')?.addEventListener('submit', () => setTimeout(compactResult, 0));
    window.AssistantArcherRecommendationUI = Object.freeze({ version: VERSION, compactResult });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
