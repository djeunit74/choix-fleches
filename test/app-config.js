/* Configuration centrale Assistant Archer TEST. */
window.AssistantArcherConfig = Object.freeze({
  version: '2026.08.21-v62',
  channel: 'test',
  historyLimit: 5,
  principles: Object.freeze({
    advisoryOnly: true,
    manufacturerSourcesFirst: true,
    coachValidationRecommended: true,
    measuredDrawWeightPreferred: true
  })
});

/* UX TEST v33 : choix direct d'une marque active.
   Le materiau reste une consequence de la recommandation et non une question obligatoire. */
(() => {
  const simplifyArrowChoiceForm = () => {
    const material = document.getElementById('shaftMaterial');
    if (material) {
      material.value = 'all';
      const label = material.closest('label');
      if (label) { label.hidden = true; label.style.display = 'none'; }
    }
    const guidance = document.getElementById('materialGuidance');
    if (guidance) { guidance.hidden = true; guidance.style.display = 'none'; }
    const brand = document.getElementById('preferredBrand');
    if (brand) {
      for (const value of ['all','carbon','avalon']) {
        const option = brand.querySelector(`option[value="${value}"]`);
        if (option) option.remove();
      }
      const allowed = ['easton','victory','skylon'];
      if (!allowed.includes(brand.value)) brand.value = brand.querySelector('option[value="easton"]') ? 'easton' : (brand.options[0]?.value || '');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', simplifyArrowChoiceForm, { once: true });
  else simplifyArrowChoiceForm();
})();

/* TEST v31 : enrichit les composants avant arrow-builder.
   - empennages : catalogue + masses FOC,
   - pointes : audit fabricant Easton/Victory/Skylon,
   - equilibre : precision de l'ensemble arriere.
   Les donnees fabricant restent prioritaires et les proxies restent explicitement signales. */
(() => {
  if (typeof window.fetch !== 'function' || window.__componentPrecisionFetchV31) return;
  const originalFetch = window.fetch.bind(window);
  const catalogPromise = originalFetch('./vane-catalog-v25.json?v=20260822-prealpha-v25', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { vanes: [] })
    .catch(() => ({ vanes: [] }));
  const massPromise = originalFetch('./vane-mass-v27.json?v=20260822-prealpha-v27', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { masses: [], additionalVanes: [] })
    .catch(() => ({ masses: [], additionalVanes: [] }));
  const rearPromise = originalFetch('./rear-precision-v28.json?v=20260822-prealpha-v28', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { profiles: {} })
    .catch(() => ({ profiles: {} }));
  const pointPromise = originalFetch('./point-catalog-v31.json?v=20260823-prealpha-v31', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : { points: [] })
    .catch(() => ({ points: [] }));

  const normPointKey = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const expandSpecialPointAliases = point => {
    const keys = new Set(Array.isArray(point?.tubeKeys) ? point.tubeKeys : []);
    const spines = new Set([
      ...(Array.isArray(point?.spines) ? point.spines : []),
      ...Object.keys(point?.weightsBySpine || {}),
      ...Object.values(point?.recommendedWeightsByTubeSpine || {}).flatMap(table => Object.keys(table || {}))
    ].map(String));
    for (const key of [...keys]) {
      const normalized = normPointKey(key);
      if (!['x10', 'vap', 'a c e', 'ace'].includes(normalized)) continue;
      for (const spine of spines) keys.add(`${key} ${spine}`);
    }
    return { ...point, tubeKeys: [...keys] };
  };

  window.fetch = async function(input, init) {
    const response = await originalFetch(input, init);
    const url = typeof input === 'string' ? input : String(input?.url || '');

    if (/arrow-components\.json(?:\?|$)/i.test(url)) {
      try {
        const [base, extra, massData, pointData] = await Promise.all([response.clone().json(), catalogPromise, massPromise, pointPromise]);
        const byId = new Map((Array.isArray(base.vanes) ? base.vanes : []).map(vane => [vane.id, vane]));
        for (const vane of (Array.isArray(extra.vanes) ? extra.vanes : [])) {
          const previous = byId.get(vane.id) || {};
          byId.set(vane.id, { ...previous, ...vane });
        }
        for (const vane of (Array.isArray(massData.additionalVanes) ? massData.additionalVanes : [])) {
          const previous = byId.get(vane.id) || {};
          byId.set(vane.id, { ...previous, ...vane });
        }
        for (const mass of (Array.isArray(massData.masses) ? massData.masses : [])) {
          const previous = byId.get(mass.id);
          if (Array.isArray(mass.variants) && previous) {
            byId.delete(mass.id);
            for (const variant of mass.variants) {
              const clone = { ...previous, ...mass, ...variant, variants: undefined };
              clone.model = `${previous.model} ${variant.label}`;
              clone.stiffness = variant.label;
              clone.rawWeightGrains = variant.rawWeightGrains;
              clone.weightGrains = variant.focUsable === true ? Number(variant.focEffectivePerVaneGrains) : undefined;
              byId.set(variant.id, clone);
            }
            continue;
          }
          if (!previous) continue;
          const mergedMass = { ...previous, ...mass };
          mergedMass.rawWeightGrains = mass.rawWeightGrains;
          if (mass.focUsable === true && Number.isFinite(Number(mass.focEffectivePerVaneGrains))) mergedMass.weightGrains = Number(mass.focEffectivePerVaneGrains);
          else delete mergedMass.weightGrains;
          byId.set(mass.id, mergedMass);
        }

        const pointById = new Map((Array.isArray(base.points) ? base.points : []).map(point => [point.id, point]));
        for (const point of (Array.isArray(pointData.points) ? pointData.points : [])) {
          const previous = pointById.get(point.id) || {};
          pointById.set(point.id, { ...previous, ...point });
        }
        const points = [...pointById.values()].map(expandSpecialPointAliases);

        const merged = { ...base, vanes: [...byId.values()], points, pointAuditVersion: pointData.version || null };
        return new Response(JSON.stringify(merged), {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch {
        return response;
      }
    }

    if (/arrow-balance\.json(?:\?|$)/i.test(url)) {
      try {
        const [base, precision] = await Promise.all([response.clone().json(), rearPromise]);
        const patchById = precision?.profiles || {};
        const profiles = (Array.isArray(base.profiles) ? base.profiles : []).map(profile => {
          const patch = patchById[profile.id];
          if (!patch) return profile;
          return {
            ...profile,
            ...patch,
            gpiBySpine: { ...(profile.gpiBySpine || {}), ...(patch.gpiBySpine || {}) },
            rearAssembly: { ...(profile.rearAssembly || {}), ...(patch.rearAssembly || {}) }
          };
        });
        const merged = { ...base, updatedAt: '2026-08-23', precisionVersion: precision.version, profiles };
        return new Response(JSON.stringify(merged), {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch {
        return response;
      }
    }

    return response;
  };
  window.__componentPrecisionFetchV31 = true;
})();

/* Cache-buster TEST pour la finition visuelle. */
(() => {
  const refreshUiPolish = () => {
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(el => /ui-polish\.css/i.test(el.getAttribute('href') || ''));
    if (link) link.href = 'ui-polish.css?v=20260822-prealpha-v25';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshUiPolish, { once: true });
  else refreshUiPolish();
})();

/* Boot TEST : couches stables puis précision Easton v37. Les anciens fichiers
   Easton v33/v34 restent chargés uniquement comme contrôleur version / shim inerte. */
(() => {
  if (typeof document === 'undefined') return;
  const add = (src, marker) => {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute(`data-${marker}`, '1');
    document.head.appendChild(script);
  };
  add('expert-model-ranking.js?v=20260823-prealpha-v30-label', 'expert-model-ranking');
  add('catalog-audit.js?v=20260822-prealpha-v25', 'catalog-audit');
  add('vane-library-v25.js?v=20260822-prealpha-v28', 'vane-library-v25');
  add('vane-mass-v27.js?v=20260822-prealpha-v28', 'vane-mass-v27');
  add('foc-zone-v29.js?v=20260823-prealpha-v30', 'foc-zone-v29');
  add('point-audit-v31.js?v=20260823-prealpha-v31-rollback-easton-v32', 'point-audit-v31');
  add('easton-mode-v33.js?v=20260823-prealpha-v37-release', 'easton-mode-v33');
  add('easton-groups-v34.js?v=20260823-prealpha-v34-disabled', 'easton-groups-v34');
  add('easton-precision-v37.js?v=20260823-prealpha-v37', 'easton-precision-v37');
})();
