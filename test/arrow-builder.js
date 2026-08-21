/* Assistant Archer TEST - parcours de fabrication Tube / Pointe / Empennage.
   Le spine reste calcule par app.js ; ce module guide ensuite le choix des composants. */
(() => {
  'use strict';

  const state = {
    part: 'point',
    tubes: [],
    tube: null,
    point: null,
    pointReviewed: false,
    vane: null,
    vanes: [],
    calculated: false,
    showAllVanes: false
  };

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

  function coherentModelLists() {
    const result = document.getElementById('result');
    if (!result) return [];
    return [...result.querySelectorAll('ul')].filter(list => {
      if (list.closest('.merchant-panel,.merchant-block')) return false;
      const marker = `${list.previousElementSibling?.textContent || ''} ${list.parentElement?.querySelector(':scope > .mini-card-subtitle')?.textContent || ''}`;
      return /mod[eè]les\s+(conseill|coh[eé]rent)/i.test(marker);
    });
  }

  function tubeFromItem(item, list) {
    const strong = item.querySelector('strong');
    if (!strong) return null;
    const model = strong.textContent.trim();
    if (!model) return null;
    const preferredBrand = document.getElementById('preferredBrand')?.value || '';
    const card = list.closest('[data-aa-brand]');
    const brand = card?.dataset?.aaBrand || (preferredBrand !== 'all' ? preferredBrand : inferBrand(model));
    const advisedSpine = spine(item.textContent);
    return {
      id: `${brand || 'unknown'}|${norm(model)}|${advisedSpine || 'na'}`,
      brand,
      model,
      spine: advisedSpine,
      meta: meta(model)
    };
  }

  function collectTubes() {
    const output = [];
    coherentModelLists().forEach(list => {
      list.querySelectorAll(':scope > li').forEach(item => {
        const tube = tubeFromItem(item, list);
        if (tube) output.push(tube);
      });
    });
    const seen = new Set();
    return output.filter(entry => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }

  function pointChoices(tube) {
    const direct = Array.isArray(tube?.meta?.pointChoices)
      ? tube.meta.pointChoices.map(Number).filter(Number.isFinite)
      : [];
    return [...new Set(direct)].sort((a, b) => a - b);
  }

  function pointRange(tube) {
    const range = Array.isArray(tube?.meta?.pointRange) ? tube.meta.pointRange.map(Number) : [];
    return range.length >= 2 && range.every(Number.isFinite)
      ? [Math.min(...range), Math.max(...range)]
      : null;
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

  function firstModelAnchor() {
    const list = coherentModelLists()[0];
    if (!list) return null;
    const card = list.closest('.mini-card');
    if (card) return card;
    return list.previousElementSibling || list;
  }

  function placeBuilder(builder) {
    const result = document.getElementById('result');
    if (!result || !builder) return;
    const anchor = firstModelAnchor();
    if (anchor) {
      if (builder.parentElement !== result || builder.nextElementSibling !== anchor) result.insertBefore(builder, anchor);
    } else if (builder.parentElement !== result) {
      result.appendChild(builder);
    }
  }

  function ensureBuilder() {
    let builder = document.getElementById('arrowBuilder');
    const result = document.getElementById('result');
    if (!result) return null;

    if (!builder) {
      builder = document.createElement('section');
      builder.id = 'arrowBuilder';
      builder.className = 'arrow-builder arrow-builder-compact arrow-builder-inline';
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

    placeBuilder(builder);
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
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeDialog();
    });
    return dialog;
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
    render();
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    setTimeout(scrollDialogTop, 0);
  }

  function closeDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function scrollToTubeChoices() {
    const list = coherentModelLists()[0];
    if (!list) return;
    const target = list.closest('.mini-card') || list.previousElementSibling || list;
    target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  function selectTube(id) {
    const selected = state.tubes.find(entry => entry.id === id) || null;
    if (!selected) return;
    state.tube = selected;
    state.point = null;
    state.pointReviewed = false;
    state.vane = null;
    state.showAllVanes = false;
    decorateModelChoices();
    render();
    openPart('point');
  }

  function decorateModelChoices() {
    coherentModelLists().forEach(list => {
      list.querySelectorAll(':scope > li').forEach(item => {
        const tube = tubeFromItem(item, list);
        if (!tube) return;
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
        button.textContent = selected ? '✓ Tube selectionne' : 'Selectionner ce tube';
        if (!button.dataset.bound) {
          button.dataset.bound = '1';
          button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            selectTube(button.dataset.selectTube);
          });
        }
      });
    });
  }

  function renderSummary() {
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary) return;
    const tubeText = state.tube ? `${state.tube.model}${state.tube.spine ? ` ${state.tube.spine}` : ''}` : 'a choisir';
    const pointText = state.point ? `${state.point} gr` : state.pointReviewed ? 'a documenter' : 'a choisir';
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

  function renderPointPanel(panel) {
    if (!state.tube) {
      panel.innerHTML = '<h3>2. Pointe</h3><p>Selectionnez d abord un tube dans les modeles coherents.</p>';
      return;
    }

    const choices = pointChoices(state.tube);
    const range = pointRange(state.tube);
    let body = '';
    if (choices.length) {
      body = `
        <div class="arrow-point-choices">
          ${choices.map(value => `
            <button type="button" class="arrow-point-choice${state.point === value ? ' is-selected' : ''}" data-point="${value}">
              <strong>${value} gr</strong><span>poids documente</span>
            </button>`).join('')}
        </div>
        <p class="arrow-builder-callout">Une pointe plus lourde tend a assouplir dynamiquement la fleche ; une plus legere tend a la raidir. Validation finale au tir.</p>`;
    } else if (range) {
      body = `
        <div class="arrow-builder-empty">
          <strong>Plage technique connue : ${range[0]}–${range[1]} gr.</strong>
          <p>Les references exactes ne sont pas encore reliees a une source fabricant precise.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-vane>Continuer vers l empennage sans valider de pointe</button>`;
    } else {
      body = `
        <div class="arrow-builder-empty">
          <strong>Reference exacte pas encore documentee.</strong>
          <p>On n invente pas de pointe compatible.</p>
        </div>
        <button type="button" class="arrow-continue" data-continue-vane>Continuer vers l empennage sans valider de pointe</button>`;
    }

    panel.innerHTML = `
      <h3>2. Pointe pour ${esc(state.tube.model)}</h3>
      <p>Choisissez la pointe compatible avec le tube selectionne.</p>
      ${body}`;

    panel.querySelectorAll('[data-point]').forEach(button => {
      button.addEventListener('click', () => {
        state.point = Number(button.dataset.point);
        state.pointReviewed = true;
        state.part = 'vane';
        render();
        scrollDialogTop();
      });
    });
    panel.querySelector('[data-continue-vane]')?.addEventListener('click', () => {
      state.point = null;
      state.pointReviewed = true;
      state.part = 'vane';
      render();
      scrollDialogTop();
    });
  }

  function renderVanePanel(panel) {
    if (!state.tube || !state.pointReviewed) {
      panel.innerHTML = '<h3>3. Empennage</h3><p>Validez d abord l etape Pointe.</p>';
      return;
    }
    if (!state.vanes.length) {
      panel.innerHTML = '<h3>3. Empennage</h3><p>Chargement du catalogue d empennages sources…</p>';
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
      });
    });
    panel.querySelector('[data-show-all-vanes]')?.addEventListener('click', () => {
      state.showAllVanes = true;
      render();
    });
  }

  function renderDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog?.open) return;
    const title = document.getElementById('arrowBuilderDialogTitle');
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel) return;
    if (state.part === 'vane') {
      if (title) title.textContent = '3. Choisir l empennage';
      renderVanePanel(panel);
    } else {
      if (title) title.textContent = '2. Choisir la pointe';
      renderPointPanel(panel);
    }
  }

  function render() {
    const builder = ensureBuilder();
    if (!builder) return;
    decorateModelChoices();
    renderFlowState();
    renderSummary();
    renderDialog();
  }

  function refresh() {
    state.tubes = collectTubes();
    state.calculated = state.tubes.length > 0;
    if (state.tube) state.tube = state.tubes.find(entry => entry.id === state.tube.id) || null;
    if (!state.tube) {
      state.point = null;
      state.pointReviewed = false;
      state.vane = null;
    }
    render();
  }

  async function loadVanes() {
    try {
      const response = await fetch('./arrow-components.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      state.vanes = Array.isArray(data.vanes) ? data.vanes : [];
    } catch (error) {
      console.warn('[Assistant Archer] catalogue composants indisponible', error);
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
      new MutationObserver(mutations => {
        const externalChange = mutations.some(mutation => {
          const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
          return !target?.closest?.('#arrowBuilder') && !target?.closest?.('.arrow-model-select-row');
        });
        if (!externalChange) return;
        clearTimeout(install.refreshTimer);
        install.refreshTimer = setTimeout(refresh, 60);
      }).observe(result, { childList: true, subtree: true });
    }

    document.getElementById('spine-form')?.addEventListener('submit', () => {
      state.tube = null;
      state.point = null;
      state.pointReviewed = false;
      state.vane = null;
      setTimeout(refresh, 180);
    });
    document.getElementById('themeSelect')?.addEventListener('change', render);
    document.getElementById('bowStyle')?.addEventListener('change', render);

    loadVanes();
    refresh();
  }

  window.AssistantArcherArrowBuilder = Object.freeze({ refresh, version: 'v52' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
