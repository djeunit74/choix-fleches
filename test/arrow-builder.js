/* Assistant Archer TEST - parcours de fabrication Tube / Pointe / Empennage.
   Le moteur de spine reste dans app.js ; ce module ne fait que guider le choix des composants. */
(() => {
  'use strict';

  const state = {
    part: 'point',
    tubes: [],
    tube: null,
    point: null,
    pointReviewed: false,
    points: [],
    vane: null,
    vanes: [],
    calculated: false,
    showAllVanes: false
  };

  let refreshTimer = 0;

  const POINT_MEDIA = Object.freeze({
    'skylon-42-parallel': Object.freeze({
      imageUrl: 'https://www.dutchbowstore.com/media/0f/e6/89/1648816905/radiusBreakoffPoint.jpg?ts=1648816905',
      alt: 'Pointe Skylon 4.2 Break-off Parallel',
      sourceUrl: 'https://www.dutchbowstore.com/Skylon-ID4.2-Parallel-Break-off-Point-Radius-Brixxon/150359007',
      sourceLabel: 'DutchBowStore — photo produit'
    }),
    'skylon-42-bulge': Object.freeze({
      imageUrl: 'https://www.arrowforge.de/WebRoot/Store20/Shops/63122672/5F3A/7548/5FEC/66CB/3E43/0A0C/6D10/9735/101449_Skylon_Bulge_Break_Up_Einklebespitze_4.2_fuer_Radius_Brixxon_kaufen_new_3_2000_LEVOPT_V1.jpg',
      alt: 'Pointe Skylon 4.2 Break-off Bulge',
      sourceUrl: 'https://www.arrowforge.de/Skylon-Bulge-Break-Up-Einklebespitze-42-fuer-Radius/Brixxon',
      sourceLabel: 'Arrowforge — photo produit'
    })
  });

  const norm = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const esc = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const pointUiText = value => String(value || '')
    .replace(/\bfitments\b/gi, 'tailles compatibles')
    .replace(/\bfitment\b/gi, 'taille compatible');

  const theme = () => {
    const value = document.getElementById('themeSelect')?.value;
    return ['cible', 'campagne', '3d'].includes(value) ? value : 'cible';
  };

  const bow = () => document.getElementById('bowStyle')?.value === 'barebow' ? 'barebow' : 'classique';

  const weight = () => {
    const value = Number(document.getElementById('drawWeight')?.value);
    return Number.isFinite(value) ? value : null;
  };

  function meta(name) {
    try {
      if (typeof normalizeModelKey !== 'function' || typeof catalogState === 'undefined') return null;
      return catalogState?.models?.[normalizeModelKey(name)] || null;
    } catch {
      return null;
    }
  }

  function inferBrand(name) {
    try {
      if (typeof arrowCatalog === 'undefined') return '';
      const wanted = norm(name).replace(/\s+\d{3,4}$/, '');
      for (const [brand, spines] of Object.entries(arrowCatalog || {})) {
        for (const names of Object.values(spines || {})) {
          if (Array.isArray(names) && names.some(item => norm(item).replace(/\s+\d{3,4}$/, '') === wanted)) return brand;
        }
      }
    } catch {}
    return '';
  }

  function spine(text) {
    return String(text || '').match(/spine\s+(?:conseill[eé]\s+)?(\d{3,4})/i)?.[1]
      || String(text || '').match(/(?:base|eq\.)\s+(\d{3,4})/i)?.[1]
      || '';
  }

  function modelEntries() {
    const result = document.getElementById('result');
    if (!result) return [];
    const preferredBrand = document.getElementById('preferredBrand')?.value || 'all';
    const output = [];

    result.querySelectorAll('ul').forEach(list => {
      if (list.closest('.merchant-panel,.merchant-block')) return;
      list.querySelectorAll(':scope > li').forEach(item => {
        const strong = item.querySelector(':scope > strong');
        if (!strong) return;
        const model = strong.textContent.trim();
        if (!model) return;

        const card = list.closest('[data-aa-brand]');
        const addedEaston = Boolean(item.dataset.aaAddedReference);
        const modelMeta = meta(model);
        const inferred = inferBrand(model);
        const brand = card?.dataset?.aaBrand
          || (addedEaston ? 'easton' : '')
          || inferred
          || (preferredBrand !== 'all' ? preferredBrand : '');

        if (!brand && !modelMeta && !addedEaston) return;

        const advisedSpine = spine(item.textContent);
        const tube = {
          id: `${brand || 'unknown'}|${norm(model)}|${advisedSpine || 'na'}`,
          brand,
          model,
          spine: advisedSpine,
          meta: modelMeta
        };
        output.push({ item, tube });
      });
    });

    const seen = new Set();
    return output.filter(entry => {
      if (seen.has(entry.tube.id)) return false;
      seen.add(entry.tube.id);
      return true;
    });
  }

  function collectTubes() {
    return modelEntries().map(entry => entry.tube);
  }

  function pointRange(tube) {
    const range = Array.isArray(tube?.meta?.pointRange) ? tube.meta.pointRange.map(Number) : [];
    return range.length >= 2 && range.every(Number.isFinite)
      ? [Math.min(...range), Math.max(...range)]
      : null;
  }

  function tubeMatchesKey(tube, key) {
    const model = norm(tube?.model);
    const wanted = norm(key);
    if (!wanted) return false;
    // Les alias courts ne doivent jamais absorber une variante plus precise.
    if (wanted === 'x10') return model === 'x10';
    if (wanted === 'vap') return model === 'vap';
    return model === wanted || model.startsWith(`${wanted} `);
  }

  function matchedTubeKey(point, tube) {
    return (point?.tubeKeys || []).find(key => tubeMatchesKey(tube, key)) || '';
  }

  function pointFit(point, tube) {
    const key = matchedTubeKey(point, tube);
    if (!key) return null;

    const selectedSpine = Number(tube?.spine);
    const hasSpine = Number.isFinite(selectedSpine);
    const spineKey = hasSpine ? String(selectedSpine) : '';

    let recommended = null;
    if (point.recommendedWeightsByTubeSpine) {
      const byTube = point.recommendedWeightsByTubeSpine[norm(key)] || point.recommendedWeightsByTubeSpine[key];
      if (!byTube || !hasSpine || !Array.isArray(byTube[spineKey])) {
        return { point, key, weights: [], fitment: '', exact: false, reason: 'spine' };
      }
      recommended = byTube[spineKey].map(Number).filter(Number.isFinite);
    }

    if (Array.isArray(point.spines) && point.spines.length) {
      if (!hasSpine || !point.spines.map(Number).includes(selectedSpine)) {
        return { point, key, weights: [], fitment: '', exact: false, reason: 'spine' };
      }
    }

    let weights = Array.isArray(point.weights) ? point.weights.map(Number).filter(Number.isFinite) : [];
    if (point.weightsBySpine) {
      if (!hasSpine || !Array.isArray(point.weightsBySpine[spineKey])) {
        return { point, key, weights: [], fitment: '', exact: false, reason: 'spine' };
      }
      weights = point.weightsBySpine[spineKey].map(Number).filter(Number.isFinite);
    }

    if (recommended) {
      const allowed = new Set(weights);
      weights = recommended.filter(value => allowed.has(value));
    }

    const fitment = point.fitmentBySpine?.[spineKey] || point.fitment || '';
    return {
      point,
      key,
      weights: [...new Set(weights)].sort((a, b) => a - b),
      fitment,
      exact: true,
      reason: ''
    };
  }

  function pointCatalogForTube(tube) {
    return state.points
      .map(point => pointFit(point, tube))
      .filter(Boolean)
      .sort((a, b) => Number(b.exact) - Number(a.exact) || a.point.manufacturer.localeCompare(b.point.manufacturer));
  }

  function vaneScore(vane) {
    let score = 0;
    const reasons = [];
    const tubeDiameter = Array.isArray(state.tube?.meta?.diameters) ? norm(state.tube.meta.diameters[0]) : '';

    if (vane.disciplines?.includes(theme())) {
      score += 4;
      reasons.push('discipline coherente');
    }
    if (vane.bowStyles?.includes(bow())) {
      score += 2;
      reasons.push('type d arc coherent');
    }
    if (!tubeDiameter || vane.diameters?.includes(tubeDiameter)) {
      score += 2;
      if (tubeDiameter) reasons.push('diametre coherent');
    }

    const drawWeight = weight();
    if (!vane.drawWeight || !Number.isFinite(drawWeight) || (drawWeight >= vane.drawWeight[0] && drawWeight <= vane.drawWeight[1])) score += 1;
    else score -= 2;

    return { score, reasons };
  }

  function vaneGraphic() {
    return `
      <svg class="arrow-vane-svg" viewBox="0 0 150 48" aria-hidden="true" focusable="false">
        <rect class="arrow-vane-shaft" x="0" y="21" width="150" height="6" rx="3"></rect>
        <rect class="arrow-vane-collar" x="42" y="17" width="8" height="14" rx="2"></rect>
        <path class="arrow-vane-wing" d="M48 20 C58 7 88 6 111 17 L111 21 L48 21 Z"></path>
        <path class="arrow-vane-wing arrow-vane-wing-lower" d="M48 28 C60 39 88 41 111 30 L111 27 L48 27 Z"></path>
      </svg>`;
  }

  function ensureBuilder() {
    const result = document.getElementById('result');
    if (!result) return null;

    let builder = document.getElementById('arrowBuilder');
    if (!builder) {
      builder = document.createElement('section');
      builder.id = 'arrowBuilder';
      builder.className = 'card arrow-builder arrow-builder-compact arrow-builder-inline';
      builder.innerHTML = `
        <div class="arrow-builder-head">
          <div>
            <p class="arrow-builder-kicker">Construire ma fleche</p>
            <h2>Ma fleche</h2>
          </div>
          <p class="arrow-builder-state" id="arrowBuilderState"></p>
        </div>
        <p class="arrow-builder-intro">Suivez les etapes : choisissez d abord un tube dans les modeles coherents, puis sa pointe et enfin l empennage.</p>
        <div class="arrow-assembly arrow-build-flow" aria-label="Etapes de fabrication de la fleche">
          <button type="button" class="arrow-part arrow-part-shaft" data-arrow-part="shaft" aria-label="Etape 1 : choisir le tube">
            <span class="arrow-step-number">1</span>
            <span class="arrow-part-art" aria-hidden="true"></span>
            <span>Tube</span>
          </button>
          <button type="button" class="arrow-part arrow-part-point" data-arrow-part="point" aria-label="Etape 2 : choisir la pointe">
            <span class="arrow-step-number">2</span>
            <span class="arrow-part-art" aria-hidden="true"></span>
            <span>Pointe</span>
          </button>
          <button type="button" class="arrow-part arrow-part-vane" data-arrow-part="vane" aria-label="Etape 3 : choisir l empennage">
            <span class="arrow-step-number">3</span>
            <span class="arrow-part-art">${vaneGraphic()}</span>
            <span>Empennage</span>
          </button>
        </div>
        <div class="arrow-builder-selection-line" id="arrowBuilderSummary"></div>`;

      builder.querySelectorAll('[data-arrow-part]').forEach(button => {
        button.addEventListener('click', () => {
          const part = button.dataset.arrowPart;
          if (part === 'shaft') scrollToTubeChoices();
          else if (part === 'point' && state.tube) openPart('point');
          else if (part === 'vane' && state.tube && state.pointReviewed) openPart('vane');
        });
      });
    }

    if (builder.parentElement !== result.parentElement || builder.nextElementSibling !== result) {
      result.insertAdjacentElement('beforebegin', builder);
    }
    return builder;
  }

  function ensureDialog() {
    let dialog = document.getElementById('arrowBuilderDialog');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.id = 'arrowBuilderDialog';
    dialog.className = 'arrow-builder-dialog';
    dialog.innerHTML = `
      <div class="arrow-builder-sheet">
        <header class="arrow-builder-sheet-head">
          <div>
            <p class="arrow-builder-kicker">Construire ma fleche</p>
            <h2 id="arrowBuilderDialogTitle">Composant</h2>
          </div>
          <button type="button" class="arrow-builder-close" data-arrow-builder-close aria-label="Fermer">×</button>
        </header>
        <div class="arrow-builder-dialog-body" id="arrowBuilderPanel"></div>
      </div>`;

    document.body.appendChild(dialog);
    dialog.querySelector('[data-arrow-builder-close]')?.addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeDialog();
    });
    return dialog;
  }

  function closeDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function scrollDialogTop() {
    document.getElementById('arrowBuilderPanel')?.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  function openPart(part) {
    if (part === 'shaft') {
      closeDialog();
      scrollToTubeChoices();
      return;
    }
    if (part === 'point' && !state.tube) {
      scrollToTubeChoices();
      return;
    }
    if (part === 'vane' && (!state.tube || !state.pointReviewed)) return;

    state.part = part;
    const dialog = ensureDialog();
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    renderDialog();
    setTimeout(scrollDialogTop, 0);
  }

  function scrollToTubeChoices() {
    const firstButton = document.querySelector('#result .arrow-model-select');
    const target = firstButton?.closest('li') || document.getElementById('result');
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }

  function resetComposition() {
    state.tube = null;
    state.point = null;
    state.pointReviewed = false;
    state.vane = null;
    state.showAllVanes = false;
    state.part = 'point';
  }

  function selectTube(id) {
    const selected = state.tubes.find(entry => entry.id === id) || null;
    if (!selected) return;
    state.tube = selected;
    state.point = null;
    state.pointReviewed = false;
    state.vane = null;
    state.showAllVanes = false;
    state.part = 'point';
    decorateModelChoices();
    render();
    openPart('point');
  }

  function decorateModelChoices() {
    modelEntries().forEach(({ item, tube }) => {
      let row = item.querySelector(':scope > .arrow-model-select-row');
      if (!row) {
        row = document.createElement('div');
        row.className = 'arrow-model-select-row';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'secondary arrow-model-select';
        row.appendChild(button);
        item.appendChild(row);
      }

      const button = row.querySelector('.arrow-model-select');
      if (!button) return;
      button.dataset.selectTube = tube.id;
      const selected = state.tube?.id === tube.id;
      button.classList.toggle('is-selected', selected);
      const label = selected ? '✓ Tube selectionne' : 'Selectionner ce tube';
      if (button.textContent !== label) button.textContent = label;

      if (!button.dataset.bound) {
        button.dataset.bound = '1';
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          selectTube(button.dataset.selectTube);
        });
      }
    });
  }

  function renderSummary() {
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary) return;
    const tubeText = state.tube ? `${state.tube.model}${state.tube.spine ? ` ${state.tube.spine}` : ''}` : 'a choisir';
    const pointText = state.point
      ? `${state.point.manufacturer} ${state.point.model} · ${state.point.weight} gr`
      : state.pointReviewed ? 'a documenter' : 'a choisir';
    const vaneText = state.vane ? state.vane.model : 'a choisir';
    summary.innerHTML = `
      <span><strong>Tube :</strong> ${esc(tubeText)}</span>
      <span><strong>Pointe :</strong> ${esc(pointText)}</span>
      <span><strong>Empennage :</strong> ${esc(vaneText)}</span>`;
  }

  function renderFlowState() {
    const stateElement = document.getElementById('arrowBuilderState');
    if (stateElement) {
      if (!state.calculated) stateElement.textContent = 'Calculez d abord les tubes';
      else if (!state.tube) stateElement.textContent = 'Etape 1 · choisissez un tube';
      else if (!state.pointReviewed) stateElement.textContent = 'Etape 2 · choisissez la pointe';
      else if (!state.vane) stateElement.textContent = 'Etape 3 · choisissez l empennage';
      else stateElement.textContent = 'Fleche composee';
    }

    document.querySelectorAll('#arrowBuilder [data-arrow-part]').forEach(button => {
      const part = button.dataset.arrowPart;
      let status = 'locked';
      if (part === 'shaft') status = state.tube ? 'complete' : 'current';
      if (part === 'point') status = state.pointReviewed ? 'complete' : state.tube ? 'current' : 'locked';
      if (part === 'vane') status = state.vane ? 'complete' : state.pointReviewed ? 'current' : 'locked';
      button.dataset.stepState = status;
      button.disabled = status === 'locked';
    });
  }

  function renderPointCard(match) {
    const point = match.point;
    const fitment = match.fitment
      ? ` · Taille compatible fabricant : ${String(match.fitment).replace(/^#/, 'n°')}`
      : '';
    const selected = state.point?.id === point.id;
    const media = POINT_MEDIA[point.id] || null;
    const mediaBlock = media
      ? `<figure class="arrow-point-media">
          <a href="${esc(media.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="arrow-point-media-link">
            <img src="${esc(media.imageUrl)}" alt="${esc(media.alt)}" loading="lazy" decoding="async" data-point-image>
          </a>
          <figcaption>Photo illustrative · <a href="${esc(media.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(media.sourceLabel)}</a></figcaption>
        </figure>`
      : '';
    const weightButtons = match.weights.length
      ? `<div class="arrow-point-choices">${match.weights.map(value => `
          <button type="button" class="arrow-point-choice${selected && state.point?.weight === value ? ' is-selected' : ''}"
            data-point-id="${esc(point.id)}" data-point-weight="${value}">
            <strong>${value} gr</strong><span>selectionner</span>
          </button>`).join('')}</div>`
      : '<p class="muted">Poids non selectionnable tant que le spine fabricant exact n est pas confirme.</p>';

    return `
      <article class="arrow-component-card${selected ? ' is-selected' : ''}">
        <div class="arrow-component-card-head">
          <div>
            <span class="arrow-component-brand">${esc(point.manufacturer)} · ${esc(point.family)}</span>
            <h4>${esc(point.model)}</h4>
          </div>
          ${match.exact ? '<span class="arrow-builder-badge">Compatible</span>' : '<span class="arrow-builder-badge is-secondary">Spine a confirmer</span>'}
        </div>
        <p class="arrow-component-specs">${esc(point.material || 'Materiau non indique')} · ${esc(point.mount || 'Montage non indique')}${esc(fitment)}</p>
        ${mediaBlock}
        ${point.note ? `<p>${esc(pointUiText(point.note))}</p>` : ''}
        ${weightButtons}
        <p class="arrow-source"><a href="${esc(point.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source fabricant : ${esc(point.sourceLabel)}</a></p>
      </article>`;
  }

  function renderPointPanel(panel) {
    if (!state.tube) {
      panel.innerHTML = '<h3>2. Pointe</h3><p>Selectionnez d abord un tube dans les modeles coherents.</p>';
      return;
    }

    const matches = pointCatalogForTube(state.tube);
    const exact = matches.filter(match => match.exact && match.weights.length);
    const unresolved = matches.filter(match => !match.exact);
    const range = pointRange(state.tube);

    let body = '';
    if (exact.length) {
      body = `
        <div class="arrow-builder-panel-head">
          <div>
            <h3>2. Pointe pour ${esc(state.tube.model)}</h3>
            <p>References fabricant compatibles avec le tube et le spine selectionnes.</p>
          </div>
          <span class="arrow-builder-count">${exact.length} reference${exact.length > 1 ? 's' : ''}</span>
        </div>
        <div class="arrow-component-list">${exact.map(renderPointCard).join('')}</div>`;
    } else if (unresolved.length) {
      body = `
        <h3>2. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Le catalogue de pointes existe pour ce tube, mais le spine ${esc(state.tube.spine || 'non precise')} n est pas un spine fabricant documente dans cette source.</strong>
          <p>Confirmez d abord la reference / le spine exact du tube avant de choisir la taille de pointe compatible.</p>
        </div>
        <div class="arrow-point-known-families">
          ${unresolved.map(match => `<span>${esc(match.point.manufacturer)} · ${esc(match.point.model)}</span>`).join('')}
        </div>
        <button type="button" class="arrow-continue" data-continue-vane>Continuer vers l empennage sans valider de pointe</button>`;
    } else if (range) {
      body = `
        <h3>2. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Plage technique connue : ${range[0]}–${range[1]} gr.</strong>
          <p>Aucune reference fabricant exacte n est encore reliee a ce modele dans le catalogue composants.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-vane>Continuer vers l empennage sans valider de pointe</button>`;
    } else {
      body = `
        <h3>2. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Reference exacte pas encore documentee.</strong>
          <p>On n invente pas de pointe compatible.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-vane>Continuer vers l empennage sans valider de pointe</button>`;
    }

    panel.innerHTML = body;

    panel.querySelectorAll('[data-point-image]').forEach(image => {
      image.addEventListener('error', () => image.closest('.arrow-point-media')?.remove(), { once: true });
    });

    panel.querySelectorAll('[data-point-id]').forEach(button => {
      button.addEventListener('click', () => {
        const point = state.points.find(entry => entry.id === button.dataset.pointId);
        const pointWeight = Number(button.dataset.pointWeight);
        if (!point || !Number.isFinite(pointWeight)) return;
        state.point = {
          id: point.id,
          manufacturer: point.manufacturer,
          model: point.model,
          weight: pointWeight
        };
        state.pointReviewed = true;
        state.part = 'vane';
        render();
        renderDialog();
        scrollDialogTop();
      });
    });

    panel.querySelector('[data-continue-vane]')?.addEventListener('click', () => {
      state.point = null;
      state.pointReviewed = true;
      state.part = 'vane';
      render();
      renderDialog();
      scrollDialogTop();
    });
  }

  function renderVanePanel(panel) {
    if (!state.tube || !state.pointReviewed) {
      panel.innerHTML = '<h3>3. Empennage</h3><p>Terminez d abord l etape Pointe.</p>';
      return;
    }
    if (!state.vanes.length) {
      panel.innerHTML = '<h3>3. Empennage</h3><p>Chargement du catalogue de plumes sourcees…</p>';
      return;
    }

    const ranked = state.vanes
      .map(vane => ({ vane, match: vaneScore(vane) }))
      .sort((a, b) => b.match.score - a.match.score || a.vane.manufacturer.localeCompare(b.vane.manufacturer));

    const visible = state.showAllVanes ? ranked : ranked.slice(0, 3);
    const remaining = Math.max(0, ranked.length - visible.length);

    panel.innerHTML = `
      <div class="arrow-builder-panel-head">
        <div>
          <h3>3. Empennage</h3>
          <p>Les plus coherents sont affiches en premier selon la discipline, le type d arc et le diametre du tube.</p>
        </div>
        <span class="arrow-builder-count">${ranked.length} references sourcees</span>
      </div>
      <div class="arrow-component-list">
        ${visible.map(({ vane, match }) => `
          <article class="arrow-component-card${state.vane?.id === vane.id ? ' is-selected' : ''}">
            <div class="arrow-component-card-head">
              <div>
                <span class="arrow-component-brand">${esc(vane.manufacturer)} · ${esc(vane.family)}</span>
                <h4>${esc(vane.model)}</h4>
              </div>
              <span class="arrow-builder-badge">${match.score >= 7 ? 'Tres coherente' : match.score >= 5 ? 'A envisager' : 'Usage specifique'}</span>
            </div>
            <p class="arrow-component-specs">Longueur ${esc(vane.length)}${vane.weight ? ` · ${esc(vane.weight)}` : ''} · ${esc(vane.stiffness)}</p>
            <p>${esc(vane.use)}</p>
            ${match.reasons.length ? `<p class="muted">Pourquoi ici : ${esc(match.reasons.join(' · '))}.</p>` : ''}
            <p class="arrow-source"><a href="${esc(vane.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source fabricant : ${esc(vane.sourceLabel)}</a></p>
            <button type="button" class="secondary arrow-select-component" data-vane="${esc(vane.id)}">${state.vane?.id === vane.id ? '✓ Empennage selectionne' : 'Choisir cet empennage'}</button>
          </article>`).join('')}
      </div>
      ${!state.showAllVanes && remaining > 0 ? `<button type="button" class="arrow-show-all" data-show-all-vanes>Voir tous les modeles (+${remaining})</button>` : ''}`;

    panel.querySelectorAll('[data-vane]').forEach(button => {
      button.addEventListener('click', () => {
        state.vane = state.vanes.find(vane => vane.id === button.dataset.vane) || null;
        render();
        closeDialog();
        document.getElementById('arrowBuilder')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      });
    });

    panel.querySelector('[data-show-all-vanes]')?.addEventListener('click', () => {
      state.showAllVanes = true;
      renderDialog();
    });
  }

  function renderDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog?.open) return;
    const title = document.getElementById('arrowBuilderDialogTitle');
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) return;

    if (state.part === 'vane') {
      if (title) title.textContent = 'Etape 3 · Empennage';
      renderVanePanel(panel);
    } else {
      if (title) title.textContent = 'Etape 2 · Pointe';
      renderPointPanel(panel);
    }
  }

  function render() {
    ensureBuilder();
    renderFlowState();
    renderSummary();
    decorateModelChoices();
    renderDialog();
  }

  function refresh() {
    ensureBuilder();
    const tubes = collectTubes();
    state.tubes = tubes;
    state.calculated = tubes.length > 0;

    if (state.tube) {
      const stillAvailable = tubes.find(entry => entry.id === state.tube.id) || null;
      if (!stillAvailable) resetComposition();
      else state.tube = stillAvailable;
    }

    render();
  }

  function scheduleRefresh(delay = 100) {
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, delay);
  }

  async function loadComponents() {
    try {
      const response = await fetch('./arrow-components.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      state.points = Array.isArray(data.points) ? data.points : [];
      state.vanes = Array.isArray(data.vanes) ? data.vanes : [];
    } catch (error) {
      console.warn('[Assistant Archer] catalogue composants indisponible', error);
      state.points = [];
      state.vanes = [];
    }
    render();
  }

  function install() {
    ensureBuilder();
    ensureDialog();

    const result = document.getElementById('result');
    if (result && !result.dataset.arrowBuilderObserved) {
      result.dataset.arrowBuilderObserved = '1';
      new MutationObserver(() => scheduleRefresh(120)).observe(result, { childList: true, subtree: true });
    }

    const form = document.getElementById('spine-form');
    form?.addEventListener('submit', () => {
      resetComposition();
      state.tubes = [];
      state.calculated = false;
      render();
      scheduleRefresh(180);
      window.setTimeout(refresh, 450);
    });

    document.getElementById('themeSelect')?.addEventListener('change', () => {
      state.vane = null;
      state.showAllVanes = false;
      render();
    });
    document.getElementById('bowStyle')?.addEventListener('change', () => {
      state.vane = null;
      state.showAllVanes = false;
      render();
    });

    loadComponents();
    refresh();
  }

  window.AssistantArcherArrowBuilder = Object.freeze({ refresh, version: 'v55' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
