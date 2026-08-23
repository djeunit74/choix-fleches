/* Assistant Archer TEST - mode Easton dédié, Pré-alpha v33.
   Le tableau Easton sert de référence de classement et d'explication.
   Il ne supprime jamais brutalement un modèle déjà jugé compatible par le moteur principal. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v33';

  const LENGTHS = Object.freeze([21,22,23,24,25,26,27,28,29,30,31,32,33,34]);
  const RECURVE_BANDS = Object.freeze([
    [-Infinity,20],[21,26],[27,31],[32,35],[36,39],[40,43],
    [44,47],[48,52],[53,57],[58,62],[63,67],[68,73]
  ]);
  const RANGES = Object.freeze([
    ['2000','2000','2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500'],
    ['2000','2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450'],
    ['2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400'],
    ['1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370'],
    ['1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340'],
    ['1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310'],
    ['1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300'],
    ['1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250'],
    ['900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200'],
    ['800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200'],
    ['720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200','250-200'],
    ['675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200','250-200','200-150']
  ]);

  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

  function roundedLength(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.floor(n + 0.5) : null;
  }
  function rowFor(weight) {
    if (!Number.isFinite(weight)) return -1;
    return RECURVE_BANDS.findIndex(([a,b], i) => i === 0 ? weight < 21 : weight >= a && weight <= b);
  }
  function parseRange(text) {
    const values = String(text || '').match(/\d+/g)?.map(Number) || [];
    if (!values.length) return null;
    if (values.length === 1) return { weak: values[0], stiff: values[0], label: String(values[0]) };
    return { weak: Math.max(...values), stiff: Math.min(...values), label: `${Math.max(...values)}-${Math.min(...values)}` };
  }
  function pointWeight() {
    const n = Number(document.getElementById('eastonPointWeight')?.value);
    return Number.isFinite(n) && n > 0 ? n : 100;
  }
  function limbAdjustment() {
    return document.getElementById('eastonLimbProfile')?.value === 'beginner' ? -5 : 0;
  }
  function pointAdjustment() {
    return 3 * ((pointWeight() - 100) / 25);
  }
  function manufacturerRange() {
    const draw = Number(document.getElementById('drawWeight')?.value);
    const length = roundedLength(document.getElementById('arrowLength')?.value);
    if (!Number.isFinite(draw) || !Number.isFinite(length)) return null;
    const col = LENGTHS.indexOf(length);
    const row = rowFor(draw + limbAdjustment() + pointAdjustment());
    if (col < 0 || row < 0) return null;
    const range = parseRange(RANGES[row][col]);
    return range ? { ...range, length, adjustedDrawWeight: draw + limbAdjustment() + pointAdjustment(), pointWeight: pointWeight() } : null;
  }

  function installEastonFields() {
    const form = document.getElementById('spine-form');
    const brand = document.getElementById('preferredBrand');
    if (!form || !brand) return;
    let wrap = document.getElementById('eastonModeV33');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'eastonModeV33';
      wrap.className = 'easton-mode-v33';
      wrap.innerHTML = `
        <p style="margin:.15rem 0 .45rem;font-weight:800">Réglage Easton</p>
        <label>Poids de pointe de référence (gr)
          <input id="eastonPointWeight" type="number" min="40" max="200" step="5" value="100" inputmode="numeric">
        </label>
        <label>Type de branches
          <select id="eastonLimbProfile">
            <option value="carbon" selected>Carbone compétition</option>
            <option value="beginner">Bois / fibre débutant</option>
          </select>
        </label>
        <p id="eastonRangeHint" class="field-hint" style="margin:.35rem 0 0">Le tableau Easton sert à prioriser les tailles, sans supprimer les autres modèles compatibles.</p>`;
      const length = document.getElementById('arrowLength')?.closest('label');
      length?.insertAdjacentElement('afterend', wrap) || form.appendChild(wrap);
      wrap.querySelectorAll('input,select').forEach(el => el.addEventListener('change', () => {
        updateVisibility();
        form.requestSubmit?.();
      }));
    }
    updateVisibility();
  }

  function updateVisibility() {
    const brand = document.getElementById('preferredBrand')?.value;
    const wrap = document.getElementById('eastonModeV33');
    if (wrap) wrap.hidden = brand !== 'easton';
    const hint = document.getElementById('eastonRangeHint');
    if (hint && brand === 'easton') {
      const range = manufacturerRange();
      hint.textContent = range
        ? `Référence Easton : plage ${range.label} avec ${range.pointWeight} gr. Cette plage sert à prioriser les tailles sans élimination brutale.`
        : 'Le tableau Easton sert à prioriser les tailles, sans supprimer les autres modèles compatibles.';
    }
  }

  function extractSpine(entry) {
    const direct = Number(entry?.advisedSpine ?? entry?.spine ?? entry?.manufacturerSpec?.spine);
    if (Number.isFinite(direct)) return direct;
    const matches = String(entry?.model || '').match(/(?:^|\s)(\d{3,4})(?=\s|$)/g);
    return matches?.length ? Number(matches[matches.length - 1].trim()) : null;
  }
  function distanceToRange(spine, range) {
    if (!Number.isFinite(spine) || !range) return Infinity;
    if (spine <= range.weak && spine >= range.stiff) return 0;
    return spine > range.weak ? spine - range.weak : range.stiff - spine;
  }

  function wrapRecommendation() {
    if (window.buildBrandRecommendation?.__eastonSoftV33) return true;
    if (typeof window.buildBrandRecommendation !== 'function') return false;
    const original = window.buildBrandRecommendation;
    const wrapped = function(input, brand) {
      const rec = original.apply(this, arguments);
      if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
      const range = manufacturerRange();
      if (!range) return rec;
      rec.models = rec.models
        .map((entry, index) => ({ entry, index, spine: extractSpine(entry) }))
        .sort((a,b) => distanceToRange(a.spine, range) - distanceToRange(b.spine, range) || a.index - b.index)
        .map(({entry}) => entry);
      rec.confidenceReasons = [...(rec.confidenceReasons || []), `Mode Easton ${VERSION} : plage constructeur ${range.label} pour ${range.pointWeight} gr utilisée comme priorité de classement, sans exclusion automatique des autres modèles compatibles.`];
      return rec;
    };
    wrapped.__eastonSoftV33 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }

  function refresh() {
    installEastonFields();
    wrapRecommendation();
    updateVisibility();
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  function install() {
    refresh();
    document.getElementById('preferredBrand')?.addEventListener('change', updateVisibility);
    let tries = 0;
    const timer = setInterval(() => { tries++; refresh(); if (window.buildBrandRecommendation?.__eastonSoftV33 || tries > 80) clearInterval(timer); }, 100);
    new MutationObserver(() => requestAnimationFrame(refresh)).observe(document.body, { childList:true, subtree:true });
    window.AssistantArcherEastonMode = Object.freeze({ version: VERSION, manufacturerRange });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once:true }) : install();
})();
