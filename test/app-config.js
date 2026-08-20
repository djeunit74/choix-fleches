/* Configuration centrale Assistant Archer TEST. Aucun comportement metier ici. */
window.AssistantArcherConfig = Object.freeze({
  version: '2026.08.20-v39',
  channel: 'test',
  historyLimit: 5,
  principles: Object.freeze({
    advisoryOnly: true,
    manufacturerSourcesFirst: true,
    coachValidationRecommended: true,
    measuredDrawWeightPreferred: true
  })
});
