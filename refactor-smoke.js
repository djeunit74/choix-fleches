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

  function duplicateAddedReferences() {
    const counts = new Map();
    document.querySelectorAll('#result [data-aa-added-reference]').forEach(el => {
      const key = el.dataset.aaAddedReference;
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].filter(([, count]) => count > 1).map(([key, count]) => `${key} x${count}`);
  }

  function duplicateModelLabels() {
    const duplicates = [];
    const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const result = document.getElementById('result');
    if (!result) return duplicates;
    [...result.querySelectorAll('p,div,h3,h4')].filter(el => /^\s*Mod[eè]les conseill[eé]s\s*:/i.test(el.textContent || '')).forEach(heading => {
      const ul = heading.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') return;
      const seen = new Set();
      [...ul.querySelectorAll(':scope > li')].forEach(li => {
        const label = normalize(li.dataset.aaAddedReference || li.querySelector('strong')?.textContent || '');
        if (!label) return;
        if (seen.has(label)) duplicates.push(label);
        else seen.add(label);
      });
    });
    return [...new Set(duplicates)];
  }

  function audit() {
    const missingIds = requiredIds.filter(id => !document.getElementById(id));
    const brandSelect = document.getElementById('preferredBrand');
    const values = brandSelect ? [...brandSelect.options].map(o => o.value) : [];
    const missingBrands = requiredBrands.filter(v => !values.includes(v));
    const duplicateRefs = duplicateAddedReferences();
    const duplicateLabels = duplicateModelLabels();
    const cfg = window.AssistantArcherConfig;
    const failures = [];
    if (missingIds.length) failures.push(`DOM: ${missingIds.join(', ')}`);
    if (missingBrands.length) failures.push(`marques: ${missingBrands.join(', ')}`);
    if (duplicateRefs.length) failures.push(`references ajoutees dupliquees: ${duplicateRefs.join(', ')}`);
    if (duplicateLabels.length) failures.push(`modeles dupliques: ${duplicateLabels.join(', ')}`);
    if (!cfg || cfg.channel !== 'test') failures.push('configuration TEST centrale absente');
    document.documentElement.dataset.refactorSmoke = failures.length ? 'fail' : 'pass';
    if (failures.length) console.error('[Assistant Archer refactor] non-regression:', failures);
    return { ok: !failures.length, failures };
  }

  window.AssistantArcherRefactorAudit = Object.freeze({ audit, duplicateAddedReferences, duplicateModelLabels });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', audit, { once: true });
  else audit();
})();