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

/* Boot TEST actif : expert -> audit catalogue. */
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
  add('catalog-audit.js?v=20260822-prealpha-v23', 'catalog-audit');
})();
