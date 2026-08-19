/* Assistant Archer - garde de non-regression pendant le refactor.
   Ne modifie aucune logique metier. Signale les fonctions/DOM essentiels manquants et maintient temporairement l'avertissement du choix des fleches. */
(() => {
  const requiredIds = [
    'spine-form','result','historyContent','clearHistoryBtn',
    'arc-setup-form','arcSetupResult','bowStyle',
    'notebook-form','notebookResult','notebookStatus',
    'sight-form','sightResult','sightStatus','sightMarkers'
  ];
  const requiredBrands = ['skylon','easton','victory','carbon'];

  function ensureArrowChoiceWorkBanner() {
    if (document.querySelector('[data-aa-work-banner], [aria-label="Choix des fleches en travaux"]')) return;
    const panel = document.querySelector('.tab-panel[data-panel="spine"]');
    if (!panel) return;
    const banner = document.createElement('aside');
    banner.dataset.aaWorkBanner = '1';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-label', 'Choix des fleches en travaux');
    banner.style.cssText = 'margin:0 0 1rem;padding:1rem 1.1rem;border:2px dashed #b56a00;border-radius:14px;background:#fff4d6;color:#5d3a00;box-shadow:0 6px 18px rgba(93,58,0,.10)';
    banner.innerHTML = '<strong style="font-size:1.08rem">🏹 Zone de tir en travaux 🚧</strong><br><span>Le choix des flèches est actuellement en réglage fin. Les flèches, elles, vont droit… le code fait encore quelques écarts. 😄 Utilisez les recommandations avec prudence jusqu’à la fin des vérifications.</span>';
    panel.prepend(banner);
  }

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
    ensureArrowChoiceWorkBanner();
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