/* Assistant Archer TEST - garde-fou Easton Target 2026, Pré-alpha v32.
   Référence fabricant: Target Arrow Size Selection 2026, recurve carbon limbs.
   Base de sélection: pointe 100 gr. La masse de pointe est ensuite revalidée
   contre la même table avant d'être autorisée comme réglage FOC. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v32';

  const LENGTHS = Object.freeze([21,22,23,24,25,26,27,28,29,30,31,32,33,34]);
  const RECURVE_BANDS = Object.freeze([
    [-Infinity,20], [21,26], [27,31], [32,35], [36,39], [40,43],
    [44,47], [48,52], [53,57], [58,62], [63,67], [68,73]
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
  const carbonModel = name => /(^| )(x10|a c e|ace|avance|vector|superdrive micro|inspire)( |$)/.test(norm(name));
  const parallelPro = name => /x10 parallel pro/.test(norm(name));

  function roundedLength(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n + 0.5);
  }
  function limbAdjustment() {
    return document.getElementById('eastonLimbProfile')?.value === 'beginner' ? -5 : 0;
  }
  function pointAdjustment(pointWeight) {
    const w = Number(pointWeight);
    return Number.isFinite(w) ? 3 * ((w - 100) / 25) : 0;
  }
  function adjustedDrawWeight(model, pointWeight = 100) {
    const draw = Number(document.getElementById('drawWeight')?.value);
    if (!Number.isFinite(draw)) return null;
    return draw + limbAdjustment() + (parallelPro(model) ? -5 : 0) + pointAdjustment(pointWeight);
  }
  function rowFor(weight) {
    if (!Number.isFinite(weight)) return -1;
    return RECURVE_BANDS.findIndex(([a,b], index) => index === 0 ? weight < 21 : weight >= a && weight <= b);
  }
  function parseRange(text) {
    const values = String(text || '').match(/\d+/g)?.map(Number) || [];
    if (!values.length) return null;
    if (values.length === 1) return { weak: values[0], stiff: values[0], label: String(values[0]) };
    return { weak: Math.max(values[0], values[1]), stiff: Math.min(values[0], values[1]), label: `${Math.max(values[0], values[1])}-${Math.min(values[0], values[1])}` };
  }
  function manufacturerRange(model, pointWeight = 100) {
    if (!carbonModel(model)) return null;
    const length = roundedLength(document.getElementById('arrowLength')?.value);
    const col = LENGTHS.indexOf(length);
    const weight = adjustedDrawWeight(model, pointWeight);
    const row = rowFor(weight);
    if (col < 0 || row < 0) return null;
    const parsed = parseRange(RANGES[row][col]);
    return parsed ? { ...parsed, adjustedDrawWeight: weight, arrowLength: length, pointWeight: Number(pointWeight) } : null;
  }
  function spineCompatible(model, spine, pointWeight = 100) {
    const s = Number(spine);
    const range = manufacturerRange(model, pointWeight);
    if (!range || !Number.isFinite(s)) return true;
    return s <= range.weak && s >= range.stiff;
  }

  function installLimbProfile() {
    const form = document.getElementById('spine-form');
    if (!form || document.getElementById('eastonLimbProfile')) return;
    const label = document.createElement('label');
    label.id = 'eastonLimbProfileWrap';
    label.innerHTML = `Type de branches (référence Easton)<select id="eastonLimbProfile"><option value="carbon" selected>Carbone compétition</option><option value="beginner">Bois / fibre débutant</option></select><small class="field-hint">Easton 2026 : branches carbone = 0 lb ; branches bois/fibre débutant = −5 lbs. La sélection initiale utilise une pointe de référence de 100 gr, puis chaque pointe est revalidée.</small>`;
    const objective = document.getElementById('expertObjectiveWrap');
    objective?.insertAdjacentElement('afterend', label) || form.appendChild(label);
    const updateVisibility = () => {
      const brand = document.getElementById('preferredBrand')?.value || 'all';
      label.hidden = !['all','easton'].includes(brand);
    };
    updateVisibility();
    document.getElementById('preferredBrand')?.addEventListener('change', updateVisibility);
    label.querySelector('select')?.addEventListener('change', () => document.getElementById('spine-form')?.requestSubmit?.());
  }

  function extractSpine(entry) {
    const direct = Number(entry?.advisedSpine ?? entry?.spine ?? entry?.manufacturerSpec?.spine);
    if (Number.isFinite(direct)) return direct;
    const m = String(entry?.model || '').match(/(?:^|\s)(\d{3,4})(?:\s|$)/g);
    return m?.length ? Number(m[m.length - 1].trim()) : null;
  }

  function wrapRecommendation() {
    if (window.buildBrandRecommendation?.__easton2026V32) return true;
    if (typeof window.buildBrandRecommendation !== 'function') return false;
    const original = window.buildBrandRecommendation;
    const wrapped = function(input, brand) {
      const rec = original.apply(this, arguments);
      if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
      let checked = 0;
      const kept = rec.models.filter(entry => {
        if (!carbonModel(entry.model)) return true;
        const spine = extractSpine(entry);
        if (!Number.isFinite(spine)) return true;
        checked++;
        return spineCompatible(entry.model, spine, 100);
      });
      if (checked && kept.length) {
        rec.models = kept;
        const example = manufacturerRange(kept[0]?.model || 'X10', 100);
        rec.confidenceReasons = [...(rec.confidenceReasons || []), `Easton Target 2026 ${VERSION} : sélection carbone/A-C filtrée sur la plage fabricant avec pointe de référence 100 gr${example ? ` (plage courante ${example.label})` : ''}. Les autres masses de pointe sont revalidées avant le calcul FOC.`];
      }
      return rec;
    };
    wrapped.__easton2026V32 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }

  function selectedEastonTube() {
    const summary = document.getElementById('arrowBuilderSummary');
    const span = [...(summary?.querySelectorAll('span') || [])].find(el => /^\s*Tube\s*:/i.test(el.textContent || ''));
    const text = String(span?.textContent || '').replace(/^\s*Tube\s*:\s*/i,'').trim();
    const match = text.match(/^(.*)\s(\d{3,4})$/);
    if (!match) return null;
    const model = match[1].trim();
    const spine = Number(match[2]);
    return carbonModel(model) ? { model, spine } : null;
  }

  function decoratePointPanel() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (!panel || !/3\.\s*Pointe/i.test(panel.textContent || '')) return;
    const tube = selectedEastonTube();
    if (!tube) return;

    panel.querySelectorAll('.arrow-point-recommendation').forEach(card => {
      const weight = Number(card.querySelector('.arrow-balance-numbers strong')?.textContent?.match(/\d+(?:\.\d+)?/)?.[0]);
      if (Number.isFinite(weight) && !spineCompatible(tube.model, tube.spine, weight)) card.remove();
    });
    panel.querySelectorAll('[data-point-raw]').forEach(button => {
      const weight = Number(String(button.dataset.pointRaw || '').split('|').pop());
      if (Number.isFinite(weight) && !spineCompatible(tube.model, tube.spine, weight)) button.remove();
    });
    panel.querySelectorAll('.arrow-point-advanced-group').forEach(group => {
      if (!group.querySelector('[data-point-raw]')) group.remove();
    });

    if (!panel.querySelector('.easton-dynamic-v32-note')) {
      const range100 = manufacturerRange(tube.model, 100);
      const note = document.createElement('p');
      note.className = 'easton-dynamic-v32-note arrow-builder-callout';
      note.innerHTML = `<strong>Contrôle dynamique Easton 2026 :</strong> pour ce tube, la sélection de départ est vérifiée avec 100 gr${range100 ? ` (plage ${range100.label})` : ''}. Les poids de pointe affichés ci-dessus sont ensuite filtrés pour conserver le spine dans la plage Easton avant optimisation du FOC.`;
      const head = panel.querySelector('.arrow-builder-panel-head');
      head?.insertAdjacentElement('afterend', note);
    }
  }

  function selfCheck() {
    const fakeDraw = document.getElementById('drawWeight');
    const fakeLength = document.getElementById('arrowLength');
    if (!fakeDraw || !fakeLength) return;
    const oldDraw = fakeDraw.value, oldLength = fakeLength.value;
    fakeDraw.value = '34'; fakeLength.value = '28';
    const profile = document.getElementById('eastonLimbProfile');
    const oldProfile = profile?.value; if (profile) profile.value = 'carbon';
    const test = manufacturerRange('X10', 100);
    fakeDraw.value = oldDraw; fakeLength.value = oldLength; if (profile && oldProfile) profile.value = oldProfile;
    if (test?.label !== '720-625') console.error('[Assistant Archer] échec référence Easton v32: 34 lbs / 28 / 100 gr doit donner 720-625', test);
  }

  function refresh() {
    installLimbProfile();
    wrapRecommendation();
    decoratePointPanel();
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }
  function install() {
    refresh(); selfCheck();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; refresh(); });
    }).observe(document.body, { childList: true, subtree: true });
    let tries = 0;
    const timer = setInterval(() => { tries++; refresh(); if (window.buildBrandRecommendation?.__easton2026V32 || tries > 80) clearInterval(timer); }, 100);
    window.AssistantArcherEaston2026 = Object.freeze({ version: VERSION, manufacturerRange, spineCompatible });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once: true }) : install();
})();
