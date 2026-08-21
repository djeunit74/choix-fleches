/* Assistant Archer TEST - configurateur compact Pointe / Tube / Empennage.
   Le spine reste calcule par app.js ; ce module compose ensuite les composants. */
(() => {
  'use strict';

  const state = {
    part: 'shaft',
    tubes: [],
    tube: null,
    point: null,
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

  function brandName(value) {
    try {
      if (value && typeof brandLabel === 'function') return brandLabel(value);
    } catch {}
    return ({ easton: 'Easton', victory: 'Victory', carbon: 'Carbon Express', skylon: 'Skylon', avalon: 'Avalon' })[value]
      || value
      || 'Marque non identifiee';
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

  function material(modelMeta) {
    const value = norm(modelMeta?.material);
    if (!value) return 'Materiau non documente';
    if ((value.includes('alu') || value.includes('aluminium')) && value.includes('carbon')) return 'Aluminium / carbone';
    if (value.includes('carbon') || value.includes('carbone')) return 'Carbone';
    if (value.includes('alu') || value.includes('aluminium')) return 'Aluminium';
    return String(modelMeta.material);
  }

  function diameter(modelMeta) {
    const raw = Array.isArray(modelMeta?.diameters) ? modelMeta.diameters[0] : modelMeta?.diameter;
    if (!raw) return 'diametre non documente';
    return ({ thin: 'tube fin', standard: 'diametre standard', large: 'gros diametre' })[norm(raw)] || String(raw);
  }

  function collectTubes() {
    const result = document.getElementById('result');
    if (!result) return [];

    const preferredBrand = document.getElementById('preferredBrand')?.value || '';
    const output = [];

    result.querySelectorAll('ul').forEach(list => {
      if (list.closest('.merchant-panel,.merchant-block')) return;
      const marker = `${list.previousElementSibling?.textContent || ''} ${list.parentElement?.querySelector(':scope > .mini-card-subtitle')?.textContent || ''}`;
      if (!/mod[eè]les\s+(conseill|coh[eé]rent)/i.test(marker)) return;

      const card = list.closest('[data-aa-brand]');
      list.querySelectorAll(':scope > li').forEach(item => {
        const strong = item.querySelector('strong');
        if (!strong) return;
        const model = strong.textContent.trim();
        if (!model) return;
        const brand = card?.dataset?.aaBrand || (preferredBrand !== 'all' ? preferredBrand : inferBrand(model));
        const advisedSpine = spine(item.textContent);
        output.push({
          id: `${brand || 'unknown'}|${norm(model)}|${advisedSpine || 'na'}`,
          brand,
          model,
          spine: advisedSpine,
          meta: meta(model)
        });
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

  function ensureBuilder() {
    let builder = document.getElementById('arrowBuilder');
    if (builder) return builder;

    const result = document.getElementById('result');
    if (!result) return null;

    builder = document.createElement('section');
    builder.id = 'arrowBuilder';
    builder.className = 'card arrow-builder arrow-builder-compact';
    builder.innerHTML = `
      <div class="arrow-builder-head">
        <div>
          <p class="arrow-builder-kicker">Choisir ou changer mes fleches</p>
          <h2>Ma fleche</h2>
        </div>
        <p class="arrow-builder-state" id="arrowBuilderState"></p>
      </div>
      <p class="arrow-builder-intro">Touchez directement la pointe, le tube ou l empennage pour voir les choix possibles.</p>
      <div class="arrow-assembly" aria-label="Composants de la fleche">
        <button type="button" class="arrow-part arrow-part-point" data-arrow-part="point" aria-label="Choisir la pointe">
          <span class="arrow-part-art" aria-hidden="true"></span>
          <span>Pointe</span>
        </button>
        <button type="button" class="arrow-part arrow-part-shaft" data-arrow-part="shaft" aria-label="Choisir le tube">
          <span class="arrow-part-art" aria-hidden="true"></span>
          <span>Tube</span>
        </button>
        <button type="button" class="arrow-part arrow-part-vane" data-arrow-part="vane" aria-label="Choisir l empennage">
          <span class="arrow-part-art">${vaneGraphic()}</span>
          <span>Empennage</span>
        </button>
      </div>
      <div class="arrow-builder-selection-line" id="arrowBuilderSummary"></div>`;

    result.insertAdjacentElement('afterend', builder);
    builder.querySelectorAll('[data-arrow-part]').forEach(button => {
      button.addEventListener('click', () => openPart(button.dataset.arrowPart));
    });
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

  function openPart(part) {
    state.part = ['point', 'shaft', 'vane'].includes(part) ? part : 'shaft';
    const dialog = ensureDialog();
    render();
    if (dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog() {
    const dialog = document.getElementById('arrowBuilderDialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function renderSummary() {
    const summary = document.getElementById('arrowBuilderSummary');
    if (!summary) return;

    const tubeText = state.tube
      ? `${state.tube.model}${state.tube.spine ? ` ${state.tube.spine}` : ''}`
      : 'a choisir';
    const pointText = state.point ? `${state.point} gr` : 'a choisir';
    const vaneText = state.vane ? state.vane.model : 'a choisir';

    summary.innerHTML = `
      <span><strong>Tube :</strong> ${esc(tubeText)}</span>
      <span><strong>Pointe :</strong> ${esc(pointText)}</span>
      <span><strong>Empennage :</strong> ${esc(vaneText)}</span>`;
  }

  function renderCompactState() {
    const stateElement = document.getElementById('arrowBuilderState');
    if (!stateElement) return;
    stateElement.textContent = state.calculated ? 'Touchez une partie' : 'Calculez d abord le tube';
  }

  function renderTubePanel(panel) {
    if (!state.calculated) {
      panel.innerHTML = '<h3>Tube</h3><p>Lancez le calcul de fleche avant d ouvrir les modeles de tubes.</p>';
      return;
    }

    panel.innerHTML = `
      <div class="arrow-builder-panel-head">
        <div>
          <h3>Tube</h3>
          <p>Le moteur technique a retenu ces modeles. Le prix ne participe pas a ce choix.</p>
        </div>
        <span class="arrow-builder-count">${state.tubes.length} modele${state.tubes.length > 1 ? 's' : ''}</span>
      </div>
      <div class="arrow-component-list">
        ${state.tubes.map((tube, index) => {
          const choices = pointChoices(tube);
          const range = pointRange(tube);
          const pointInfo = choices.length
            ? `<p>Poids de pointe documentes : <strong>${choices.map(value => `${value} gr`).join(' · ')}</strong></p>`
            : range
              ? `<p>Plage technique de pointe : <strong>${range[0]}–${range[1]} gr</strong> · references exactes encore a documenter.</p>`
              : '<p class="muted">Pointe exacte encore a documenter pour ce modele.</p>';

          return `
            <article class="arrow-component-card${state.tube?.id === tube.id ? ' is-selected' : ''}">
              <div class="arrow-component-card-head">
                <div>
                  <span class="arrow-component-brand">${esc(brandName(tube.brand))}</span>
                  <h4>${esc(tube.model)}</h4>
                </div>
                ${index === 0 ? '<span class="arrow-builder-badge">Suggestion</span>' : ''}
              </div>
              <p class="arrow-component-specs">${tube.spine ? `Spine ${esc(tube.spine)} · ` : ''}${esc(material(tube.meta))} · ${esc(diameter(tube.meta))}</p>
              ${pointInfo}
              <button type="button" class="secondary arrow-select-component" data-tube="${esc(tube.id)}">${state.tube?.id === tube.id ? '✓ Tube selectionne' : 'Utiliser ce tube'}</button>
            </article>`;
        }).join('')}
      </div>`;

    panel.querySelectorAll('[data-tube]').forEach(button => {
      button.addEventListener('click', () => {
        state.tube = state.tubes.find(entry => entry.id === button.dataset.tube) || null;
        state.point = null;
        state.vane = null;
        state.showAllVanes = false;
        render();
      });
    });
  }

  function renderPointPanel(panel) {
    if (!state.tube) {
      panel.innerHTML = '<h3>Pointe</h3><p>Selectionnez d abord un tube. Les pointes seront ensuite filtrees a partir de ce tube, jamais l inverse.</p>';
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
          <p>Les poids commerciaux et references compatibles ne sont pas encore relies a une source fabricant precise. Ils ne sont donc pas selectionnables pour l instant.</p>
        </div>`;
    } else {
      body = `
        <div class="arrow-builder-empty">
          <strong>Reference exacte pas encore documentee.</strong>
          <p>On n invente pas de pointe compatible : la liaison aux references fabricant sera le prochain enrichissement.</p>
        </div>`;
    }

    panel.innerHTML = `
      <h3>Pointe pour ${esc(state.tube.model)}</h3>
      <p>Seules les donnees deja associees a ce tube sont utilisees.</p>
      ${body}
      <p class="muted">Le nom commercial de la pointe n apparaitra que lorsqu il sera relie a une source fabricant precise.</p>`;

    panel.querySelectorAll('[data-point]').forEach(button => {
      button.addEventListener('click', () => {
        state.point = Number(button.dataset.point);
        render();
      });
    });
  }

  function renderVanePanel(panel) {
    if (!state.tube) {
      panel.innerHTML = '<h3>Empennage</h3><p>Selectionnez d abord un tube afin de classer les empennages selon la configuration.</p>';
      return;
    }
    if (!state.vanes.length) {
      panel.innerHTML = '<h3>Empennage</h3><p>Chargement du catalogue de plumes sourcees…</p>';
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
          <h3>Empennage</h3>
          <p>Les plus coherents sont affiches en premier selon la discipline, le type d arc et le diametre du tube.</p>
        </div>
        <span class="arrow-builder-count">${ranked.length} references sourcees</span>
      </div>
      <div class="arrow-component-list">
        ${visible.map(({ vane, match }, index) => `
          <article class="arrow-component-card${state.vane?.id === vane.id ? ' is-selected' : ''}">
            <div class="arrow-component-card-head">
              <div>
                <span class="arrow-component-brand">${esc(vane.manufacturer)} · ${esc(vane.family)}</span>
                <h4>${esc(vane.model)}</h4>
              </div>
              <span class="arrow-builder-badge${index > 2 ? ' is-secondary' : ''}">${match.score >= 7 ? 'Tres coherente' : match.score >= 5 ? 'A envisager' : 'Usage specifique'}</span>
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

    if (state.part === 'point') {
      if (title) title.textContent = 'Choisir la pointe';
      renderPointPanel(panel);
    } else if (state.part === 'vane') {
      if (title) title.textContent = 'Choisir l empennage';
      renderVanePanel(panel);
    } else {
      if (title) title.textContent = 'Choisir le tube';
      renderTubePanel(panel);
    }
  }

  function render() {
    const builder = ensureBuilder();
    if (!builder) return;

    renderCompactState();
    renderSummary();
    renderDialog();
  }

  function refresh() {
    state.tubes = collectTubes();
    state.calculated = state.tubes.length > 0;

    if (state.tube) state.tube = state.tubes.find(entry => entry.id === state.tube.id) || null;
    if (!state.tube && state.tubes.length) state.tube = state.tubes[0];
    if (!state.tube) {
      state.point = null;
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
    if (!ensureBuilder()) return;
    ensureDialog();

    const result = document.getElementById('result');
    if (result && !result.dataset.arrowBuilderObserved) {
      result.dataset.arrowBuilderObserved = '1';
      new MutationObserver(() => {
        clearTimeout(install.refreshTimer);
        install.refreshTimer = setTimeout(refresh, 50);
      }).observe(result, { childList: true, subtree: true });
    }

    document.getElementById('spine-form')?.addEventListener('submit', () => setTimeout(refresh, 150));
    document.getElementById('themeSelect')?.addEventListener('change', render);
    document.getElementById('bowStyle')?.addEventListener('change', render);

    loadVanes();
    refresh();
  }

  window.AssistantArcherArrowBuilder = Object.freeze({ refresh, version: 'v51' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
