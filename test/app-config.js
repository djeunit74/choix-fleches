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
      const carbonExpress = brand.querySelector('option[value="carbon"]');
      if (carbonExpress) carbonExpress.remove();
      if (brand.value === 'carbon') brand.value = 'all';
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', simplifyArrowChoiceForm, { once: true });
  else simplifyArrowChoiceForm();
})();

/* Boot TEST des couches expert puis audit catalogue. */
(() => {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('script[data-expert-model-ranking]')) {
    const script = document.createElement('script');
    script.src = 'expert-model-ranking.js?v=20260822-prealpha-v14';
    script.defer = true;
    script.dataset.expertModelRanking = '1';
    document.head.appendChild(script);
  }
  if (!document.querySelector('script[data-catalog-audit]')) {
    const audit = document.createElement('script');
    audit.src = 'catalog-audit.js?v=20260822-prealpha-v15';
    audit.defer = true;
    audit.dataset.catalogAudit = '1';
    document.head.appendChild(audit);
  }
})();
