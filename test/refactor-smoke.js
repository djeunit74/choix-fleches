/* Assistant Archer - garde de non-regression pendant le refactor.
   Ne modifie aucune logique metier. Signale uniquement les fonctions/DOM essentiels manquants. */
(() => {
  const requiredIds = [
    'spine-form','result','historyContent','clearHistoryBtn',
    'arc-setup-form','arcSetupResult','bowStyle',
    'notebook-form','notebookResult','notebookStatus',
    'sight-form','sightResult','sightStatus','sightMarkers'
  ];
  const requiredBrands = ['skylon','easton','victory','carbon'];

  function audit() {
    const missingIds = requiredIds.filter(id => !document.getElementById(id));
    const brandSelect = document.getElementById('preferredBrand');
    const values = brandSelect ? [...brandSelect.options].map(o => o.value) : [];
    const missingBrands = requiredBrands.filter(v => !values.includes(v));
    const cfg = window.AssistantArcherConfig;
    const failures = [];
    if (missingIds.length) failures.push(`DOM: ${missingIds.join(', ')}`);
    if (missingBrands.length) failures.push(`marques: ${missingBrands.join(', ')}`);
    if (!cfg || cfg.channel !== 'test') failures.push('configuration TEST centrale absente');
    document.documentElement.dataset.refactorSmoke = failures.length ? 'fail' : 'pass';
    if (failures.length) console.error('[Assistant Archer refactor] non-regression:', failures);
    return { ok: !failures.length, failures };
  }

  window.AssistantArcherRefactorAudit = Object.freeze({ audit });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', audit, { once: true });
  else audit();
})();
