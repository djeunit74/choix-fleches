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

/* Boot TEST de la couche de classement expert. Elle attend elle-même que la
   référence fabricant soit chargée avant de modifier l'ordre des modèles. */
(() => {
  if (typeof document === 'undefined' || document.querySelector('script[data-expert-model-ranking]')) return;
  const script = document.createElement('script');
  script.src = 'expert-model-ranking.js?v=20260822-prealpha-v14';
  script.defer = true;
  script.dataset.expertModelRanking = '1';
  document.head.appendChild(script);
})();
