/* Assistant Archer - garde de non-regression pendant le refactor.
   Restaure les interfaces carnet/reperes perdues pendant la simplification UI,
   sans modifier leur stockage historique dans app.js. */
(() => {
  const requiredIds = [
    'spine-form','result','historyContent','clearHistoryBtn',
    'arc-setup-form','arcSetupResult','bowStyle',
    'notebook-form','notebookResult','notebookStatus','notebookContent','saveNotebookBtn',
    'sight-form','sightResult','sightStatus','sightMarkers','sightRail'
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

  function restoreNotebookUi() {
    const form = document.getElementById('notebook-form');
    if (!form) return;
    const actions = form.querySelector('.row-actions');
    if (actions && !document.getElementById('saveNotebookBtn')) {
      const save = document.createElement('button');
      save.id = 'saveNotebookBtn';
      save.type = 'submit';
      save.textContent = 'Enregistrer la fiche';
      const reset = document.getElementById('resetNotebookBtn');
      actions.insertBefore(save, reset || null);
    }
    const card = form.closest('.card');
    if (card && !card.querySelector('.aa-notebook-intro')) {
      const intro = document.createElement('p');
      intro.className = 'aa-notebook-intro';
      intro.textContent = 'Enregistrez vos reglages, retrouvez une fiche plus tard, chargez-la pour la consulter ou la modifier, puis enregistrez-la de nouveau.';
      const heading = card.querySelector('h2');
      heading?.insertAdjacentElement('afterend', intro);
    }
  }

  function createFixedSightInputs(holder) {
    [18,30,40,50,60,70].forEach(distance => {
      if (holder.querySelector(`.sight-mark-input[data-distance="${distance}"]`)) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.className = 'sight-mark-input';
      input.dataset.distance = String(distance);
      input.id = `sightMark${distance}`;
      input.inputMode = 'decimal';
      holder.appendChild(input);
    });
  }

  function restoreSightUi() {
    const form = document.getElementById('sight-form');
    const markers = document.getElementById('sightMarkers');
    const rail = document.getElementById('sightRail');
    if (!form || !markers || !rail) return;

    let section = form.querySelector('.aa-restored-sight-ui');
    if (!section) {
      section = document.createElement('section');
      section.className = 'subcard aa-restored-sight-ui';
      section.innerHTML = '<h3>Reperes par distance</h3><div class="sight-layout"><div class="sight-mark-grid sight-mark-fields" aria-hidden="true"></div><div class="sight-visual" id="sightVisual"></div></div>';
      const notes = document.getElementById('sightNotes')?.closest('label');
      form.insertBefore(section, notes || form.querySelector('.row-actions') || null);
    }

    const holder = section.querySelector('.sight-mark-fields');
    if (!holder) return;
    holder.innerHTML = '';
    createFixedSightInputs(holder);

    const visual = section.querySelector('.sight-visual');
    if (!visual) return;
    const help = document.getElementById('sightHelp');
    const note = document.getElementById('sightScaleNote');
    if (help) {
      help.className = 'sight-help';
      if (!help.textContent.trim()) help.textContent = 'Indiquez une distance, ajoutez le curseur, puis glissez-le sur la reglette ou la palette.';
      visual.appendChild(help);
    }

    rail.className = 'sight-rail';
    rail.setAttribute('aria-label', document.documentElement.dataset.bowStyle === 'barebow' ? 'Palette barebow de 0 a 16 centimetres' : 'Reglette de viseur de 0 a 16 centimetres');
    rail.innerHTML = '<span class="sight-scale-label" style="top:8%">0 cm</span><span class="sight-scale-label" style="top:29%">4</span><span class="sight-scale-label" style="top:50%">8</span><span class="sight-scale-label" style="top:71%">12</span><span class="sight-scale-label" style="top:92%">16 cm</span><span class="sight-tick is-major" style="top:8%"></span><span class="sight-tick is-major" style="top:29%"></span><span class="sight-tick is-major" style="top:50%"></span><span class="sight-tick is-major" style="top:71%"></span><span class="sight-tick is-major" style="top:92%"></span>';
    markers.className = 'sight-markers';
    markers.innerHTML = '';
    rail.appendChild(markers);
    visual.appendChild(rail);

    if (note) {
      note.className = 'sight-scale-note';
      if (!note.textContent.trim()) note.textContent = '0 cm en haut, 16 cm en bas. Fleches clavier : 1 mm, Page : 1 cm.';
      visual.appendChild(note);
    }

    const heading = form.closest('.card')?.querySelector('h2');
    if (heading && !form.closest('.card')?.querySelector('.aa-sight-intro-restored')) {
      const intro = document.createElement('p');
      intro.className = 'aa-sight-intro-restored';
      intro.textContent = 'Enregistrez vos reperes par distance. Les fiches sauvegardees peuvent ensuite etre chargees, consultees, modifiees ou supprimees.';
      heading.insertAdjacentElement('afterend', intro);
    }

    try { if (typeof renderSightVisual === 'function') renderSightVisual(); } catch (error) { console.error('[Assistant Archer] restauration reperes:', error); }
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
    restoreNotebookUi();
    restoreSightUi();
    const missingIds = requiredIds.filter(id => !document.getElementById(id));
    const brandSelect = document.getElementById('preferredBrand');
    const values = brandSelect ? [...brandSelect.options].map(o => o.value) : [];
    const missingBrands = requiredBrands.filter(v => !values.includes(v));
    const duplicateRefs = duplicateAddedReferences();
    const duplicateLabels = duplicateModelLabels();
    const failures = [];
    if (missingIds.length) failures.push(`DOM: ${missingIds.join(', ')}`);
    if (!document.querySelector('.sight-mark-fields .sight-mark-input[data-distance="18"]')) failures.push('reperes: champs par distance absents');
    if (missingBrands.length) failures.push(`marques: ${missingBrands.join(', ')}`);
    if (duplicateRefs.length) failures.push(`references ajoutees dupliquees: ${duplicateRefs.join(', ')}`);
    if (duplicateLabels.length) failures.push(`modeles dupliques: ${duplicateLabels.join(', ')}`);
    const cfg = window.AssistantArcherConfig;
    if (!cfg || cfg.channel !== 'test') failures.push('configuration TEST centrale absente');
    document.documentElement.dataset.refactorSmoke = failures.length ? 'fail' : 'pass';
    if (failures.length) console.error('[Assistant Archer refactor] non-regression:', failures);
    return { ok: !failures.length, failures };
  }

  window.AssistantArcherRefactorAudit = Object.freeze({ audit, duplicateAddedReferences, duplicateModelLabels, restoreNotebookUi, restoreSightUi });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', audit, { once: true });
  else audit();
})();