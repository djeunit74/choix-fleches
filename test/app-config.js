/* Configuration centrale Assistant Archer TEST. */
window.AssistantArcherConfig = Object.freeze({
  version: '2026.08.21-v62',
  channel: 'test',
  historyLimit: 5,
  principles: Object.freeze({
    advisoryOnly: true,
    manufacturerSourcesFirst: true,
    coachValidationRecommended: true,
    measuredDrawWeightPreferred: true
  })
});

/* UX TEST : le materiau est une consequence de la recommandation, pas une
   question obligatoire. Le moteur conserve "all" en interne pour pouvoir
   proposer carbone, aluminium ou aluminium/carbone selon les donnees fabricant. */
(() => {
  const simplifyArrowChoiceForm = () => {
    const material = document.getElementById('shaftMaterial');
    if (material) {
      material.value = 'all';
      const label = material.closest('label');
      if (label) { label.hidden = true; label.style.display = 'none'; }
    }
    const guidance = document.getElementById('materialGuidance');
    if (guidance) { guidance.hidden = true; guidance.style.display = 'none'; }
    const brand = document.getElementById('preferredBrand');
    if (brand) {
      const all = brand.querySelector('option[value="all"]');
      if (all) all.textContent = 'Toutes les marques';
      for (const value of ['carbon','avalon']) {
        const option = brand.querySelector(`option[value="${value}"]`);
        if (option) option.remove();
      }
      if (['carbon','avalon'].includes(brand.value)) brand.value = 'all';
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', simplifyArrowChoiceForm, { once: true });
  else simplifyArrowChoiceForm();
})();

/* TEST v26 : enrichit le JSON composants au moment de son chargement. Les
   plumes sourcees dans vane-catalog-v25 sont ajoutees, puis les masses v26
   sont appliquees uniquement lorsqu'elles sont jugees utilisables pour le FOC. */
(() => {
  if (typeof window.fetch !== 'function' || window.__vaneCatalogFetchV26) return;
  const originalFetch = window.fetch.bind(window);
  const catalogPromise = originalFetch('./vane-catalog-v25.json?v=20260822-prealpha-v25', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { vanes: [] })
    .catch(() => ({ vanes: [] }));
  const massPromise = originalFetch('./vane-mass-v26.json?v=20260822-prealpha-v26', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { masses: [] })
    .catch(() => ({ masses: [] }));

  window.fetch = async function(input, init) {
    const response = await originalFetch(input, init);
    const url = typeof input === 'string' ? input : String(input?.url || '');
    if (!/arrow-components\.json(?:\?|$)/i.test(url)) return response;
    try {
      const [base, extra, massData] = await Promise.all([response.clone().json(), catalogPromise, massPromise]);
      const byId = new Map((Array.isArray(base.vanes) ? base.vanes : []).map(vane => [vane.id, vane]));
      for (const vane of (Array.isArray(extra.vanes) ? extra.vanes : [])) {
        const previous = byId.get(vane.id) || {};
        byId.set(vane.id, { ...previous, ...vane });
      }
      for (const mass of (Array.isArray(massData.masses) ? massData.masses : [])) {
        const previous = byId.get(mass.id);
        if (!previous) continue;
        const safeMass = { ...mass };
        if (mass.focUsable !== true) delete safeMass.weightGrains;
        byId.set(mass.id, { ...previous, ...safeMass });
      }
      const merged = { ...base, vanes: [...byId.values()] };
      return new Response(JSON.stringify(merged), {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } catch {
      return response;
    }
  };
  window.__vaneCatalogFetchV26 = true;
})();

/* Cache-buster TEST pour la finition visuelle. */
(() => {
  const refreshUiPolish = () => {
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(el => /ui-polish\.css/i.test(el.getAttribute('href') || ''));
    if (link) link.href = 'ui-polish.css?v=20260822-prealpha-v25';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshUiPolish, { once: true });
  else refreshUiPolish();
})();

/* Boot TEST actif : expert -> audit catalogue -> bibliothèque empennages. */
(() => {
  if (typeof document === 'undefined') return;
  const add = (src, marker) => {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute(`data-${marker}`, '1');
    document.head.appendChild(script);
  };
  add('expert-model-ranking.js?v=20260822-prealpha-v24', 'expert-model-ranking');
  add('catalog-audit.js?v=20260822-prealpha-v25', 'catalog-audit');
  add('vane-library-v25.js?v=20260822-prealpha-v25', 'vane-library-v25');
  add('vane-mass-v26.js?v=20260822-prealpha-v26', 'vane-mass-v26');
})();
