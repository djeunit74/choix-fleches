/* Assistant Archer TEST - mode Easton unifie et leger, Pré-alpha v35. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v35';

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
  const MODEL_GROUPS = Object.freeze({
    x10: Object.freeze({T01:[900,1000],T2:[750,830],T3:[700,750],T4:[650,700],T5:[600,650],T6:[550,600],T7:[500,550],T8:[450,500],T9:[410,450],T10:[380,410],T11:[380],T12:[350],T13:[325]}),
    ace: Object.freeze({'03':[1100],T01:[920,1000],T2:[780,850],T3:[720,780],T4:[670,720],T5:[620,670],T6:[570,620],T7:[520,570],T8:[470,520],T9:[430,470],T10:[400,430],T11:[370,400],T12:[370]})
  });

  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  function modelKey(name) {
    const n = norm(name);
    if (/^x10(?:\s|$)/.test(n) && !/parallel pro/.test(n)) return 'x10';
    if (n === 'a c e' || n === 'ace' || /^a c e\s/.test(n)) return 'ace';
    return '';
  }
  function roundedLength(value) { const n = Number(value); return Number.isFinite(n) ? Math.floor(n + 0.5) : null; }
  function rowFor(weight) { return Number.isFinite(weight) ? RECURVE_BANDS.findIndex(([a,b],i)=>i===0?weight<21:weight>=a&&weight<=b) : -1; }
  function parseRange(text) {
    const values = String(text || '').match(/\d+/g)?.map(Number) || [];
    if (!values.length) return null;
    if (values.length === 1) return {weak:values[0],stiff:values[0],label:String(values[0])};
    return {weak:Math.max(...values),stiff:Math.min(...values),label:`${Math.max(...values)}-${Math.min(...values)}`};
  }
  function pointWeight() { const n = Number(document.getElementById('eastonPointWeight')?.value); return Number.isFinite(n)&&n>0?n:100; }
  function limbAdjustment() { return document.getElementById('eastonLimbProfile')?.value === 'beginner' ? -5 : 0; }
  function manufacturerRange() {
    const draw = Number(document.getElementById('drawWeight')?.value);
    const length = roundedLength(document.getElementById('arrowLength')?.value);
    if (!Number.isFinite(draw) || !Number.isFinite(length)) return null;
    const col = LENGTHS.indexOf(length);
    const adjusted = draw + limbAdjustment() + 3 * ((pointWeight() - 100) / 25);
    const row = rowFor(adjusted);
    if (col < 0 || row < 0) return null;
    const range = parseRange(RANGES[row][col]);
    return range ? {...range,length,adjustedDrawWeight:adjusted,pointWeight:pointWeight()} : null;
  }
  function currentGroup() { const r = manufacturerRange(); return r?.label ? (RANGE_TO_GROUP[r.label] || null) : null; }
  function recurveSizeFor(name, group=currentGroup()) {
    const key = modelKey(name);
    const sizes = key && group ? MODEL_GROUPS[key]?.[group] : null;
    return sizes?.length ? sizes[sizes.length - 1] : null;
  }

  function updateHint() {
    const wrap = document.getElementById('eastonModeV35');
    const brand = document.getElementById('preferredBrand')?.value;
    if (wrap) wrap.hidden = brand !== 'easton';
    const hint = document.getElementById('eastonRangeHintV35');
    if (!hint || brand !== 'easton') return;
    const range = manufacturerRange(), group = currentGroup();
    if (!range || !group) {
      hint.textContent = 'Le mode Easton utilise le groupe fabricant et la taille recurve propre à chaque modèle.';
      return;
    }
    const x10 = recurveSizeFor('X10', group), ace = recurveSizeFor('A/C/E', group);
    hint.textContent = `Easton : ${range.label} → groupe ${group}${x10 ? ` · X10 recurve ${x10}` : ''}${ace ? ` · A/C/E recurve ${ace}` : ''}.`;
  }

  function installFields() {
    const form = document.getElementById('spine-form');
    const brand = document.getElementById('preferredBrand');
    if (!form || !brand) return;
    if (!document.getElementById('eastonModeV35')) {
      const wrap = document.createElement('div');
      wrap.id = 'eastonModeV35';
      wrap.innerHTML = `<p style="margin:.15rem 0 .45rem;font-weight:800">Réglage Easton</p>
        <label>Poids de pointe de référence (gr)<input id="eastonPointWeight" type="number" min="40" max="200" step="5" value="100" inputmode="numeric"></label>
        <label>Type de branches<select id="eastonLimbProfile"><option value="carbon" selected>Carbone compétition</option><option value="beginner">Bois / fibre débutant</option></select></label>
        <p id="eastonRangeHintV35" class="field-hint" style="margin:.35rem 0 0"></p>`;
      const anchor = document.getElementById('arrowLength')?.closest('label');
      anchor?.insertAdjacentElement('afterend', wrap) || form.appendChild(wrap);
      wrap.querySelectorAll('input,select').forEach(el => el.addEventListener('change', () => { updateHint(); form.requestSubmit?.(); }));
    }
    if (!brand.dataset.eastonV35Bound) {
      brand.dataset.eastonV35Bound = '1';
      brand.addEventListener('change', updateHint);
    }
    updateHint();
  }

  function wrapRecommendation() {
    if (window.buildBrandRecommendation?.__eastonV35) return true;
    if (typeof window.buildBrandRecommendation !== 'function') return false;
    const original = window.buildBrandRecommendation;
    const wrapped = function(input, brand) {
      const rec = original.apply(this, arguments);
      if (!rec || rec.brand !== 'easton' || !Array.isArray(rec.models)) return rec;
      const group = currentGroup();
      if (!group) return rec;
      rec.models = rec.models.map(entry => {
        const exact = recurveSizeFor(entry.model, group);
        return exact ? {...entry, advisedSpine:exact, eastonGroup:group, eastonExact:true} : entry;
      }).sort((a,b)=>Number(Boolean(b.eastonExact))-Number(Boolean(a.eastonExact)));
      const x10 = recurveSizeFor('X10',group), ace = recurveSizeFor('A/C/E',group);
      rec.confidenceReasons = [...(rec.confidenceReasons || []), `Easton ${VERSION} : groupe ${group}${x10?` · X10 recurve ${x10}`:''}${ace?` · A/C/E recurve ${ace}`:''}. Les familles documentées reçoivent leur taille recurve exacte ; les autres restent sur le moteur historique.`];
      return rec;
    };
    wrapped.__eastonV35 = true;
    window.buildBrandRecommendation = wrapped;
    return true;
  }

  function setVersion() { const release = document.getElementById('appReleaseStatic'); if (release) release.textContent = `Version : ${VERSION}`; }
  function install() {
    installFields(); setVersion();
    if (!wrapRecommendation()) {
      let tries = 0;
      const retry = setInterval(() => { tries++; if (wrapRecommendation() || tries >= 30) clearInterval(retry); }, 100);
    }
    document.getElementById('spine-form')?.addEventListener('submit', () => { updateHint(); setVersion(); });
    window.AssistantArcherEastonMode = Object.freeze({version:VERSION,manufacturerRange,currentGroup,recurveSizeFor});
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, {once:true}) : install();
})();
