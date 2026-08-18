/* Configuration centrale Assistant Archer TEST. Aucun comportement métier ici. */
window.AssistantArcherConfig = Object.freeze({
  version: '2026.08.18-refactor.1',
  channel: 'test',
  historyLimit: 5,
  principles: Object.freeze({
    advisoryOnly: true,
    manufacturerSourcesFirst: true,
    coachValidationRecommended: true,
    measuredDrawWeightPreferred: true
  })
});
