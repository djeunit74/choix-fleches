/* Assistant Archer TEST - Victory Recurve Spine Chart, Pré-alpha v51.
   Sources fabricant: Victory Arrow Guide + catalogue Target 2026.
   Une seule table alimente le calculateur principal et la validation pointe/insert.
   Les modèles ne sont injectés comme exacts que si le spine calculé existe réellement
   dans la table de tailles fabricant du modèle.
*/
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v51';
  const CHART_SOURCE = 'https://victoryarchery.com/arrow-guide/';
  const CHART_IMAGE = 'https://victoryarchery.com/wp-content/uploads/2025/03/Recurve-Spine-2024-768x427.png';
  const CATALOG_SOURCE = 'https://issuu.com/rublinemarketing/docs/victory_archery_2026_digital_catalog_-_target';
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

  const VERIFIED_MODELS = Object.freeze({
    vap:Object.freeze({
      name:'VAP', source:'https://victoryarchery.com/arrows-target/vap/', material:'100% carbone', idIn:0.166,
      pointRange:Object.freeze([80,140]), grades:Object.freeze({V1:0.001,V3:0.003,V6:0.006}),
      spines:Object.freeze({
        350:{gpi:7.8,lengthIn:31,odIn:0.232},400:{gpi:7.2,lengthIn:31,odIn:0.227},
        450:{gpi:6.6,lengthIn:31,odIn:0.223},500:{gpi:6.1,lengthIn:31,odIn:0.218},
        600:{gpi:5.5,lengthIn:31,odIn:0.214},700:{gpi:5.7,lengthIn:31,odIn:0.216},
        800:{gpi:5.4,lengthIn:31,odIn:0.213},900:{gpi:5.0,lengthIn:31,odIn:0.210},
        1000:{gpi:4.7,lengthIn:31,odIn:0.208},1100:{gpi:4.7,lengthIn:31,odIn:0.208},
        1200:{gpi:4.6,lengthIn:31,odIn:0.206}
      })
    }),
    vxt:Object.freeze({
      name:'VXT', source:'https://victoryarchery.com/arrows-target/vxt/', material:'100% carbone', idIn:0.166,
      pointRange:Object.freeze([80,140]), grades:Object.freeze({V1:0.001,V3:0.003,V6:0.006}),
      spines:Object.freeze({
        300:{gpi:8.3,lengthIn:31,frontOdIn:0.241,middleOdIn:0.236,backOdIn:0.212},
        355:{gpi:7.4,lengthIn:31,frontOdIn:0.237,middleOdIn:0.229,backOdIn:0.207},
        450:{gpi:7.4,lengthIn:31,frontOdIn:0.236,middleOdIn:0.230,backOdIn:0.210},
        550:{gpi:7.1,lengthIn:31,frontOdIn:0.234,middleOdIn:0.228,backOdIn:0.210},
        630:{gpi:7.4,lengthIn:31,frontOdIn:0.235,middleOdIn:0.229,backOdIn:0.209}
      })
    })
  });

  const norm = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
  function findRow(rows, draw) { return rows.find(row => draw >= row.min && draw <= row.max) || null; }
  function selectorResultForFront(frontWeight, drawValue = document.getElementById('drawWeight')?.value, lengthValue = document.getElementById('arrowLength')?.value) {
    const draw = Number(drawValue), length = roundedLength(lengthValue), front = Number(frontWeight), band = weightBand(front);
    if (!Number.isFinite(draw) || !Number.isFinite(length) || !band) return null;
    const col = LENGTHS.indexOf(length); if (col < 0) return null;
    const row = findRow(band.rows,draw); if (!row) return null;
    const spine = row.values[col]; if (!Number.isFinite(spine)) return null;
    return { spine,drawWeight:draw,length,frontWeight:front,frontBand:band.label };
  }
  function selectorResult() { return selectorResultForFront(selectedFrontWeight()); }

  function runtimeSpecFor(key) { return window.AssistantArcherManufacturerReference?.data?.models?.[key] || null; }
  function verifiedSpecFor(key) { return VERIFIED_MODELS[key] || null; }
  function specFor(key) { return verifiedSpecFor(key) || runtimeSpecFor(key); }
  function sourceFor(spec) {
    if (spec?.source && /^https?:/i.test(spec.source)) return spec.source;
    const sourceKey = spec?.source;
    return sourceKey ? window.AssistantArcherManufacturerReference?.data?.sources?.[sourceKey] || CATALOG_SOURCE : CATALOG_SOURCE;
  }
  function exactManufacturedRow(key,spine) {
    const spec = specFor(key);
    const row = spec?.spines?.[String(spine)] || spec?.spines?.[Number(spine)] || null;
    return row ? { spec,row } : null;
  }
  function metaFor(key,spec,row,previous={}) {
    return {
      ...previous,
      material:'carbon', diameters:['thin'], environments:['outdoor'], disciplines:['target','field'], bowTypes:['recurve'],
      goals:['performance','competition','elite'], componentSystem:'manufacturer', distanceBand:'long', useCase:'target',
      pointRange:spec.pointRange || previous.pointRange || [80,140],
      manufacturerMaterial:spec.material, manufacturerInnerDiameterIn:spec.idIn ?? null,
      manufacturerGrades:spec.grades || null, manufacturerGpi:row.gpi ?? null,
      manufacturerLengthIn:row.lengthIn ?? null, manufacturerOdIn:row.odIn ?? null
    };
  }
  function enrichModel(entry,result) {
    const key = familyKey(entry.model); if (!key) return entry;
    const exact = exactManufacturedRow(key,result.spine);
    if (!exact) return {...entry,victoryChartSpine:String(result.spine),victoryChartExact:false,
      victorySelectionBasis:`Victory Recurve Spine Chart: ${result.drawWeight} lbs, ${result.length}\", avant ${result.frontBand} → spine ${result.spine}. Ce spine n'est pas une taille publiée pour ${entry.model}.`};
    return {...entry,model:exact.spec.name || entry.model,advisedSpine:String(result.spine),manufacturerVerified:true,
      manufacturerSpec:exact.row,manufacturerSource:sourceFor(exact.spec),manufacturerModelKey:key,
      victoryChartSpine:String(result.spine),victoryChartExact:true,meta:metaFor(key,exact.spec,exact.row,entry.meta),
      victorySelectionBasis:`Victory Recurve Spine Chart: ${result.drawWeight} lbs, ${result.length}\", avant ${result.frontBand} → spine ${result.spine}; taille publiée pour ${exact.spec.name || key}.`};
  }
  function injectExactModels(models,result,input) {
    const out=[...models], seen=new Set(out.map(entry=>familyKey(entry.model)).filter(Boolean));
    for (const key of ['vap','vxt']) {
      if (seen.has(key)) continue;
      const exact=exactManufacturedRow(key,result.spine); if (!exact) continue;
      const requested=Number(input?.arrowLength ?? document.getElementById('arrowLength')?.value);
      if (Number.isFinite(requested) && Number(exact.row.lengthIn) < requested) continue;
      out.push({model:exact.spec.name,advisedSpine:String(result.spine),score:100,manufacturerVerified:true,
        manufacturerSpec:exact.row,manufacturerSource:sourceFor(exact.spec),manufacturerModelKey:key,
        victoryChartSpine:String(result.spine),victoryChartExact:true,verifiedCatalogInjection:true,
        meta:metaFor(key,exact.spec,exact.row),victorySelectionBasis:`Victory Target 2026 + Recurve Spine Chart : spine ${result.spine} réellement fabriqué pour ${exact.spec.name}.`});
      seen.add(key);
    }
    return out;
  }
  function applySelector(rec,input) {
    if (!rec || rec.brand !== 'victory' || !Array.isArray(rec.models)) return rec;
    const result=selectorResult(); if (!result) return rec;
    rec.primary=String(result.spine); rec.comparisonSpine=result.spine;
    rec.models=injectExactModels(rec.models.map(entry=>enrichModel(entry,result)),result,input);
    const exactCount=rec.models.filter(entry=>entry.victoryChartExact).length;
    rec.victorySelector={version:VERSION,...result,source:CHART_SOURCE,catalogSource:CATALOG_SOURCE,image:CHART_IMAGE,exactModelCount:exactCount};
    rec.confidenceReasons=[...(rec.confidenceReasons||[]),
      `Sélecteur Victory ${VERSION} : ${result.drawWeight} lbs, longueur ${result.length}\", poids avant ${result.frontWeight} gr (${result.frontBand}) → spine ${result.spine}.`,
      `${exactCount} modèle(s) Victory ont exactement ce spine dans la table fabricant 2026. Les tailles voisines ne sont pas présentées comme équivalentes.`];
    return rec;
  }

  function victoryExactHtml(entry,input) {
    const row=entry.manufacturerSpec || {}, spec=specFor(entry.manufacturerModelKey) || {}, meta=entry.meta || {};
    const pointSetup=meta.pointRange && typeof window.estimatePointSetup==='function' ? window.estimatePointSetup(input,meta.pointRange,meta) : null;
    const od=Number(row.odIn), gpi=Number(row.gpi), length=Number(row.lengthIn);
    const grades=spec.grades ? Object.keys(spec.grades).join('/') : '';
    const details=[
      `spine <strong>${esc(entry.advisedSpine)}</strong>`,
      Number.isFinite(gpi)?`${gpi} GPI`:'',
      Number.isFinite(od)?`OD ${od.toFixed(3)}\"`:'',
      Number.isFinite(length)?`stock ${length}\"`:'',
      grades?`grades ${grades}`:'',
      pointSetup?.recommended?`pointe ${pointSetup.recommended} gr`:''
    ].filter(Boolean).join(' | ');
    return `<li data-victory-exact="1"><strong>${esc(entry.model)}</strong> - ${details}<div class="aa-model-why" style="margin-top:.28rem;line-height:1.35"><strong>Pourquoi ce modèle :</strong> taille ${esc(entry.advisedSpine)} publiée par Victory et correspondant exactement au Recurve Spine Chart pour cette configuration.</div></li>`;
  }
  function ensureRenderWrapper() {
    const current=window.renderModelList;
    if (typeof current!=='function' || current.__victoryExactRenderV51) return false;
    const wrapped=function(recommendation,input) {
      if (recommendation?.brand==='victory' && Array.isArray(recommendation.models)) {
        const exact=recommendation.models.filter(entry=>entry.victoryChartExact===true);
        if (exact.length) {
          const seen=new Set();
          return exact.filter(entry=>{const key=`${familyKey(entry.model)}|${entry.advisedSpine}`;if(!key||seen.has(key))return false;seen.add(key);return true;})
            .map(entry=>victoryExactHtml(entry,input)).join('');
        }
      }
      return current.apply(this,arguments);
    };
    wrapped.__victoryExactRenderV51=true;
    window.renderModelList=wrapped;
    return true;
  }

  function ensureWrapped() {
    const current=window.buildBrandRecommendation;
    if (typeof current!=='function' || current.__victorySelectorV51) return false;
    const wrapped=function(input,brand){return applySelector(current.apply(this,arguments),input);};
    wrapped.__victorySelectorV51=true; window.buildBrandRecommendation=wrapped; return true;
  }
  function updateVisibility() {
    const brand=document.getElementById('preferredBrand')?.value, wrap=document.getElementById('victorySelectorV48');
    if (wrap) wrap.hidden=brand!=='victory'; if (brand!=='victory') return;
    const output=document.getElementById('victorySelectorResultV48'); if (!output) return;
    const front=selectedFrontWeight(), band=weightBand(front), result=selectorResult();
    if (result) output.innerHTML=`<strong>Victory :</strong> ${result.spine} spine · ${result.drawWeight} lbs · ${result.length}\" · avant ${result.frontWeight} gr (${result.frontBand})`;
    else if (!band) output.textContent=`Le tableau Victory couvre 100–125 gr ou 150–175 gr à l'avant. Valeur actuelle : ${front} gr. Aucun spine ne sera extrapolé.`;
    else output.textContent=`Renseignez une puissance et une longueur couvertes par le tableau Victory (23–31\").`;
  }
  function installFields() {
    const form=document.getElementById('spine-form'), brand=document.getElementById('preferredBrand'); if(!form||!brand)return;
    if(!document.getElementById('victorySelectorV48')){
      const fieldset=document.createElement('fieldset'); fieldset.id='victorySelectorV48';fieldset.hidden=true;fieldset.className='manufacturer-selector victory-selector';
      fieldset.innerHTML=`<legend>Calculateur Victory — recurve</legend>
        <label>Poids de pointe<select id="victoryPointWeightV48"><option value="80">80 grains</option><option value="90">90 grains</option><option value="100" selected>100 grains</option><option value="120">120 grains</option><option value="125">125 grains</option><option value="150">150 grains</option></select></label>
        <label>Poids d'insert<select id="victoryInsertWeightV48"><option value="0" selected>0 grain</option><option value="11">11 grains</option><option value="12">12 grains</option><option value="22">22 grains</option><option value="33">33 grains</option></select></label>
        <p id="victorySelectorResultV48" class="field-hint"></p><small class="field-hint">Tableau fabricant Victory Recurve Spine Chart. Poids avant = pointe + insert. Hors des plages publiées, l'app n'extrapole pas.</small>`;
      const anchor=document.getElementById('arrowLength')?.closest('label'); anchor?.insertAdjacentElement('afterend',fieldset)||form.appendChild(fieldset);
      fieldset.querySelectorAll('select').forEach(el=>el.addEventListener('change',updateVisibility));
    }
    if(!brand.dataset.victorySelectorV51){brand.dataset.victorySelectorV51='1';brand.addEventListener('change',updateVisibility);}
    ['drawWeight','arrowLength'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.victorySelectorV51){el.dataset.victorySelectorV51='1';el.addEventListener('input',updateVisibility);}});
    if(!form.dataset.victorySelectorV51){form.dataset.victorySelectorV51='1';form.addEventListener('submit',()=>{ensureWrapped();ensureRenderWrapper();updateVisibility();},{capture:true});}
    updateVisibility();
  }
  function install(){
    installFields();ensureWrapped();ensureRenderWrapper();[250,800,1800].forEach(ms=>setTimeout(()=>{ensureWrapped();ensureRenderWrapper();},ms));
    window.AssistantArcherVictorySelector=Object.freeze({version:VERSION,selectorResult,selectorResultForFront,applySelector,familyKey,exactManufacturedRow,
      sources:Object.freeze({chart:CHART_SOURCE,catalog:CATALOG_SOURCE,image:CHART_IMAGE})});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();
