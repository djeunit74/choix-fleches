/* Assistant Archer TEST - Victory Recurve Spine Chart, Pré-alpha v49.
   Source fabricant: Victory Archery Arrow Guide, Recurve Spine Chart actuellement publié.
   Une seule table alimente le calculateur principal et la validation pointe/insert.
*/
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v49';
  const CHART_SOURCE = 'https://victoryarchery.com/arrow-guide/';
  const CHART_IMAGE = 'https://victoryarchery.com/wp-content/uploads/2025/03/Recurve-Spine-2024-768x427.png';
  const LENGTHS = Object.freeze([23,24,25,26,27,28,29,30,31]);

  const ROWS_100_125 = Object.freeze([
    { min:12,max:14, values:[null,null,null,1200,1100,1000,900,900,800] },
    { min:14,max:16, values:[1200,1200,1200,1100,1000,900,800,800,800] },
    { min:16,max:18, values:[1200,1100,1100,1000,900,800,800,800,700] },
    { min:18,max:22, values:[1100,1000,1000,900,800,800,700,700,700] },
    { min:22,max:26, values:[1000,900,900,800,800,700,700,700,600] },
    { min:27,max:31, values:[900,800,800,800,700,700,600,600,600] },
    { min:32,max:36, values:[800,800,800,700,700,600,600,600,500] },
    { min:37,max:41, values:[800,700,700,700,600,600,500,500,500] },
    { min:42,max:46, values:[700,700,700,600,600,500,500,500,400] },
    { min:47,max:51, values:[700,600,600,600,500,500,400,400,400] },
    { min:52,max:56, values:[600,600,600,500,500,400,400,400,350] },
    { min:57,max:61, values:[600,500,500,500,400,400,350,350,350] }
  ]);
  const ROWS_150_175 = Object.freeze([
    { min:12,max:14, values:[1200,1200,1200,1100,1000,900,800,800,800] },
    { min:14,max:16, values:[1200,1100,1100,1000,900,800,800,800,700] },
    { min:16,max:18, values:[1100,1000,1000,900,800,800,700,700,700] },
    { min:18,max:22, values:[1000,900,900,800,800,700,700,700,600] },
    { min:22,max:26, values:[900,800,800,800,700,700,600,600,600] },
    { min:27,max:31, values:[800,800,800,700,700,600,600,600,500] },
    { min:32,max:36, values:[800,700,700,700,600,600,500,500,500] },
    { min:37,max:41, values:[700,700,700,600,600,500,500,500,400] },
    { min:42,max:46, values:[700,600,600,600,500,500,400,400,400] },
    { min:47,max:51, values:[600,600,600,500,500,400,400,400,350] },
    { min:52,max:56, values:[600,500,500,500,400,400,350,350,350] },
    { min:57,max:61, values:[500,500,500,400,400,350,350,350,300] }
  ]);

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

  function familyKey(name) {
    const n = norm(name);
    if (n.includes('v tac 23')) return 'v-tac 23';
    if (n.includes('v tac 25')) return 'v-tac 25';
    if (n.includes('v tac 27')) return 'v-tac 27';
    if (n.includes('vx 27')) return 'vx-27';
    if (n.includes('3dhv')) return '3dhv';
    if (n.includes('vxt')) return 'vxt';
    if (n.includes('vft')) return 'vft';
    if (/\bvap\b/.test(n)) return 'vap';
    return '';
  }

  function roundedLength(value = document.getElementById('arrowLength')?.value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.floor(n + 0.5) : null;
  }
  function selectedFrontWeight() {
    const point = Number(document.getElementById('victoryPointWeightV48')?.value);
    const insert = Number(document.getElementById('victoryInsertWeightV48')?.value);
    return (Number.isFinite(point) ? point : 100) + (Number.isFinite(insert) ? insert : 0);
  }
  function weightBand(total) {
    if (total >= 100 && total <= 125) return { rows:ROWS_100_125,label:'100–125 gr' };
    if (total >= 150 && total <= 175) return { rows:ROWS_150_175,label:'150–175 gr' };
    return null;
  }
  function findRow(rows, draw) {
    return rows.find(row => draw >= row.min && draw <= row.max) || null;
  }
  function selectorResultForFront(frontWeight, drawValue = document.getElementById('drawWeight')?.value, lengthValue = document.getElementById('arrowLength')?.value) {
    const draw = Number(drawValue);
    const length = roundedLength(lengthValue);
    const front = Number(frontWeight);
    const band = weightBand(front);
    if (!Number.isFinite(draw) || !Number.isFinite(length) || !band) return null;
    const col = LENGTHS.indexOf(length);
    if (col < 0) return null;
    const row = findRow(band.rows,draw);
    if (!row) return null;
    const spine = row.values[col];
    if (!Number.isFinite(spine)) return null;
    return { spine,drawWeight:draw,length,frontWeight:front,frontBand:band.label };
  }
  function selectorResult() {
    return selectorResultForFront(selectedFrontWeight());
  }

  function specFor(key) {
    return window.AssistantArcherManufacturerReference?.data?.models?.[key] || null;
  }
  function sourceFor(spec) {
    const sourceKey = spec?.source;
    return sourceKey ? window.AssistantArcherManufacturerReference?.data?.sources?.[sourceKey] || '' : '';
  }
  function exactManufacturedRow(key,spine) {
    const spec = specFor(key);
    const row = spec?.spines?.[String(spine)] || null;
    return row ? { spec,row } : null;
  }
  function enrichModel(entry,result) {
    const key = familyKey(entry.model);
    if (!key) return entry;
    const exact = exactManufacturedRow(key,result.spine);
    if (!exact) return {
      ...entry,
      victoryChartSpine:String(result.spine), victoryChartExact:false,
      victorySelectionBasis:`Victory Recurve Spine Chart: ${result.drawWeight} lbs, ${result.length}\", avant ${result.frontBand} → spine ${result.spine}. Taille exacte du modèle non vérifiée dans la fiche locale.`
    };
    return {
      ...entry,
      advisedSpine:String(result.spine), manufacturerVerified:true,
      manufacturerSpec:exact.row, manufacturerSource:sourceFor(exact.spec), manufacturerModelKey:key,
      victoryChartSpine:String(result.spine), victoryChartExact:true,
      victorySelectionBasis:`Victory Recurve Spine Chart: ${result.drawWeight} lbs, ${result.length}\", avant ${result.frontBand} → spine ${result.spine}; taille présente dans la fiche fabricant ${exact.spec.name || key}.`
    };
  }
  function applySelector(rec,input) {
    if (!rec || rec.brand !== 'victory' || !Array.isArray(rec.models)) return rec;
    const result = selectorResult();
    if (!result) return rec;
    rec.primary = String(result.spine);
    rec.comparisonSpine = result.spine;
    rec.models = rec.models.map(entry => enrichModel(entry,result));
    const exactCount = rec.models.filter(entry => entry.victoryChartExact).length;
    rec.victorySelector = { version:VERSION,...result,source:CHART_SOURCE,image:CHART_IMAGE,exactModelCount:exactCount };
    rec.confidenceReasons = [...(rec.confidenceReasons || []),
      `Sélecteur Victory ${VERSION} : ${result.drawWeight} lbs, longueur ${result.length}\", poids avant ${result.frontWeight} gr (${result.frontBand}) → spine ${result.spine}.`,
      `${exactCount} modèle(s) Victory ont cette taille confirmée dans une fiche technique locale; les autres restent informatifs.`
    ];
    return rec;
  }
  function ensureWrapped() {
    const current = window.buildBrandRecommendation;
    if (typeof current !== 'function' || current.__victorySelectorV49) return false;
    const wrapped = function(input,brand) { return applySelector(current.apply(this,arguments),input); };
    wrapped.__victorySelectorV49 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }
  function updateVisibility() {
    const brand = document.getElementById('preferredBrand')?.value;
    const wrap = document.getElementById('victorySelectorV48');
    if (wrap) wrap.hidden = brand !== 'victory';
    if (brand !== 'victory') return;
    const output = document.getElementById('victorySelectorResultV48');
    if (!output) return;
    const front = selectedFrontWeight();
    const band = weightBand(front);
    const result = selectorResult();
    if (result) output.innerHTML = `<strong>Victory :</strong> ${result.spine} spine · ${result.drawWeight} lbs · ${result.length}\" · avant ${result.frontWeight} gr (${result.frontBand})`;
    else if (!band) output.textContent = `Le tableau Victory couvre 100–125 gr ou 150–175 gr à l'avant. Valeur actuelle : ${front} gr. Aucun spine ne sera extrapolé.`;
    else output.textContent = `Renseignez une puissance et une longueur couvertes par le tableau Victory (23–31\").`;
  }
  function installFields() {
    const form = document.getElementById('spine-form');
    const brand = document.getElementById('preferredBrand');
    if (!form || !brand) return;
    if (!document.getElementById('victorySelectorV48')) {
      const fieldset = document.createElement('fieldset');
      fieldset.id = 'victorySelectorV48'; fieldset.hidden = true;
      fieldset.className = 'manufacturer-selector victory-selector';
      fieldset.innerHTML = `<legend>Calculateur Victory — recurve</legend>
        <label>Poids de pointe<select id="victoryPointWeightV48"><option value="80">80 grains</option><option value="90">90 grains</option><option value="100" selected>100 grains</option><option value="120">120 grains</option><option value="125">125 grains</option><option value="150">150 grains</option></select></label>
        <label>Poids d'insert<select id="victoryInsertWeightV48"><option value="0" selected>0 grain</option><option value="11">11 grains</option><option value="12">12 grains</option><option value="22">22 grains</option><option value="33">33 grains</option></select></label>
        <p id="victorySelectorResultV48" class="field-hint"></p>
        <small class="field-hint">Tableau fabricant Victory Recurve Spine Chart. Poids avant = pointe + insert. Hors des plages publiées, l'app n'extrapole pas.</small>`;
      const anchor = document.getElementById('arrowLength')?.closest('label');
      anchor?.insertAdjacentElement('afterend',fieldset) || form.appendChild(fieldset);
      fieldset.querySelectorAll('select').forEach(el => el.addEventListener('change',updateVisibility));
    }
    if (!brand.dataset.victorySelectorV49) { brand.dataset.victorySelectorV49='1'; brand.addEventListener('change',updateVisibility); }
    ['drawWeight','arrowLength'].forEach(id => { const el=document.getElementById(id); if (el && !el.dataset.victorySelectorV49) { el.dataset.victorySelectorV49='1'; el.addEventListener('input',updateVisibility); }});
    if (!form.dataset.victorySelectorV49) { form.dataset.victorySelectorV49='1'; form.addEventListener('submit',() => { ensureWrapped(); updateVisibility(); },{capture:true}); }
    updateVisibility();
  }
  function install() {
    installFields(); ensureWrapped(); [250,800,1800].forEach(ms => setTimeout(ensureWrapped,ms));
    window.AssistantArcherVictorySelector = Object.freeze({
      version:VERSION, selectorResult, selectorResultForFront, applySelector, familyKey,
      sources:Object.freeze({chart:CHART_SOURCE,image:CHART_IMAGE})
    });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',install,{once:true}) : install();
})();
