/* Assistant Archer TEST - couche de précision fabricant Pré-alpha v12.
   Ne remplace jamais une donnée fabricant inconnue par une estimation silencieuse. */
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v12';
  const DATA_URL = 'manufacturer-reference.json?v=20260822-prealpha-v12';
  const state = { data: null, patched: false, observer: null };
  const norm = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const MODEL_ALIASES = [
    ['superdrive micro', 'superdrive micro'],
    ['avance sport', 'avance'],
    ['avance', 'avance'],
    ['vector ready to shoot', 'vector'],
    ['vector', 'vector'],
    ['x10', 'x10'],
    ['brixxon', 'brixxon'],
    ['radius', 'radius'],
    ['performa', 'performa'],
    ['paragon', 'paragon'],
    ['preminens', 'preminens'],
    ['premiens', 'preminens'],
    ['vxt elite v1', 'vxt'],
    ['vxt', 'vxt'],
    ['vap target', 'vap'],
    ['vap sport', 'vap'],
    ['vap v3', 'vap'],
    ['vap', 'vap']
  ].sort((a, b) => b[0].length - a[0].length);

  function modelKey(name) {
    const value = norm(name);
    for (const [alias, key] of MODEL_ALIASES) {
      if (value.includes(alias)) return key;
    }
    return '';
  }

  function sourceUrl(spec) {
    const key = spec?.source;
    return key && state.data?.sources?.[key] ? state.data.sources[key] : '';
  }

  function exactSpines(spec) {
    return spec?.spines ? Object.keys(spec.spines).map(Number).filter(Number.isFinite) : [];
  }

  function numbersFromRange(label) {
    return (String(label || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
  }

  function chooseEastonSpineForModel(rangeLabel, spec) {
    const available = exactSpines(spec);
    const nums = numbersFromRange(rangeLabel);
    if (!available.length || !nums.length) return null;
    if (nums.length === 1) return available.includes(nums[0]) ? nums[0] : null;
    const high = Math.max(...nums);
    const low = Math.min(...nums);
    const inRange = available.filter(spine => spine >= low && spine <= high).sort((a, b) => b - a);
    return inRange[0] ?? null; // Easton recurve : côté le plus souple = valeur de spine la plus élevée.
  }

  function closestCandidate(candidates, target) {
    const values = candidates.map(Number).filter(Number.isFinite);
    if (!values.length) return null;
    if (!Number.isFinite(Number(target))) return values[0];
    return values.slice().sort((a, b) => Math.abs(a - Number(target)) - Math.abs(b - Number(target)))[0];
  }

  function refineEaston(rec) {
    if (!Array.isArray(rec?.models) || !String(rec.mode || '').startsWith('easton')) return rec;
    const refined = [];
    for (const entry of rec.models) {
      const key = modelKey(entry.model);
      const spec = state.data.models?.[key];
      if (!spec || spec.brand !== 'Easton' || !spec.spines) {
        refined.push(entry);
        continue;
      }
      const spine = chooseEastonSpineForModel(rec.primary, spec);
      if (spine == null) continue;
      refined.push({
        ...entry,
        advisedSpine: String(spine),
        manufacturerVerified: true,
        manufacturerSpec: spec.spines[String(spine)] || null,
        manufacturerSource: sourceUrl(spec)
      });
    }
    if (refined.length) {
      rec.models = refined;
      rec.confidenceReasons = [
        ...(rec.confidenceReasons || []),
        'Spine de chaque modèle Easton recoupé avec les tailles réellement disponibles sur la fiche fabricant.',
        'Dans une plage Easton recurve, la taille disponible la plus souple est privilégiée conformément à la note du tableau 2026.'
      ];
    }
    return rec;
  }

  function refineSkylon(rec) {
    if (rec?.brand !== 'skylon' || !Array.isArray(rec.models)) return rec;
    rec.models = rec.models.map(entry => {
      const key = modelKey(entry.model);
      const spec = state.data.models?.[key];
      if (!spec || spec.brand !== 'Skylon' || !spec.spines) return entry;
      const mentioned = numbersFromRange(entry.model).filter(value => value >= 300 && value <= 2500);
      const candidates = mentioned.filter(value => Object.prototype.hasOwnProperty.call(spec.spines, String(value)));
      const chosen = closestCandidate(candidates, entry.advisedSpine);
      if (chosen == null) return { ...entry, manufacturerVerified: false, manufacturerSource: sourceUrl(spec) };
      return {
        ...entry,
        advisedSpine: String(chosen),
        manufacturerVerified: true,
        manufacturerSpec: spec.spines[String(chosen)] || null,
        manufacturerSource: sourceUrl(spec)
      };
    });
    rec.confidenceReasons = [
      ...(rec.confidenceReasons || []),
      'Spines, GPI, diamètres, longueurs et pointes Skylon vérifiés sur les fiches modèle quand disponibles.'
    ];
    return rec;
  }

  function refineVictory(rec) {
    if (rec?.brand !== 'victory' || !Array.isArray(rec.models)) return rec;
    let legacyNaming = false;
    rec.models = rec.models.map(entry => {
      const text = norm(entry.model);
      if (text.includes('vap sport') || text.includes('vap target')) legacyNaming = true;
      const key = modelKey(entry.model);
      const spec = state.data.models?.[key];
      return spec ? { ...entry, manufacturerFamilyVerified: true, manufacturerSource: sourceUrl(spec), manufacturerFamilySpec: spec } : entry;
    });
    if (legacyNaming) {
      rec.confidence = 'Moyenne';
      rec.confidenceReasons = [
        ...(rec.confidenceReasons || []),
        'Attention : certaines appellations Victory internes sont historiques. La gamme cible actuelle est structurée en VAP/VXT avec grades V1, V3 et V6.'
      ];
    } else {
      rec.confidenceReasons = [...(rec.confidenceReasons || []), 'Famille Victory vérifiée sur la gamme cible actuelle.'];
    }
    return rec;
  }

  function patchBuildBrandRecommendation() {
    if (state.patched || typeof window.buildBrandRecommendation !== 'function') return;
    const original = window.buildBrandRecommendation;
    window.buildBrandRecommendation = function manufacturerAwareBuild(input, brand) {
      const rec = original.apply(this, arguments);
      if (!rec || !state.data) return rec;
      refineEaston(rec);
      refineSkylon(rec);
      refineVictory(rec);
      return rec;
    };
    state.patched = true;
  }

  function patchCarbonExpressSeries() {
    if (typeof window.carbonExpressRecommendation !== 'function' || window.carbonExpressRecommendation.__manufacturerV12) return;
    const original = window.carbonExpressRecommendation;
    const replacement = function manufacturerCarbonExpress(input) {
      const table = state.data?.carbonExpressRecurveSeries;
      if (!table || (input.drawWeight <= 34 && input.arrowLength <= 27)) return original.apply(this, arguments);
      const roundedLength = Math.max(23, Math.min(32, Math.round(Number(input.arrowLength))));
      const col = table.lengthsIn.indexOf(roundedLength);
      const row = table.rows.find(entry => Number(input.drawWeight) >= entry.range[0] && Number(input.drawWeight) <= entry.range[1]);
      if (col < 0 || !row) return { ok: false, message: 'Hors tableau Carbon Express Recurve Series fabricant.' };
      const selection = row.cells[col];
      if (!selection) return { ok: false, message: 'Case vide dans le tableau Carbon Express Recurve Series fabricant.' };
      const modelCodes = selection.split('|').filter(Boolean);
      const first = modelCodes[0] || '';
      const spineMatch = first.match(/(\d{3,4})$/);
      const value = spineMatch ? Number(spineMatch[1]) : 500;
      const buckets = [350,400,500,600,700,800,900,1000];
      const normalizedChoice = String(buckets.slice().sort((a,b)=>Math.abs(a-value)-Math.abs(b-value))[0]);
      return {
        ok: true,
        chart: 'series',
        selection,
        modelCode: first,
        modelCodes,
        normalizedChoice,
        rowLabel: `${row.range[0]}-${row.range[1]} lbs`,
        roundedLength,
        manufacturerVerified: true,
        sourceUrl: state.data.sources?.carbonExpressRecurve || ''
      };
    };
    replacement.__manufacturerV12 = true;
    window.carbonExpressRecommendation = replacement;
  }

  function formatSpec(spec, spine) {
    const row = spec?.spines?.[String(spine)] || null;
    const pieces = [];
    if (spec.innerDiameterMm) pieces.push(`ID ${spec.innerDiameterMm} mm`);
    else if (spec.innerDiameterIn) pieces.push(`ID ${spec.innerDiameterIn}\"`);
    if (spec.straightnessIn) pieces.push(`rectitude ±${spec.straightnessIn}\"`);
    if (row?.gpi != null) pieces.push(`${row.gpi} GPI`);
    if (row?.odMm != null) pieces.push(`OD ${row.odMm} mm`);
    if (row?.odIn != null) pieces.push(`OD ${row.odIn}\"`);
    if (row?.lengthIn != null) pieces.push(`longueur stock ${row.lengthIn}\"`);
    if (Array.isArray(row?.pointGr) && row.pointGr.length) pieces.push(`pointes fabricant ${row.pointGr.join('/')} gr`);
    return pieces.join(' · ');
  }

  function inferSpineFromText(text, spec) {
    if (!spec?.spines) return null;
    const candidates = (String(text || '').match(/\b\d{3,4}\b/g) || []).map(Number);
    return candidates.find(value => Object.prototype.hasOwnProperty.call(spec.spines, String(value))) ?? null;
  }

  function decorateManufacturerData() {
    const result = document.getElementById('result');
    if (!result || !state.data) return;
    result.querySelectorAll('li').forEach(li => {
      if (li.querySelector(':scope > .manufacturer-reference-line')) return;
      const strong = li.querySelector('strong');
      if (!strong) return;
      const key = modelKey(strong.textContent);
      const spec = state.data.models?.[key];
      if (!spec) return;
      const spine = inferSpineFromText(li.textContent, spec);
      const line = document.createElement('p');
      line.className = 'manufacturer-reference-line muted';
      line.style.cssText = 'margin:.35rem 0 .15rem;font-size:.82rem;line-height:1.35';
      const technical = formatSpec(spec, spine);
      const source = sourceUrl(spec);
      const grade = spec.grades ? `Grades: ${Object.entries(spec.grades).map(([name,tol]) => `${name} ±${tol}\"`).join(' · ')}` : '';
      line.innerHTML = `<strong>Donnée fabricant :</strong> ${technical || grade || spec.purpose || 'fiche fabricant vérifiée'}${source ? ` · <a href="${source}" target="_blank" rel="noopener noreferrer">source</a>` : ''}`;
      li.appendChild(line);
    });
  }

  function installReferenceBanner() {
    const result = document.getElementById('result');
    if (!result || document.getElementById('manufacturerReferenceV12')) return;
    const details = document.createElement('details');
    details.id = 'manufacturerReferenceV12';
    details.className = 'manufacturer-reference-status';
    details.style.cssText = 'margin:.65rem 0;padding:.65rem .75rem;border:1px solid rgba(0,0,0,.12);border-radius:10px';
    details.innerHTML = `<summary><strong>Références fabricant vérifiées — ${VERSION}</strong></summary><p style="margin:.55rem 0 0">Les caractéristiques exactes sont séparées des heuristiques internes. Une donnée absente reste inconnue. Easton, Victory, Skylon et le tableau Recurve Series Carbon Express sont recoupés avec les sources fabricant enregistrées.</p>`;
    const heading = result.querySelector('h2');
    if (heading?.nextSibling) result.insertBefore(details, heading.nextSibling);
    else result.prepend(details);
  }

  function refresh() {
    patchCarbonExpressSeries();
    patchBuildBrandRecommendation();
    installReferenceBanner();
    decorateManufacturerData();
  }

  async function install() {
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      window.AssistantArcherManufacturerReference = Object.freeze({
        version: VERSION,
        data: state.data,
        model: name => state.data.models?.[modelKey(name)] || null,
        refresh
      });
      const release = document.getElementById('appReleaseStatic');
      if (release) release.textContent = `Version : ${VERSION}`;
      refresh();
      const result = document.getElementById('result');
      if (result) {
        let queued = false;
        state.observer = new MutationObserver(() => {
          if (queued) return;
          queued = true;
          requestAnimationFrame(() => { queued = false; refresh(); });
        });
        state.observer.observe(result, { childList: true, subtree: true });
      }
    } catch (error) {
      console.error('Assistant Archer: chargement référence fabricant impossible', error);
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
