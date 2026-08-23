/* Assistant Archer TEST - calculateur Easton recurve cible, Pré-alpha v38.
   Source de règle: Easton Target Arrow Size Selection 2026.
   Pas d'observer global, pas de boucle permanente.

   Chaîne fabricant reproduite:
   puissance réelle + correction pointe + correction branches -> plage Easton,
   longueur arrondie au pouce le plus proche ; pour X10 Parallel Pro, -5 lbs
   supplémentaires ; parmi les tailles réellement fabriquées dans la plage,
   le recurve prend le côté le plus souple (spine numérique le plus élevé).
*/
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v38';
  const CHART_SOURCE = 'https://eastonarchery.com/wp-content/uploads/2018/10/Easton-2026.pdf';
  const SELECTOR_SOURCE = 'https://eastonarchery.com/2022-shaft-selector-target-recurve-dual-comp/';

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
  const RANGE_TO_GROUP = Object.freeze({
    '2000':'00','2000-1800':'00','1800-1700':'00','1750-1400':'01',
    '1450-1200':'02','1250-1050':'03','1080-880':'T01','900-750':'T2',
    '800-700':'T3','720-625':'T4','675-600':'T5','640-570':'T6',
    '575-500':'T7','525-450':'T8','475-400':'T9','440-370':'T10',
    '400-340':'T11','370-310':'T12','340-300':'T13','300-250':'T14','250-200':'T14'
  });

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

  function modelKey(name) {
    const n = norm(name);
    if (n.includes('protour')) return 'protour';
    if (n.includes('parallel pro') && (n.includes('3 2') || n.includes('3.2'))) return 'x10 parallel pro 3.2 mm';
    if (n.includes('parallel pro')) return 'x10 parallel pro 4 mm';
    if (/^x10(?:\s|$)/.test(n)) return 'x10';
    if (n === 'a c e' || n === 'ace' || n.startsWith('a c e ')) return 'a/c/e';
    if (n.includes('avance sport')) return 'avance sport';
    if (n.includes('avance')) return 'avance';
    if (n.includes('superdrive micro')) return 'superdrive micro';
    if (n.includes('vector')) return 'vector';
    if (n.includes('inspire')) return 'inspire';
    return '';
  }
  const isParallelPro = key => key === 'x10 parallel pro 3.2 mm' || key === 'x10 parallel pro 4 mm';
  const isCarbonSelectorModel = key => ['x10','a/c/e','x10 parallel pro 3.2 mm','x10 parallel pro 4 mm','avance','avance sport','superdrive micro','vector','inspire'].includes(key);

  function roundedLength(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.floor(n + 0.5) : null;
  }
  function rowFor(weight) {
    if (!Number.isFinite(weight)) return -1;
    return RECURVE_BANDS.findIndex(([a,b],i) => i === 0 ? weight < 21 : weight >= a && weight <= b);
  }
  function parseRange(text) {
    const nums = String(text || '').match(/\d+/g)?.map(Number) || [];
    if (!nums.length) return null;
    if (nums.length === 1) return { weak: nums[0], stiff: nums[0], label: String(nums[0]) };
    return { weak: Math.max(...nums), stiff: Math.min(...nums), label: `${Math.max(...nums)}-${Math.min(...nums)}` };
  }
  function pointWeight() {
    const n = Number(document.getElementById('eastonPointWeightV38')?.value);
    return Number.isFinite(n) && n > 0 ? n : 100;
  }
  function limbAdjustment() {
    return document.getElementById('eastonLimbProfileV38')?.value === 'beginner' ? -5 : 0;
  }
  function pointAdjustment(weight = pointWeight()) {
    return 3 * ((Number(weight) - 100) / 25);
  }
  function selectorResult(extraAdjustment = 0) {
    const draw = Number(document.getElementById('drawWeight')?.value);
    const rawLength = Number(document.getElementById('arrowLength')?.value);
    const length = roundedLength(rawLength);
    if (!Number.isFinite(draw) || !Number.isFinite(length)) return null;
    const col = LENGTHS.indexOf(length);
    const adjusted = draw + limbAdjustment() + pointAdjustment() + Number(extraAdjustment || 0);
    const row = rowFor(adjusted);
    if (col < 0 || row < 0) return null;
    const range = parseRange(RANGES[row][col]);
    if (!range) return null;
    return {
      ...range,
      group: RANGE_TO_GROUP[range.label] || null,
      drawWeight: draw,
      rawLength,
      roundedLength: length,
      pointWeight: pointWeight(),
      limbAdjustment: limbAdjustment(),
      pointAdjustment: pointAdjustment(),
      extraAdjustment: Number(extraAdjustment || 0),
      adjustedDrawWeight: adjusted
    };
  }

  function sourceFor(spec) {
    const key = spec?.source;
    return key ? window.AssistantArcherManufacturerReference?.data?.sources?.[key] || '' : '';
  }
  function specFor(key) {
    const all = window.AssistantArcherManufacturerReference?.data?.models || {};
    if (key === 'avance sport' && all.avance) return { ...all.avance, name: 'Avance Sport' };
    return all[key] || null;
  }
  function manufacturedSpines(spec) {
    return Object.keys(spec?.spines || {}).map(Number).filter(Number.isFinite);
  }
  function compatibleSpines(spec, range) {
    if (!range) return [];
    return manufacturedSpines(spec).filter(v => v >= range.stiff && v <= range.weak).sort((a,b) => a - b);
  }
  function chooseRecurveSpine(spec, range) {
    const candidates = compatibleSpines(spec, range);
    return candidates.length ? candidates[candidates.length - 1] : null; // côté le plus souple Easton
  }
  function pointRangeFor(key,row,previous) {
    if (Array.isArray(row?.pointGr) && row.pointGr.length) return [Math.min(...row.pointGr),Math.max(...row.pointGr)];
    if (Array.isArray(previous?.pointRange) && previous.pointRange.length >= 2) return previous.pointRange;
    if (key === 'x10' || key === 'x10 parallel pro 3.2 mm') return [80,120];
    if (key === 'a/c/e' || key === 'x10 parallel pro 4 mm') return [80,130];
    return null;
  }
  function metaFromManufacturer(key,spec,row,previous) {
    const pointRange = pointRangeFor(key,row,previous);
    return {
      ...(previous || {}),
      seriesTier: previous?.seriesTier || (key.includes('x10') ? 'elite' : 'competition'),
      material: previous?.material || 'carbon',
      diameters: previous?.diameters || ['thin'],
      massClass: previous?.massClass || 'light',
      toleranceClass: previous?.toleranceClass || 'tight',
      componentSystem: previous?.componentSystem || 'manufacturer',
      distanceBand: previous?.distanceBand || 'long',
      useCase: previous?.useCase || 'target',
      ...(pointRange ? { pointRange } : {}),
      manufacturerMaterial: spec?.material || null,
      manufacturerProfile: spec?.profile || null,
      manufacturerStraightnessIn: spec?.straightnessIn ?? null,
      manufacturerWeightToleranceGr: spec?.weightToleranceGr ?? null
    };
  }

  function selectForModel(entry) {
    const key = modelKey(entry.model);
    if (!key || key === 'protour' || !isCarbonSelectorModel(key)) return { entry, status: 'outside-carbon-selector' };
    const spec = specFor(key);
    if (!spec?.spines) return { entry, status: 'no-manufacturer-table' };
    const result = selectorResult(isParallelPro(key) ? -5 : 0);
    if (!result) return { entry, status: 'no-selector-result' };
    const size = chooseRecurveSpine(spec,result);
    if (!Number.isFinite(size)) {
      return { entry: { ...entry, eastonSelectorRange: result.label, eastonSelectorGroup: result.group, eastonSelectorExact: false }, status: 'no-size-in-range' };
    }
    const row = spec.spines[String(size)];
    const parallelText = isParallelPro(key) ? ' ; correction X10 Parallel Pro −5 lbs appliquée' : '';
    return {
      status: 'exact',
      entry: {
        ...entry,
        advisedSpine: String(size),
        manufacturerVerified: true,
        manufacturerSpec: row,
        manufacturerSource: sourceFor(spec),
        manufacturerModelKey: key,
        manufacturerSelectionBasis: `Sélecteur Easton 2026 : plage ${result.label}${result.group ? ` / groupe ${result.group}` : ''}, côté recurve le plus souple${parallelText}`,
        eastonSelectorRange: result.label,
        eastonSelectorGroup: result.group,
        eastonSelectorExact: true,
        eastonAdjustedDrawWeight: result.adjustedDrawWeight,
        meta: metaFromManufacturer(key,spec,row,entry.meta)
      }
    };
  }

  function applySelector(rec,input) {
    if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
    const environment = input?.shootingEnvironment || document.getElementById('shootingEnvironment')?.value || 'outdoor';
    const exact = [], other = [];
    let noSize = 0;
    for (const raw of rec.models) {
      const key = modelKey(raw.model);
      if (key === 'protour') continue; // compound-specific fabricant
      const selected = selectForModel(raw);
      if (selected.status === 'exact') exact.push(selected.entry);
      else {
        if (selected.status === 'no-size-in-range') noSize++;
        other.push(selected.entry);
      }
    }
    rec.models = [...exact,...other];

    const standard = selectorResult(0);
    const parallel = selectorResult(-5);
    if (standard) {
      rec.primary = `${standard.weak}-${standard.stiff}`;
      rec.comparisonSpine = standard.weak;
      rec.eastonSelector = {
        version: VERSION,
        range: standard.label,
        group: standard.group,
        adjustedDrawWeight: standard.adjustedDrawWeight,
        pointWeight: standard.pointWeight,
        roundedLength: standard.roundedLength,
        limbAdjustment: standard.limbAdjustment,
        pointAdjustment: standard.pointAdjustment,
        parallelProRange: parallel?.label || null,
        source: CHART_SOURCE
      };
      rec.confidenceReasons = [...(rec.confidenceReasons || []),
        `Sélecteur Easton ${VERSION} : ${standard.drawWeight} lbs réelles, ${standard.pointWeight} gr, longueur ${standard.rawLength}\" → colonne ${standard.roundedLength}\", puissance corrigée ${standard.adjustedDrawWeight.toFixed(1)} lbs, plage ${standard.label}${standard.group ? ` (groupe ${standard.group})` : ''}.`,
        `Règle recurve Easton : parmi les tailles réellement fabriquées qui tombent dans la plage, l'app retient le côté le plus souple. X10 Parallel Pro est recalculée séparément avec −5 lbs conformément au guide 2026.`,
        `Les modèles Easton hors sélecteur carbone/A-C (notamment aluminium salle) restent gérés séparément selon leur table fabricant et la discipline ${environment}.`
      ];
      if (noSize) rec.confidenceReasons.push(`${noSize} modèle(s) carbone Easton conservé(s) en information mais sans correspondance exacte : aucune taille réellement fabriquée ne tombe dans la plage calculée.`);
    }
    return rec;
  }

  function ensureWrapped() {
    const current = window.buildBrandRecommendation;
    if (typeof current !== 'function' || current.__eastonSelectorV38) return false;
    const wrapped = function(input,brand) { return applySelector(current.apply(this,arguments),input); };
    wrapped.__eastonSelectorV38 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }

  function updateHint() {
    const wrap = document.getElementById('eastonSelectorV38');
    const brand = document.getElementById('preferredBrand')?.value;
    if (wrap) wrap.hidden = brand !== 'easton';
    const hint = document.getElementById('eastonSelectorHintV38');
    const calc = document.getElementById('eastonSelectorCalcV38');
    if (!hint || brand !== 'easton') return;
    const standard = selectorResult(0), parallel = selectorResult(-5);
    if (!standard) {
      hint.textContent = 'Renseignez la puissance réelle et la longueur. Le calcul Easton utilise 100 gr par défaut.';
      if (calc) calc.textContent = '';
      return;
    }
    hint.textContent = `Easton carbone/A-C : ${standard.pointWeight} gr · longueur arrondie ${standard.roundedLength}\" · branches ${document.getElementById('eastonLimbProfileV38')?.value === 'beginner' ? 'bois/fibre' : 'carbone compétition'}.`;
    if (calc) calc.innerHTML = `<strong>Puissance corrigée :</strong> ${standard.adjustedDrawWeight.toFixed(1)} lbs · <strong>plage :</strong> ${standard.label}${standard.group ? ` · <strong>groupe :</strong> ${standard.group}` : ''}${parallel ? `<br><strong>Parallel Pro :</strong> ${parallel.adjustedDrawWeight.toFixed(1)} lbs → ${parallel.label}` : ''}`;
  }

  function installFields() {
    const form = document.getElementById('spine-form'), brand = document.getElementById('preferredBrand');
    if (!form || !brand) return;
    document.getElementById('eastonPrecisionV37')?.remove();
    if (!document.getElementById('eastonSelectorV38')) {
      const wrap = document.createElement('fieldset');
      wrap.id = 'eastonSelectorV38';
      wrap.style.cssText = 'margin:.45rem 0 .7rem;padding:.65rem .7rem;border:1px solid rgba(0,0,0,.14);border-radius:10px';
      wrap.innerHTML = `<legend style="font-weight:850;padding:0 .25rem">Calculateur Easton — cible recurve carbone / A-C</legend>
        <label>Poids de pointe
          <select id="eastonPointWeightV38">
            <option value="50">50 grains</option><option value="75">75 grains</option>
            <option value="100" selected>100 grains</option><option value="125">125 grains</option>
            <option value="150">150 grains</option>
          </select>
        </label>
        <label>Type de branches
          <select id="eastonLimbProfileV38">
            <option value="carbon" selected>Carbone compétition</option>
            <option value="beginner">Bois / fibre débutant</option>
          </select>
        </label>
        <small id="eastonSelectorHintV38" class="field-hint"></small>
        <p id="eastonSelectorCalcV38" style="margin:.35rem 0 0;font-size:.78rem;line-height:1.35"></p>
        <small class="field-hint">Méthode Easton 2026 : la pointe et les branches corrigent la puissance ; la longueur est arrondie au pouce le plus proche. Pour Parallel Pro, −5 lbs supplémentaires.</small>`;
      const anchor = document.getElementById('arrowLength')?.closest('label');
      anchor?.insertAdjacentElement('afterend',wrap) || form.appendChild(wrap);
      wrap.querySelectorAll('select').forEach(el => el.addEventListener('change',() => { updateHint(); }));
    }
    if (!brand.dataset.eastonSelectorV38) {
      brand.dataset.eastonSelectorV38 = '1';
      brand.addEventListener('change',updateHint);
    }
    if (!form.dataset.eastonSelectorV38) {
      form.dataset.eastonSelectorV38 = '1';
      form.addEventListener('submit',() => { ensureWrapped(); updateHint(); },{capture:true});
    }
    ['drawWeight','arrowLength'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.dataset.eastonSelectorV38) {
        el.dataset.eastonSelectorV38 = '1';
        el.addEventListener('input',updateHint);
      }
    });
    updateHint();
  }

  function install() {
    installFields();
    ensureWrapped();
    /* Reprises bornées uniquement pour absorber le chargement asynchrone des anciennes
       couches catalogue. Aucune boucle permanente. */
    [250,800,1800].forEach(ms => setTimeout(ensureWrapped,ms));
    window.AssistantArcherEastonPrecision = Object.freeze({
      version: VERSION, selectorResult, applySelector, chooseRecurveSpine,
      sources: Object.freeze({ chart: CHART_SOURCE, selector: SELECTOR_SOURCE })
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',install,{once:true})
    : install();
})();
