/* Assistant Archer TEST - construction guidee Tube / Empennage / Pointe / Equilibre.
   Le moteur de spine reste dans app.js. Ce module guide les composants et n'influence jamais la recommandation technique du tube. */
(() => {
  'use strict';

  const state = {
    part: 'vane',
    tubes: [],
    tube: null,
    point: null,
    pointReviewed: false,
    vane: null,
    vanes: [],
    points: [],
    balanceProfiles: [],
    balanceMethod: null,
    balanceReviewed: false,
    calculated: false,
    showAllVanes: false
  };

  let refreshTimer = 0;

  const POINT_MEDIA = Object.freeze({
    'skylon-42-parallel': Object.freeze({
      imageUrl: 'https://www.skylonarchery.com/images/components/42parallel.png',
      alt: 'Pointe Skylon 4.2 Break-off Parallel',
      sourceUrl: 'https://www.skylonarchery.com/components-for-arrow',
      sourceLabel: 'Skylon — photo composant fabricant'
    }),
    'skylon-42-bulge': Object.freeze({
      imageUrl: 'https://www.skylonarchery.com/images/components/42bulge.png',
      alt: 'Pointe Skylon 4.2 Break-off Bulge',
      sourceUrl: 'https://www.skylonarchery.com/components-for-arrow',
      sourceLabel: 'Skylon — photo composant fabricant'
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

  const drawWeight = () => {
    const value = Number(document.getElementById('drawWeight')?.value);
    return Number.isFinite(value) ? value : null;
  };

  const arrowLength = () => {
    const value = Number(document.getElementById('arrowLength')?.value);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  function numericText(value) {
    const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  function vaneWeight(vane) {
    const direct = Number(vane?.weightGrains);
    if (Number.isFinite(direct)) return direct;
    return numericText(vane?.weight);
  }

  function vaneLength(vane) {
    return numericText(vane?.length);
  }

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
    if (wanted === 'x10') return model === 'x10';
    if (wanted === 'vap') return model === 'vap';
    if (wanted === 'ace' || wanted === 'a c e') return model === 'a c e' || model === 'ace';
    return model === wanted || model.startsWith(`${wanted} `);
  }

  function matchedTubeKey(entry, tube) {
    return (entry?.tubeKeys || []).find(key => tubeMatchesKey(tube, key)) || '';
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

  function balanceProfileForTube(tube) {
    return state.balanceProfiles.find(profile => matchedTubeKey(profile, tube)) || null;
  }

  function estimateBalance(pointWeight) {
    const profile = balanceProfileForTube(state.tube);
    const length = arrowLength();
    const selectedSpine = String(state.tube?.spine || '');
    const gpi = Number(profile?.gpiBySpine?.[selectedSpine]);
    const rearWeight = Number(profile?.rearAssembly?.weightGrains);
    const singleVaneWeight = vaneWeight(state.vane);
    const selectedVaneLength = vaneLength(state.vane);
    const missing = [];

    if (!profile) missing.push('masse du tube par spine');
    if (!Number.isFinite(length)) missing.push('longueur de fleche');
    if (!Number.isFinite(gpi)) missing.push('GPI du tube');
    if (!Number.isFinite(singleVaneWeight)) missing.push('masse de la plume');
    if (!Number.isFinite(selectedVaneLength)) missing.push('longueur de la plume');
    if (!Number.isFinite(rearWeight)) missing.push('masse encoche / pin');
    if (!Number.isFinite(Number(pointWeight))) missing.push('masse de pointe');

    if (missing.length) {
      return {
        complete: false,
        missing,
        profile,
        gpi: Number.isFinite(gpi) ? gpi : null,
        shaftMass: Number.isFinite(gpi) && Number.isFinite(length) ? gpi * length : null
      };
    }

    const method = state.balanceMethod || {};
    const setback = Number.isFinite(Number(method.vaneSetbackInches)) ? Number(method.vaneSetbackInches) : 1;
    const targetFoc = Number.isFinite(Number(method.targetFoc)) ? Number(method.targetFoc) : 12;
    const range = Array.isArray(method.coherentFocRange) && method.coherentFocRange.length >= 2
      ? method.coherentFocRange.map(Number)
      : [10, 15];

    const shaftMass = gpi * length;
    const vanesMass = singleVaneWeight * 3;
    const vaneCenter = Math.min(length * 0.35, setback + selectedVaneLength / 2);
    const totalMass = shaftMass + Number(pointWeight) + vanesMass + rearWeight;
    const moment = shaftMass * (length / 2)
      + Number(pointWeight) * length
      + vanesMass * vaneCenter;
    const balancePoint = moment / totalMass;
    const foc = ((balancePoint - length / 2) / length) * 100;
    const coherent = foc >= Math.min(...range) && foc <= Math.max(...range);

    return {
      complete: true,
      profile,
      length,
      gpi,
      shaftMass,
      singleVaneWeight,
      vanesMass,
      rearWeight,
      totalMass,
      vaneCenter,
      balancePoint,
      foc,
      coherent,
      targetFoc,
      range,
      distanceToTarget: Math.abs(foc - targetFoc)
    };
  }

  function pointCandidates() {
    const matches = pointCatalogForTube(state.tube).filter(match => match.exact && match.weights.length);
    const candidates = [];
    matches.forEach(match => {
      match.weights.forEach(weightValue => {
        candidates.push({
          id: `${match.point.id}|${weightValue}`,
          match,
          weight: weightValue,
          estimate: estimateBalance(weightValue)
        });
      });
    });

    const allWeights = candidates.map(candidate => candidate.weight).sort((a, b) => a - b);
    const median = allWeights.length ? allWeights[Math.floor((allWeights.length - 1) / 2)] : null;

    return candidates.sort((a, b) => {
      const ac = a.estimate.complete;
      const bc = b.estimate.complete;
      if (ac !== bc) return Number(bc) - Number(ac);
      if (ac && bc) {
        if (a.estimate.coherent !== b.estimate.coherent) return Number(b.estimate.coherent) - Number(a.estimate.coherent);
        if (a.estimate.distanceToTarget !== b.estimate.distanceToTarget) return a.estimate.distanceToTarget - b.estimate.distanceToTarget;
      } else if (Number.isFinite(median)) {
        const da = Math.abs(a.weight - median);
        const db = Math.abs(b.weight - median);
        if (da !== db) return da - db;
      }
      return a.match.point.manufacturer.localeCompare(b.match.point.manufacturer)
        || a.match.point.model.localeCompare(b.match.point.model)
        || a.weight - b.weight;
    });
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

    const power = drawWeight();
    if (!vane.drawWeight || !Number.isFinite(power) || (power >= vane.drawWeight[0] && power <= vane.drawWeight[1])) score += 1;
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

  function balanceGraphic() {
    return `
      <span class="arrow-balance-line" aria-hidden="true">
        <span class="arrow-balance-mid"></span>
        <span class="arrow-balance-dot"></span>
      </span>`;
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
        <p class="arrow-builder-intro">Construisez dans l ordre : tube, empennage, pointe preselectionnee, puis controle de l equilibre.</p>
        <div class="arrow-assembly arrow-build-flow" aria-label="Etapes de fabrication de la fleche">
          <button type="button" class="arrow-part arrow-part-shaft" data-arrow-part="shaft" aria-label="Etape 1 : choisir le tube">
            <span class="arrow-step-number">1</span>
            <span class="arrow-part-art" aria-hidden="true"></span>
            <span>Tube</span>
          </button>
          <button type="button" class="arrow-part arrow-part-vane" data-arrow-part="vane" aria-label="Etape 2 : choisir l empennage">
            <span class="arrow-step-number">2</span>
            <span class="arrow-part-art">${vaneGraphic()}</span>
            <span>Empennage</span>
          </button>
          <button type="button" class="arrow-part arrow-part-point" data-arrow-part="point" aria-label="Etape 3 : choisir la pointe recommandee">
            <span class="arrow-step-number">3</span>
            <span class="arrow-part-art" aria-hidden="true"></span>
            <span>Pointe</span>
          </button>
          <button type="button" class="arrow-part arrow-part-balance" data-arrow-part="balance" aria-label="Etape 4 : verifier l equilibre">
            <span class="arrow-step-number">4</span>
            <span class="arrow-part-art">${balanceGraphic()}</span>
            <span>Equilibre</span>
          </button>
        </div>
        <div class="arrow-builder-selection-line" id="arrowBuilderSummary"></div>`;

      builder.querySelectorAll('[data-arrow-part]').forEach(button => {
        button.addEventListener('click', () => {
          const part = button.dataset.arrowPart;
          if (part === 'shaft') scrollToTubeChoices();
          else if (part === 'vane' && state.tube) openPart('vane');
          else if (part === 'point' && state.tube && state.vane) openPart('point');
          else if (part === 'balance' && state.pointReviewed) openPart('balance');
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
    if (part === 'vane' && !state.tube) {
      scrollToTubeChoices();
      return;
    }
    if (part === 'point' && (!state.tube || !state.vane)) return;
    if (part === 'balance' && !state.pointReviewed) return;

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
    state.balanceReviewed = false;
    state.showAllVanes = false;
    state.part = 'vane';
  }

  function selectTube(id) {
    const selected = state.tubes.find(entry => entry.id === id) || null;
    if (!selected) return;
    state.tube = selected;
    state.point = null;
    state.pointReviewed = false;
    state.vane = null;
    state.balanceReviewed = false;
    state.showAllVanes = false;
    state.part = 'vane';
    decorateModelChoices();
    render();
    openPart('vane');
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
      const label = selected ? '✓ Tube selectionne' : 'Choisir ce tube';
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

  function currentBalance() {
    if (!state.point?.weight) return null;
    return estimateBalance(state.point.weight);
  }

  function renderSummary() {
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary) return;
    const tubeText = state.tube ? `${state.tube.model}${state.tube.spine ? ` ${state.tube.spine}` : ''}` : 'a choisir';
    const vaneText = state.vane ? state.vane.model : 'a choisir';
    const pointText = state.point
      ? `${state.point.manufacturer} ${state.point.model} · ${state.point.weight} gr`
      : state.pointReviewed ? 'a documenter' : 'a choisir';
    const balance = currentBalance();
    const balanceText = balance?.complete
      ? `FOC estime ${balance.foc.toFixed(1)} %`
      : state.pointReviewed ? 'estimation incomplete' : 'a verifier';

    summary.innerHTML = `
      <span><strong>Tube :</strong> ${esc(tubeText)}</span>
      <span><strong>Empennage :</strong> ${esc(vaneText)}</span>
      <span><strong>Pointe :</strong> ${esc(pointText)}</span>
      <span><strong>Equilibre :</strong> ${esc(balanceText)}</span>`;
  }

  function renderFlowState() {
    const stateElement = document.getElementById('arrowBuilderState');
    if (stateElement) {
      if (!state.calculated) stateElement.textContent = 'Calculez d abord les tubes';
      else if (!state.tube) stateElement.textContent = 'Etape 1 · choisissez un tube';
      else if (!state.vane) stateElement.textContent = 'Etape 2 · choisissez l empennage';
      else if (!state.pointReviewed) stateElement.textContent = 'Etape 3 · pointe preselectionnee';
      else if (!state.balanceReviewed) stateElement.textContent = 'Etape 4 · verifiez l equilibre';
      else stateElement.textContent = 'Fleche composee';
    }

    document.querySelectorAll('#arrowBuilder [data-arrow-part]').forEach(button => {
      const part = button.dataset.arrowPart;
      let status = 'locked';
      if (part === 'shaft') status = state.tube ? 'complete' : 'current';
      if (part === 'vane') status = state.vane ? 'complete' : state.tube ? 'current' : 'locked';
      if (part === 'point') status = state.pointReviewed ? 'complete' : state.vane ? 'current' : 'locked';
      if (part === 'balance') status = state.balanceReviewed ? 'complete' : state.pointReviewed ? 'current' : 'locked';
      button.dataset.stepState = status;
      button.disabled = status === 'locked';
    });
  }

  function pointMedia(point) {
    const media = POINT_MEDIA[point.id] || null;
    if (!media) return '';
    return `<figure class="arrow-point-media">
      <a href="${esc(media.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="arrow-point-media-link">
        <img src="${esc(media.imageUrl)}" alt="${esc(media.alt)}" loading="lazy" decoding="async" data-point-image>
      </a>
      <figcaption>Photo illustrative · <a href="${esc(media.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(media.sourceLabel)}</a></figcaption>
    </figure>`;
  }

  function candidateBadge(candidate, index) {
    if (candidate.estimate.complete) {
      if (candidate.estimate.coherent && index === 0) return 'Equilibre conseille';
      if (candidate.estimate.coherent) return 'Equilibre coherent';
      return 'FOC a verifier';
    }
    return index === 0 ? 'Preselection compatible' : 'Alternative compatible';
  }

  function renderCandidate(candidate, index) {
    const { match, weight: pointWeight, estimate } = candidate;
    const point = match.point;
    const fitment = match.fitment
      ? ` · Taille compatible fabricant : ${String(match.fitment).replace(/^#/, 'n°')}`
      : '';
    const selected = state.point?.id === point.id && state.point?.weight === pointWeight;
    const balanceLine = estimate.complete
      ? `<p class="arrow-balance-numbers"><strong>${pointWeight} gr</strong> · FOC estime <strong>${estimate.foc.toFixed(1)} %</strong> · masse estimee <strong>${Math.round(estimate.totalMass)} gr</strong></p>`
      : `<p class="arrow-balance-numbers"><strong>${pointWeight} gr</strong> · poids compatible fabricant</p>`;
    const quality = estimate.complete
      ? `<p class="muted">Estimation avec ${estimate.gpi} GPI, 3 plumes de ${estimate.singleVaneWeight} gr et ${estimate.profile.rearAssembly.label}.</p>`
      : `<p class="muted">FOC non calcule : ${esc(estimate.missing.join(', '))}. La preselection reste limitee aux poids compatibles fabricant.</p>`;

    return `<article class="arrow-component-card arrow-point-recommendation${index === 0 ? ' is-recommended' : ''}${selected ? ' is-selected' : ''}">
      <div class="arrow-component-card-head">
        <div>
          <span class="arrow-component-brand">${esc(point.manufacturer)} · ${esc(point.family)}</span>
          <h4>${esc(point.model)}</h4>
        </div>
        <span class="arrow-builder-badge">${esc(candidateBadge(candidate, index))}</span>
      </div>
      <p class="arrow-component-specs">${esc(point.material || 'Materiau non indique')} · ${esc(point.mount || 'Montage non indique')}${esc(fitment)}</p>
      ${pointMedia(point)}
      ${balanceLine}
      ${quality}
      <button type="button" class="arrow-select-component${index === 0 ? ' arrow-select-recommended' : ''}" data-point-config="${esc(candidate.id)}">${selected ? '✓ Configuration selectionnee' : index === 0 ? 'Choisir cette preselection' : 'Choisir cette configuration'}</button>
      <p class="arrow-source"><a href="${esc(point.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source fabricant : ${esc(point.sourceLabel)}</a></p>
    </article>`;
  }

  function renderAdvancedPointWeights(candidates) {
    if (!candidates.length) return '';
    const groups = new Map();
    candidates.forEach(candidate => {
      const id = candidate.match.point.id;
      if (!groups.has(id)) groups.set(id, { match: candidate.match, weights: [] });
      groups.get(id).weights.push(candidate.weight);
    });

    return `<details class="arrow-point-advanced">
      <summary>Voir tous les poids compatibles</summary>
      <div class="arrow-point-advanced-body">
        ${[...groups.values()].map(group => {
          const point = group.match.point;
          return `<div class="arrow-point-advanced-group">
            <strong>${esc(point.manufacturer)} · ${esc(point.model)}</strong>
            <div class="arrow-point-choices">${[...new Set(group.weights)].sort((a,b)=>a-b).map(value => `
              <button type="button" class="arrow-point-choice" data-point-raw="${esc(point.id)}|${value}">
                <strong>${value} gr</strong><span>choix expert</span>
              </button>`).join('')}</div>
          </div>`;
        }).join('')}
      </div>
    </details>`;
  }

  function selectPointCandidate(candidate) {
    if (!candidate) return;
    const point = candidate.match.point;
    state.point = {
      id: point.id,
      manufacturer: point.manufacturer,
      model: point.model,
      weight: candidate.weight
    };
    state.pointReviewed = true;
    state.balanceReviewed = false;
    state.part = 'balance';
    render();
    renderDialog();
    scrollDialogTop();
  }

  function renderPointPanel(panel) {
    if (!state.tube || !state.vane) {
      panel.innerHTML = '<h3>3. Pointe</h3><p>Selectionnez d abord le tube puis l empennage.</p>';
      return;
    }

    const allMatches = pointCatalogForTube(state.tube);
    const unresolved = allMatches.filter(match => !match.exact);
    const candidates = pointCandidates();
    const range = pointRange(state.tube);

    if (candidates.length) {
      const suggested = candidates.slice(0, 3);
      panel.innerHTML = `
        <div class="arrow-builder-panel-head">
          <div>
            <h3>3. Pointe preselectionnee pour ${esc(state.tube.model)}</h3>
            <p>L app classe uniquement les poids autorises par le fabricant. Quand les masses sont documentees, elle favorise une zone de FOC coherente plutot qu un poids choisi au hasard.</p>
          </div>
          <span class="arrow-builder-count">${candidates.length} combinaison${candidates.length > 1 ? 's' : ''}</span>
        </div>
        <div class="arrow-point-recommendations">${suggested.map(renderCandidate).join('')}</div>
        ${renderAdvancedPointWeights(candidates)}
        <p class="arrow-builder-callout"><strong>Important :</strong> la pointe reste un point de depart. Une pointe plus lourde tend a assouplir le comportement dynamique ; validez ensuite au tir.</p>`;

      panel.querySelectorAll('[data-point-image]').forEach(image => {
        image.addEventListener('error', () => image.closest('.arrow-point-media')?.remove(), { once: true });
      });
      panel.querySelectorAll('[data-point-config]').forEach(button => {
        button.addEventListener('click', () => {
          selectPointCandidate(candidates.find(candidate => candidate.id === button.dataset.pointConfig));
        });
      });
      panel.querySelectorAll('[data-point-raw]').forEach(button => {
        button.addEventListener('click', () => {
          const [pointId, rawWeight] = button.dataset.pointRaw.split('|');
          const pointWeightValue = Number(rawWeight);
          const candidate = candidates.find(entry => entry.match.point.id === pointId && entry.weight === pointWeightValue);
          selectPointCandidate(candidate);
        });
      });
      return;
    }

    if (unresolved.length) {
      panel.innerHTML = `
        <h3>3. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Le catalogue existe pour ce tube, mais le spine ${esc(state.tube.spine || 'non precise')} n est pas un spine fabricant documente dans cette source.</strong>
          <p>La pointe ne sera pas devinee.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-balance>Continuer vers l equilibre sans valider de pointe</button>`;
    } else if (range) {
      panel.innerHTML = `
        <h3>3. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Plage technique connue : ${range[0]}–${range[1]} gr.</strong>
          <p>Aucune reference fabricant exacte n est encore reliee a ce modele.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-balance>Continuer vers l equilibre sans valider de pointe</button>`;
    } else {
      panel.innerHTML = `
        <h3>3. Pointe pour ${esc(state.tube.model)}</h3>
        <div class="arrow-builder-empty">
          <strong>Reference exacte pas encore documentee.</strong>
          <p>La pointe ne sera pas devinee.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-balance>Continuer vers l equilibre sans valider de pointe</button>`;
    }

    panel.querySelector('[data-continue-balance]')?.addEventListener('click', () => {
      state.point = null;
      state.pointReviewed = true;
      state.balanceReviewed = false;
      state.part = 'balance';
      render();
      renderDialog();
      scrollDialogTop();
    });
  }

  function renderVanePanel(panel) {
    if (!state.tube) {
      panel.innerHTML = '<h3>2. Empennage</h3><p>Selectionnez d abord un tube dans les modeles coherents.</p>';
      return;
    }
    if (!state.vanes.length) {
      panel.innerHTML = '<h3>2. Empennage</h3><p>Chargement du catalogue de plumes sourcees…</p>';
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
          <h3>2. Empennage</h3>
          <p>Choisissez l empennage avant la pointe : sa masse intervient dans l equilibre de la fleche lorsqu elle est documentee.</p>
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
            <p class="arrow-component-specs">Longueur ${esc(vane.length)}${vane.weight ? ` · ${esc(vane.weight)}` : ' · masse non documentee'} · ${esc(vane.stiffness)}</p>
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
        state.point = null;
        state.pointReviewed = false;
        state.balanceReviewed = false;
        state.part = 'point';
        render();
        renderDialog();
        scrollDialogTop();
      });
    });

    panel.querySelector('[data-show-all-vanes]')?.addEventListener('click', () => {
      state.showAllVanes = true;
      renderDialog();
    });
  }

  function renderBalancePanel(panel) {
    if (!state.pointReviewed) {
      panel.innerHTML = '<h3>4. Equilibre</h3><p>Terminez d abord l etape Pointe.</p>';
      return;
    }

    const estimate = currentBalance();
    const method = state.balanceMethod || {};
    const zone = Array.isArray(method.coherentFocRange) ? method.coherentFocRange : [10, 15];

    if (!state.point || !estimate?.complete) {
      const missing = estimate?.missing?.length ? estimate.missing.join(', ') : 'pointe non selectionnee';
      panel.innerHTML = `
        <h3>4. Equilibre de ma fleche</h3>
        <div class="arrow-builder-empty">
          <strong>Calcul d equilibre incomplet.</strong>
          <p>Donnees manquantes : ${esc(missing)}.</p>
          <p>L app ne fabrique pas un FOC fictif. La compatibilite fabricant reste valide, mais l equilibre devra etre mesure sur la fleche terminee.</p>
        </div>
        <button type="button" class="arrow-continue" data-balance-done>Terminer la composition</button>`;
    } else {
      const status = estimate.coherent ? 'Zone coherente' : 'A verifier';
      panel.innerHTML = `
        <div class="arrow-builder-panel-head">
          <div>
            <h3>4. Equilibre de ma fleche</h3>
            <p>Estimation de depart, a confirmer sur une fleche montee et au tir.</p>
          </div>
          <span class="arrow-builder-badge">${status}</span>
        </div>
        <div class="arrow-balance-summary">
          <div><span>Masse estimee</span><strong>${Math.round(estimate.totalMass)} gr</strong></div>
          <div><span>FOC estime</span><strong>${estimate.foc.toFixed(1)} %</strong></div>
          <div><span>Zone de depart</span><strong>${zone[0]}–${zone[1]} %</strong></div>
        </div>
        <div class="arrow-balance-visual" aria-label="Representation du centre geometrique et du centre de gravite estime">
          <span class="arrow-balance-track"></span>
          <span class="arrow-balance-center" title="Centre geometrique"></span>
          <span class="arrow-balance-cg" style="left:${Math.max(5, Math.min(95, estimate.balancePoint / estimate.length * 100)).toFixed(1)}%" title="Centre de gravite estime"></span>
        </div>
        <p class="muted">Modele simplifie : tube uniforme, pointe a l extremite, 3 plumes et ensemble arriere ${esc(estimate.profile.rearAssembly.label)}. Il ne remplace pas la mesure du point d equilibre reel.</p>
        <p class="arrow-source"><a href="${esc(estimate.profile.sourceUrl)}" target="_blank" rel="noopener noreferrer">Donnees tube : ${esc(estimate.profile.sourceLabel)}</a></p>
        <button type="button" class="arrow-continue" data-balance-done>Valider ce point de depart</button>`;
    }

    panel.querySelector('[data-balance-done]')?.addEventListener('click', () => {
      state.balanceReviewed = true;
      render();
      closeDialog();
      document.getElementById('arrowBuilder')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
  }

  function renderDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog?.open) return;
    const title = document.getElementById('arrowBuilderDialogTitle');
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) return;

    if (state.part === 'vane') {
      if (title) title.textContent = 'Etape 2 · Empennage';
      renderVanePanel(panel);
    } else if (state.part === 'point') {
      if (title) title.textContent = 'Etape 3 · Pointe';
      renderPointPanel(panel);
    } else {
      if (title) title.textContent = 'Etape 4 · Equilibre';
      renderBalancePanel(panel);
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

    try {
      const response = await fetch('./arrow-balance.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      state.balanceProfiles = Array.isArray(data.profiles) ? data.profiles : [];
      state.balanceMethod = data.method || null;
    } catch (error) {
      console.warn('[Assistant Archer] donnees equilibre indisponibles', error);
      state.balanceProfiles = [];
      state.balanceMethod = null;
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
      state.point = null;
      state.pointReviewed = false;
      state.balanceReviewed = false;
      state.showAllVanes = false;
      state.part = 'vane';
      render();
    });
    document.getElementById('bowStyle')?.addEventListener('change', () => {
      state.vane = null;
      state.point = null;
      state.pointReviewed = false;
      state.balanceReviewed = false;
      state.showAllVanes = false;
      state.part = 'vane';
      render();
    });
    document.getElementById('arrowLength')?.addEventListener('change', () => {
      state.point = null;
      state.pointReviewed = false;
      state.balanceReviewed = false;
      state.part = state.vane ? 'point' : 'vane';
      render();
    });

    loadComponents();
    refresh();
  }

  window.AssistantArcherArrowBuilder = Object.freeze({ refresh, version: 'v57' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
