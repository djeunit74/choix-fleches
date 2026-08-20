/* Assistant Archer TEST - couche unique d'integration apres app.js.
   Les correctifs transverses restent ici afin d'eviter les chaines de fichiers fix/final-fix. */
(() => {
  const cfg = window.AssistantArcherConfig || { version: 'refactor-dev', channel: 'test' };
  const norm = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const assetUrl = src => `${src}${src.includes('?') ? '&' : '?'}v=${encodeURIComponent(cfg.version || 'test')}`;
  const onceScript = (src, key) => {
    if (document.querySelector(`script[data-${key}]`)) return;
    const script = document.createElement('script');
    script.src = assetUrl(src);
    script.async = false;
    script.setAttribute(`data-${key}`, 'true');
    document.head.appendChild(script);
  };

  const originalNormalizeInput = window.normalizeInput;
  const originalScoreModel = window.scoreModel;
  const originalEastonCarbonRecommendation = window.eastonCarbonRecommendation;
  const originalEastonAluRecommendation = window.eastonAluRecommendation;
  const originalVictoryRecurveRecommendation = window.victoryRecurveRecommendation;
  const originalVictoryVxtRecommendation = window.victoryVxtRecommendation;
  const originalCarbonExpressRecommendation = window.carbonExpressRecommendation;
  const originalComputeArcSetup = window.computeArcSetup;
  const originalRenderArcSetup = window.renderArcSetup;
  const originalRenderBarebowArcSetup = window.renderBarebowArcSetup;
  const originalRenderDeals = window.renderDeals;
  const originalRenderComparisonBrandCard = window.renderComparisonBrandCard;
  const originalRenderModelList = window.renderModelList;

  function roundedLengthInRange(input, min, max, label) {
    const rounded = Math.round(input.arrowLength);
    return rounded < min || rounded > max
      ? { ok: false, message: `Longueur hors tableau ${label} (${min} a ${max} pouces).` }
      : null;
  }

  if (typeof originalNormalizeInput === 'function') {
    window.normalizeInput = input => {
      const discipline = input.discipline || 'target';
      if (input.shaftMaterial === 'all') {
        return { ...input, shootingProfile: 'recurve_all', shootingEnvironment: 'mixed', discipline };
      }
      return { ...originalNormalizeInput(input), discipline };
    };
  }
  if (typeof originalScoreModel === 'function') {
    window.scoreModel = (modelName, input, profile) => {
      if (input.shaftMaterial !== 'all') return originalScoreModel(modelName, input, profile);
      const outdoor = originalScoreModel(modelName, { ...input, shootingProfile: 'recurve_outdoor', shootingEnvironment: 'outdoor' }, profile);
      const indoor = originalScoreModel(modelName, { ...input, shootingProfile: 'recurve_indoor', shootingEnvironment: 'indoor' }, profile);
      return outdoor.score >= indoor.score ? outdoor : indoor;
    };
  }
  if (typeof originalEastonCarbonRecommendation === 'function') window.eastonCarbonRecommendation = input => roundedLengthInRange(input, 21, 34, 'Easton carbone') || originalEastonCarbonRecommendation(input);
  if (typeof originalEastonAluRecommendation === 'function') window.eastonAluRecommendation = input => roundedLengthInRange(input, 21, 32, 'Easton alu') || originalEastonAluRecommendation(input);
  if (typeof originalVictoryRecurveRecommendation === 'function') window.victoryRecurveRecommendation = input => roundedLengthInRange(input, 23, 31, 'Victory recurve') || originalVictoryRecurveRecommendation(input);
  if (typeof originalVictoryVxtRecommendation === 'function') window.victoryVxtRecommendation = input => roundedLengthInRange(input, 23, 31, 'Victory VXT') ? null : originalVictoryVxtRecommendation(input);
  if (typeof originalCarbonExpressRecommendation === 'function') {
    window.carbonExpressRecommendation = input => {
      const light = input.drawWeight <= 34 && input.arrowLength <= 27;
      return (light ? roundedLengthInRange(input, 21, 27, 'Carbon Express light recurve') : roundedLengthInRange(input, 23, 32, 'Carbon Express recurve series')) || originalCarbonExpressRecommendation(input);
    };
  }

  if (typeof originalComputeArcSetup === 'function') {
    window.computeArcSetup = input => {
      const setup = originalComputeArcSetup(input);
      const min = 2;
      const max = 6;
      const actual = setup.actualTiller;
      const target = actual < min ? min : actual > max ? max : actual;
      const expected = Math.round((input.upperTiller - target) * 10) / 10;
      setup.tillerRange = [min, max];
      setup.lowerTiller = expected;
      setup.lowerGap = Math.round((input.lowerTillerMeasured - expected) * 10) / 10;
      setup.tillerTarget = target;
      setup.tillerAction = actual >= min && actual <= max
        ? `Tiller dans la plage de depart conseillee (+${min} a +${max} mm). Conserver puis affiner au tir si necessaire.`
        : `Tiller hors plage de depart conseillee (+${min} a +${max} mm). Corriger progressivement vers la limite la plus proche.`;
      setup.adjustment = actual >= min && actual <= max
        ? { status: 'OK - dans la plage conseillee', advice: `Le tiller mesure (+${actual.toFixed(1)} mm) est compris entre +${min} et +${max} mm. Ne modifiez pas les vis uniquement pour viser +6 mm.` }
        : (typeof window.buildTillerAdjustment === 'function' ? window.buildTillerAdjustment(actual, target) : setup.adjustment);
      if (Array.isArray(setup.checks)) setup.checks = setup.checks.map(line => line.startsWith('Tiller :') ? `Tiller : plage de depart conseillee entre +${min} et +${max} mm, a affiner selon le comportement de l'arc.` : line);
      return setup;
    };
  }
  if (typeof originalRenderArcSetup === 'function') {
    window.renderArcSetup = input => {
      const out = originalRenderArcSetup(input);
      const element = document.getElementById('arcSetupResult');
      if (element) element.innerHTML = element.innerHTML
        .replace(/<strong>Tiller positif vise<\/strong> : \+[^<]+ mm/, '<strong>Plage de tiller conseillee</strong> : +2 a +6 mm')
        .replace(/<strong>Tiller<\/strong> : base visee \+[^|]+\|/, '<strong>Tiller</strong> : plage conseillee +2 a +6 mm |');
      return out;
    };
  }
  if (typeof originalRenderBarebowArcSetup === 'function' && typeof originalComputeArcSetup === 'function') {
    window.renderBarebowArcSetup = input => {
      if (typeof els !== 'undefined' && els.arcBbBandMeasured) els.arcBbBandMeasured.value = Number.isFinite(input.braceMeasured) ? String(input.braceMeasured) : '';
      const classical = window.computeArcSetup;
      window.computeArcSetup = currentInput => {
        const setup = originalComputeArcSetup(currentInput);
        const min = -2;
        const max = 2;
        const actual = setup.actualTiller;
        const target = Math.max(min, Math.min(max, actual));
        const expected = Math.round((currentInput.upperTiller - target) * 10) / 10;
        setup.tillerRange = [min, max];
        setup.lowerTiller = expected;
        setup.lowerGap = Math.round((currentInput.lowerTillerMeasured - expected) * 10) / 10;
        setup.tillerTarget = target;
        setup.tillerAction = actual >= min && actual <= max
          ? `Tiller faible/proche de zero (${actual.toFixed(1)} mm) : conserver comme base si l'arc est stable, puis valider au tir sur plusieurs ecarts sous l'encoche.`
          : `Tiller ${actual.toFixed(1)} mm : verifier d'abord la recommandation fabricant puis revenir progressivement vers un tiller faible si necessaire.`;
        setup.adjustment = actual >= min && actual <= max
          ? { status: 'Base arc nu coherente', advice: "Ne cherchez pas a atteindre exactement 0 mm. Validez le comportement de l'arc sur plusieurs ecarts sous l'encoche." }
          : (typeof window.buildTillerAdjustment === 'function' ? window.buildTillerAdjustment(actual, target) : setup.adjustment);
        return setup;
      };
      try { return originalRenderBarebowArcSetup(input); } finally { window.computeArcSetup = classical; }
    };
  }

  const ALIASES = {
    'avance': ['avance', 'avance sport'],
    'superdrive micro': ['superdrive micro'],
    'vector': ['vector'],
    'vector ready to shoot': ['vector ready to shoot', 'vector rts'],
    'x10': ['x10'],
    'a/c/e': ['a/c/e', 'ace'],
    'x10 parallel pro 4 mm': ['x10 parallel pro 4 mm', '4mm x10 parallel pro'],
    'x10 parallel pro 3.2 mm': ['x10 parallel pro 3.2 mm', 'x10 parallel pro 3 2 mm', '3.2mm x10 parallel pro', '3 2mm x10 parallel pro'],
    'x7': ['x7'], 'x23': ['x23'], 'rx7': ['rx7'], 'xx75 platinum plus': ['xx75 platinum plus'],
    'vap v3': ['vap v3'], 'vap sport': ['vap sport'], 'vap target': ['vap target', 'vap target v1', 'vap target elite', 'vap target sport'],
    'vxt elite v1': ['vxt elite v1', 'vxt elite'], 'vap gamer v3': ['vap gamer v3'], 'vft gamer v3': ['vft gamer v3'],
    'v-tac 23 elite': ['v-tac 23 elite', 'v tac 23 elite'], 'vforce': ['vforce'],
    'predator ii': ['predator ii'], 'maxima red': ['maxima red'], 'hunter xt': ['hunter xt'], 'trojan': ['trojan'],
    'nano-pro rz': ['nano pro rz', 'nano-pro rz'], 'nano-pro xtreme': ['nano pro xtreme', 'nano-pro xtreme'],
    'medallion xr': ['medallion xr'], 'nano sst': ['nano sst'],
    'brixxon': ['brixxon'], 'radius': ['radius'], 'premiens': ['premiens', 'preminens'], 'performa': ['performa'],
    'precium': ['precium'], 'paragon': ['paragon'], 'edge': ['edge']
  };
  const ALIAS_MATCHES = Object.entries(ALIASES)
    .flatMap(([key, aliases]) => aliases.map(alias => ({ key, alias: norm(alias) })))
    .filter(entry => entry.alias)
    .sort((a, b) => b.alias.length - a.alias.length);
  const WHY = {
    'avance': 'Retenue pour son tube carbone fin oriente cible : un choix coherent pour le classique et la progression vers la competition.',
    'superdrive micro': 'Retenue pour son petit diametre et son orientation performance exterieure ; interessante lorsque la discipline privilegie la tenue au vent, le campagne ou le 3D.',
    'vector': 'Retenue comme solution carbone polyvalente et accessible, adaptee au club, a la progression et au loisir cible.',
    'vector ready to shoot': 'Retenue comme version prete a tirer du Vector, pratique pour une configuration simple et immediatement exploitable.',
    'x10': 'Reference historique du tir olympique en arc classique : tube aluminium/carbone tres fin, concu pour la precision a longue distance et la reduction de la derive au vent.',
    'a/c/e': 'Reference aluminium/carbone legere et eprouvee, particulierement pertinente pour la cible et les longues distances lorsque sa taille correspond.',
    'x10 parallel pro 4 mm': 'Tube aluminium/carbone de competition a profil parallele 4 mm, pertinent en cible, campagne et arc nu lorsque la taille disponible correspond.',
    'x10 parallel pro 3.2 mm': 'Reference tres petit diametre de la famille X10, pensee pour la competition exterieure lorsque la taille disponible correspond.',
    'vap v3': 'Retenue pour son petit diametre carbone et son orientation cible/performance.',
    'vap sport': 'Retenue comme option carbone plus accessible de la famille VAP, adaptee a la progression en cible.',
    'vap target': 'Retenue pour sa conception dediee a la cible et a la precision.',
    'vxt elite v1': 'Retenue comme tube cible haut de gamme lorsque son spine disponible correspond a la configuration.',
    'vap gamer v3': 'Retenue comme tube carbone polyvalent lorsque la pratique et le niveau recherches correspondent a sa gamme.',
    'predator ii': 'Retenue comme tube carbone robuste et polyvalent, adapte a une pratique loisir ou parcours selon la configuration.',
    'maxima red': 'Retenue pour sa conception carbone orientee performance lorsque la discipline et le spine la rendent pertinente.',
    'brixxon': 'Retenue comme tube polyvalent pour la cible, l initiation ou l entrainement selon la configuration.',
    'radius': 'Retenue comme tube carbone accessible et polyvalent pour la progression.',
    'premiens': 'Retenue comme tube cible oriente precision lorsque sa plage de spine convient.',
    'performa': 'Retenue pour son orientation cible et performance lorsque la configuration correspond.',
    'precium': 'Retenue pour son orientation precision/cible lorsque la configuration correspond.',
    'paragon': 'Retenue comme tube carbone de cible oriente performance lorsque son spine convient.',
    'edge': 'Retenue comme option carbone polyvalente lorsque la configuration et la discipline correspondent.'
  };
  const EASTON_REFERENCES = [
    { key: 'x10', name: 'X10', material: 'Aluminium/Carbone — hybride', spines: [325,350,380,410,450,500,550,600,650,700,750,830,900,1000], bows: ['recurve'] },
    { key: 'a/c/e', name: 'A/C/E', material: 'Aluminium/Carbone — hybride', spines: [370,400,430,470,520,570,620,670,720,780,850,920,1000,1100,1250], bows: ['recurve','compound'] },
    { key: 'x10 parallel pro 4 mm', name: 'X10 Parallel Pro 4 mm', material: 'Aluminium/Carbone — hybride', spines: [250,300,340,380,420,470,520,570,610,660,710,810,880,1000,1150], bows: ['recurve','barebow','compound'] },
    { key: 'x10 parallel pro 3.2 mm', name: 'X10 Parallel Pro 3,2 mm', material: 'Aluminium/Carbone — hybride', spines: [340,380,420,460,500,550,600,650,700,750,800,900,1000], bows: ['recurve','barebow','compound'] }
  ];

  function canonical(value) {
    const text = ` ${norm(value)} `;
    for (const { key, alias } of ALIAS_MATCHES) {
      if (text.includes(` ${alias} `)) return key;
    }
    return '';
  }
  function modelKey(listItem) {
    const added = listItem?.dataset?.aaAddedReference;
    if (added && ALIASES[added]) return added;
    return canonical(listItem?.querySelector('strong')?.textContent || listItem?.textContent || '');
  }
  function dedupeModelList(list) {
    const seen = new Set();
    [...list.querySelectorAll(':scope > li')].forEach(item => {
      const key = modelKey(item);
      if (!key) return;
      if (seen.has(key)) item.remove();
      else seen.add(key);
    });
    return seen;
  }
  function currentBow() {
    const raw = norm(document.getElementById('bowStyle')?.value || document.getElementById('bowType')?.value || document.documentElement.dataset.bowType || 'recurve');
    return raw.includes('bare') || raw.includes('nu') ? 'barebow' : raw.includes('compound') || raw.includes('poul') ? 'compound' : 'recurve';
  }
  function eastonRange(result) {
    const text = result.textContent || '';
    const match = text.match(/(?:base\s+)?(\d{3,4})\s*[-–]\s*(\d{3,4})\s*\/\s*eq\.?\s*(\d{3,4})/i)
      || text.match(/plage fabricant\s*:\s*(\d{3,4})\s*[-–]\s*(\d{3,4})/i);
    return match ? [Math.min(+match[1], +match[2]), Math.max(+match[1], +match[2])] : null;
  }
  function augmentEaston(result) {
    if (!/Recommandation\s+Easton/i.test(result.textContent || '')) return;
    const range = eastonRange(result);
    if (!range) return;
    const [min, max] = range;
    const bow = currentBow();
    const heading = [...result.querySelectorAll('p,div,h3,h4')].find(element => /^\s*Mod[eè]les conseill[eé]s\s*:/i.test(element.textContent || ''));
    if (!heading) return;
    const list = heading.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;
    const existing = dedupeModelList(list);
    for (const model of EASTON_REFERENCES) {
      if (existing.has(model.key) || !model.bows.includes(bow)) continue;
      const available = model.spines.filter(spine => spine >= min && spine <= max);
      if (!available.length) continue;
      const item = document.createElement('li');
      item.dataset.aaAddedReference = model.key;
      item.innerHTML = `<strong>${model.name}</strong> - ${model.material} | spine(s) fabricant dans la plage : <strong>${available.join(', ')}</strong>`;
      list.appendChild(item);
      existing.add(model.key);
    }
  }
  function proposedModels(scope) {
    const models = new Map();
    scope.querySelectorAll('li').forEach(item => {
      if (item.closest('.merchant-block')) return;
      const key = modelKey(item);
      if (!key || models.has(key)) return;
      const label = item.querySelector('strong')?.textContent?.trim() || key;
      models.set(key, label);
    });
    return models;
  }
  function explainModels(scope) {
    scope.querySelectorAll('li').forEach(item => {
      if (item.closest('.merchant-block')) return;
      const key = modelKey(item);
      if (!key) return;
      let why = item.querySelector('.aa-model-why');
      if (!why) {
        why = document.createElement('div');
        why.className = 'aa-model-why';
        why.style.cssText = 'margin-top:.28rem;line-height:1.35';
        item.appendChild(why);
      }
      const html = '<strong>Pourquoi ce modele :</strong> ' + (WHY[key] || 'Retenu car ses caracteristiques, son usage et les tailles disponibles sont coherents avec la configuration selectionnee ; le choix final reste a confirmer au tir.');
      if (why.innerHTML !== html) why.innerHTML = html;
    });
  }

  function uniqueRecommendationModels(models = []) {
    const seen = new Set();
    return models.filter(entry => {
      const key = canonical(entry?.model || '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function renderAllModelList(recommendation, input) {
    const models = uniqueRecommendationModels(recommendation?.models || []);
    if (!models.length) return '<li>Aucun modele correspondant strictement a vos filtres.</li>';
    return models.map(entry => {
      const meta = entry.meta;
      const source = entry.sourceSpine ? ` | spine voisin ${entry.sourceSpine}` : '';
      const advisedSpine = entry.advisedSpine ? ` | spine conseille ${entry.advisedSpine}` : '';
      const pointSetup = meta?.pointRange && typeof window.estimatePointSetup === 'function' ? window.estimatePointSetup(input, meta.pointRange, meta) : null;
      const details = meta
        ? [
            typeof window.seriesLabel === 'function' ? window.seriesLabel(meta.seriesTier) : meta.seriesTier,
            typeof window.materialLabel === 'function' ? window.materialLabel(meta.material) : meta.material,
            typeof window.diameterLabel === 'function' ? window.diameterLabel(meta.diameters?.[0] || 'standard') : meta.diameters?.[0],
            typeof window.massLabel === 'function' ? window.massLabel(meta.massClass) : meta.massClass,
            typeof window.toleranceLabel === 'function' ? window.toleranceLabel(meta.toleranceClass) : meta.toleranceClass,
            typeof window.componentSystemLabel === 'function' ? window.componentSystemLabel(meta.componentSystem) : meta.componentSystem,
            typeof window.distanceBandLabel === 'function' ? window.distanceBandLabel(meta.distanceBand) : meta.distanceBand,
            typeof window.useCaseLabel === 'function' ? window.useCaseLabel(meta.useCase) : meta.useCase,
            `pointe conseillee ${pointSetup?.recommended || meta.pointRange[0]} gr (options ${pointSetup?.pointChoices?.join('/') || `${meta.pointRange[0]}-${meta.pointRange[1]}`})${advisedSpine}${source}`
          ].filter(Boolean).join(' | ')
        : 'Meta technique locale incomplete';
      return `<li><strong>${entry.model}</strong> - ${details}</li>`;
    }).join('');
  }
  if (typeof originalRenderModelList === 'function') window.renderModelList = renderAllModelList;

  function comparisonModelLine(entry, rec, input) {
    const meta = entry.meta;
    const pointSetup = meta?.pointRange && typeof window.estimatePointSetup === 'function' ? window.estimatePointSetup(input, meta.pointRange, meta) : null;
    const spine = entry.advisedSpine || rec.primary;
    const diameter = meta && typeof window.diameterLabel === 'function' ? window.diameterLabel(meta.diameters?.[0] || 'standard') : '';
    const point = pointSetup?.recommended || meta?.pointRange?.[0];
    const options = pointSetup?.pointChoices?.join('/') || (meta?.pointRange ? `${meta.pointRange[0]}-${meta.pointRange[1]}` : '');
    const details = [spine ? `spine ${spine}` : '', diameter, point ? `pointe ${point} gr` : '', options ? `options ${options}` : ''].filter(Boolean).join(' | ');
    return `<li><strong>${entry.model}</strong>${details ? ` - ${details}` : ''}</li>`;
  }
  if (typeof originalRenderComparisonBrandCard === 'function') {
    window.renderComparisonBrandCard = (entry, input) => {
      const models = uniqueRecommendationModels(entry.rec?.models || []);
      const modelList = models.length ? `<ul>${models.map(model => comparisonModelLine(model, entry.rec, input)).join('')}</ul>` : '<p>Aucun modele detaille pour cette marque.</p>';
      const deals = typeof originalRenderDeals === 'function'
        ? originalRenderDeals(entry.brand, input.shaftMaterial, input.bowType, input.shootingProfile, null, models.map(model => model.model))
        : '<p>Aucune offre marchande correspondante actuellement.</p>';
      const brand = typeof window.brandLabel === 'function' ? window.brandLabel(entry.brand) : entry.brand;
      const sources = typeof window.renderSourcesSection === 'function' ? window.renderSourcesSection([entry.brand]) : '';
      return `<article class="mini-card" data-aa-brand="${entry.brand}"><p class="mini-card-brand">${brand}</p><p class="mini-card-subtitle">Modeles coherents</p>${modelList}${deals}${sources}</article>`;
    };
  }

  function merchantPriceValue(price) {
    const match = String(price || '').replace(/\s/g, '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  }
  function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }
  function packageInfo(title) {
    const text = norm(title);
    const completeArrow = /\bfleches?\b/.test(text) && !/\btubes?\b/.test(text);
    const tube = /\btubes?\b|\bfuts?\b/.test(text);
    const twelve = /\bdouzaine\b|\blot de 12\b|\b12 tubes\b|\b12 futs\b|\b12 fleches\b/.test(text);
    const six = /\blot de 6\b|\b6 tubes\b|\b6 futs\b|\b6 fleches\b/.test(text);
    if (twelve) return { key: completeArrow ? 'arrows-12' : 'tubes-12', label: completeArrow ? 'lot de 12 fleches completes' : 'lot de 12 tubes' };
    if (six) return { key: completeArrow ? 'arrows-6' : 'tubes-6', label: completeArrow ? 'lot de 6 fleches completes' : 'lot de 6 tubes' };
    if (/\bunite\b|\ba l unite\b/.test(text) || (tube && !/\btubes\b/.test(text))) return { key: completeArrow ? 'arrow-1' : 'tube-1', label: completeArrow ? 'fleche complete a l unite' : 'tube a l unite' };
    return { key: 'unknown', label: 'conditionnement a verifier' };
  }
  function merchantDealKey(deal) {
    return canonical(deal?.modelKey || '');
  }
  function merchantIdentity(deal, key) {
    return [key, norm(deal.brand), norm(deal.material), (deal.bowTypes || []).map(norm).sort().join('|'), norm(deal.shop), String(deal.url || '').trim().toLowerCase()].join('::');
  }
  function dealVerificationFresh(deal) {
    if (deal?.availability !== 'available' || !deal?.lastCheckedAt) return false;
    const checked = new Date(deal.lastCheckedAt).getTime();
    return Number.isFinite(checked) && Date.now() - checked <= 48 * 60 * 60 * 1000;
  }
  function merchantDealsForModels(models, brandFilter = null) {
    const allDeals = typeof dealsState !== 'undefined' && Array.isArray(dealsState?.deals) ? dealsState.deals : [];
    const preferredBrand = document.getElementById('preferredBrand')?.value || 'all';
    const material = document.getElementById('shaftMaterial')?.value || 'all';
    const bow = currentBow() === 'barebow' ? 'recurve' : currentBow();
    const seen = new Set();
    const output = [];
    for (const deal of allDeals) {
      const key = merchantDealKey(deal);
      if (!key || !models.has(key)) continue;
      if (deal.availability === 'unavailable') continue;
      if (brandFilter && deal.brand !== brandFilter) continue;
      if (preferredBrand !== 'all' && deal.brand !== preferredBrand) continue;
      if (material !== 'all' && deal.material !== material) continue;
      if (Array.isArray(deal.bowTypes) && deal.bowTypes.length && !deal.bowTypes.includes(bow)) continue;
      if (!deal.url || !String(deal.url).startsWith('http') || !deal.shop || !deal.price) continue;
      const id = merchantIdentity(deal, key);
      if (seen.has(id)) continue;
      seen.add(id);
      output.push({ deal, key, package: packageInfo(deal.title), price: merchantPriceValue(deal.price), id });
    }
    return output;
  }
  function priceOpportunityIds(entries, verifiedOnly = false) {
    const groups = new Map();
    for (const entry of entries) {
      if (verifiedOnly && !dealVerificationFresh(entry.deal)) continue;
      if (entry.deal?.availability === 'unavailable' || entry.package.key === 'unknown' || !Number.isFinite(entry.price)) continue;
      const key = `${entry.key}::${entry.package.key}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }
    const opportunities = new Set();
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      group.sort((a, b) => a.price - b.price);
      const [best, next] = group;
      if (best.price <= next.price * 0.95) opportunities.add(best.id);
    }
    return opportunities;
  }
  function dealsFreshnessMessage() {
    if (typeof dealsState === 'undefined' || !dealsState?.updatedAt) return '';
    const updated = new Date(dealsState.updatedAt).getTime();
    if (!Number.isFinite(updated)) return '';
    return Date.now() - updated > 48 * 60 * 60 * 1000
      ? '<p><strong>Donnees marchands non actualisees recemment.</strong> Les recommandations techniques restent valides independamment des offres.</p>'
      : '';
  }
  function renderMerchantBlock(container, modelScope, brandFilter = null) {
    const models = proposedModels(modelScope);
    if (!models.size) return;
    const entries = merchantDealsForModels(models, brandFilter);
    const good = priceOpportunityIds(entries, true);
    const provisional = priceOpportunityIds(entries, false);
    const pendingVerification = entries.some(entry => !dealVerificationFresh(entry.deal));
    const byModel = new Map();
    for (const entry of entries) {
      if (!byModel.has(entry.key)) byModel.set(entry.key, []);
      byModel.get(entry.key).push(entry);
    }
    let block = container.querySelector(':scope > .merchant-block') || container.querySelector('.merchant-block');
    if (!block) {
      block = document.createElement('section');
      block.className = 'merchant-block';
      container.appendChild(block);
    }
    const modelSections = [...models.entries()].map(([key, label]) => {
      const offers = (byModel.get(key) || []).sort((a, b) => a.price - b.price || String(a.deal.shop).localeCompare(String(b.deal.shop)));
      if (!offers.length) return `<section class="merchant-model" data-model-key="${escapeText(key)}"><h4>${escapeText(label)}</h4><p>Aucune offre marchande correspondante actuellement.</p></section>`;
      const items = offers.map(entry => {
        const badge = good.has(entry.id)
          ? ' <mark><strong>🔥 Bonne affaire</strong></mark>'
          : provisional.has(entry.id)
            ? ' <mark><strong>💰 Prix interessant</strong></mark>'
            : '';
        return `<li><a href="${escapeText(entry.deal.url)}" target="_blank" rel="noopener noreferrer">${escapeText(entry.deal.title)}</a> — <strong>${escapeText(entry.deal.price)}</strong>${badge}<div class="aa-offer-meta">${escapeText(entry.deal.shop)} · ${escapeText(entry.package.label)}</div></li>`;
      }).join('');
      return `<section class="merchant-model" data-model-key="${escapeText(key)}"><h4>${escapeText(label)}</h4><ul class="merchant-deals">${items}</ul></section>`;
    }).join('');
    const pendingMessage = pendingVerification
      ? '<p class="merchant-verification-note"><strong>Verification quotidienne en cours :</strong> certains liens n ont pas encore leur controle de disponibilite du jour. “Prix interessant” compare uniquement les prix ; “Bonne affaire” apparait apres verification du lien.</p>'
      : '';
    block.innerHTML = `<p class="merchant-intro"><strong>Offres marchands coherentes :</strong> uniquement pour les modeles retenus par le calcul technique.</p>${dealsFreshnessMessage()}${pendingMessage}${modelSections}`;
  }
  function alignMerchants() {
    const result = document.getElementById('result');
    if (!result) return;
    const mainPanel = result.querySelector(':scope > .merchant-panel');
    if (mainPanel) renderMerchantBlock(mainPanel, result, null);
    result.querySelectorAll('.mini-card').forEach(card => {
      const brand = card.dataset.aaBrand || null;
      let holder = card.querySelector(':scope > .merchant-block');
      if (!holder) {
        holder = document.createElement('section');
        holder.className = 'merchant-block';
        const sources = [...card.children].find(child => child.tagName === 'P' && /Sources des tableaux/i.test(child.textContent || ''));
        if (sources) card.insertBefore(holder, sources);
        else card.appendChild(holder);
      }
      renderMerchantBlock(card, card, brand);
    });
  }

  function configureArrowChoiceInputs() {
    const material = document.getElementById('shaftMaterial');
    if (material) {
      const selected = material.value;
      const wanted = [
        ['all', 'Peu importe / conseille-moi'],
        ['carbon', 'Carbone'],
        ['alu', 'Aluminium']
      ];
      const currentSignature = [...material.options].map(option => `${option.value}:${option.textContent}`).join('|');
      const wantedSignature = wanted.map(([value, label]) => `${value}:${label}`).join('|');
      if (currentSignature !== wantedSignature) {
        material.innerHTML = wanted.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
        material.value = wanted.some(([value]) => value === selected) ? selected : 'all';
      }
    }
    const disciplineWrap = document.getElementById('disciplineWrap');
    if (disciplineWrap) {
      disciplineWrap.hidden = true;
      disciplineWrap.style.display = 'none';
    }
    const discipline = document.getElementById('discipline');
    if (discipline) {
      const selected = discipline.value || 'target';
      const signature = [...discipline.options].map(option => `${option.value}:${option.textContent}`).join('|');
      const wanted = 'target:Cible (salle ou exterieur)|field:Campagne|field:3D';
      if (signature !== wanted) {
        discipline.innerHTML = '<option value="target">Cible (salle ou exterieur)</option><option value="field">Campagne</option><option value="field">3D</option>';
        discipline.value = selected === 'field' ? 'field' : 'target';
      }
    }
    const guidance = document.getElementById('materialGuidance');
    if (guidance) guidance.textContent = 'Le lieu de tir n impose pas un materiau. Le carbone est polyvalent, l aluminium est courant en salle, et les tubes aluminium/carbone sont proposes automatiquement lorsqu un modele compatible existe.';
  }

  function applyBrandIdentity() {
    document.title = 'Assistant Archer';
    const icon = document.querySelector('link[rel="icon"]');
    if (icon && icon.getAttribute('href') !== 'icon-assistant-archer-v11.svg') { icon.href = 'icon-assistant-archer-v11.svg'; icon.type = 'image/svg+xml'; }
    const heading = document.querySelector('.hero h1');
    if (heading && heading.textContent !== 'Assistant Archer') heading.textContent = 'Assistant Archer';
    const intro = document.querySelector('.hero > p');
    const text = 'Choisir ses fleches, regler son arc et garder ses reperes.';
    if (intro && intro.textContent !== text) intro.textContent = text;
    if (!document.getElementById('aaBrandStyle')) {
      const style = document.createElement('style');
      style.id = 'aaBrandStyle';
      style.textContent = '.app-settings{border-color:var(--line)}.app-settings[open]{box-shadow:0 14px 30px rgba(9,31,55,.18)}.tab-nav{display:none!important}';
      document.head.appendChild(style);
    }
  }
  function applyStaticUi() {
    const summary = document.querySelector('.app-settings-toggle');
    const settings = '<span class="gear-icon" aria-hidden="true">⚙</span><span class="settings-label">Reglages Parametres</span>';
    if (summary && summary.innerHTML !== settings) summary.innerHTML = settings;
    const version = document.getElementById('appVersionStatic');
    const versionText = 'Version : ' + cfg.version;
    if (version && version.textContent !== versionText) version.textContent = versionText;
    document.getElementById('appVersionInfo')?.remove();
    const guide = document.getElementById('aaNeedsGuide');
    if (guide) {
      const notebook = guide.querySelector('[data-go="notebook"]');
      const sight = guide.querySelector('[data-go="sight"]');
      if (notebook && notebook.textContent !== 'Enregistrer / retrouver mes reglages') notebook.textContent = 'Enregistrer / retrouver mes reglages';
      if (sight && sight.textContent !== 'Enregistrer / consulter mes reperes') sight.textContent = 'Enregistrer / consulter mes reperes';
    }
    document.querySelectorAll('.arc-classic-only p').forEach(paragraph => {
      if (paragraph.textContent.includes('Repere de base')) {
        const html = "Le <strong>band</strong> depend surtout de la taille d'arc. Le <strong>tiller positif</strong> se calcule ainsi : <strong>tiller haut - tiller bas</strong>. Repere de depart : entre <strong>+2 et +6 mm</strong>.";
        if (paragraph.innerHTML !== html) paragraph.innerHTML = html;
      }
    });
    configureArrowChoiceInputs();
    applyBrandIdentity();
  }

  let deferredInstallPrompt = null;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  function installAppSettingsControl() {
    const body = document.querySelector('.app-settings-body');
    if (!body || document.getElementById('installAppBtn') || isStandalone()) return;
    const block = document.createElement('div');
    block.className = 'app-install-setting';
    block.style.cssText = 'margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)';
    block.innerHTML = '<button type="button" id="installAppBtn">Installer l\'application</button><p id="installAppStatus" style="margin:.5rem 0 0;font-size:.9em">Ajoute Assistant Archer comme une application sur le telephone.</p>';
    const button = block.querySelector('button');
    const status = block.querySelector('p');
    button.onclick = async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        status.textContent = choice.outcome === 'accepted' ? 'Installation lancee.' : 'Installation annulee.';
      } else if (isIOS()) status.textContent = "Sur iPhone/iPad : Safari > Partager > Ajouter a l'ecran d'accueil.";
      else status.textContent = "Ouvrez le menu du navigateur puis choisissez Installer l'application ou Ajouter a l'ecran d'accueil.";
    };
    body.appendChild(block);
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const status = document.getElementById('installAppStatus');
    if (status) status.textContent = "Pret a installer : touchez Installer l'application.";
  });
  window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; document.querySelector('.app-install-setting')?.remove(); });
  localStorage.setItem('sw-cleanup-v1', 'done');
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

  function removeAlternativeSpines(result) {
    if (!result) return;
    result.querySelectorAll('p').forEach(paragraph => { if (/^\s*Alternatives?\s+spine\s*:/i.test(paragraph.textContent || '')) paragraph.remove(); });
  }
  function enhancePointAdvice() {
    const result = document.getElementById('result');
    if (!result) return;
    const paragraphs = [...result.querySelectorAll('p')];
    const point = paragraphs.find(paragraph => paragraph.textContent.trim().startsWith('Pointe conseillee'));
    if (!point || point.dataset.pointGuidance === '1') return;
    const match = point.textContent.match(/Pointe conseillee\s*:\s*(\d+)\s*gr.*?(\d+)\s*-\s*(\d+)\s*gr/i);
    if (!match) return;
    point.dataset.pointGuidance = '1';
    point.innerHTML = `<strong>Pointe conseillee</strong> : ${match[1]} gr <span class="result-subvalue">(plage fabricant ${match[2]}-${match[3]} gr)</span>`;
    const quick = paragraphs.find(paragraph => paragraph.textContent.trim().startsWith('Ajustement rapide'));
    if (quick) quick.innerHTML = '<strong>Affinage au tir</strong> : une pointe plus lourde assouplit dynamiquement la fleche ; une pointe plus legere la raidit. Restez dans la plage compatible du tube.';
  }

  onceScript('barebow-guidance.js', 'barebow-guidance');
  onceScript('ui-refactor.js', 'ui-refactor');
  onceScript('expert-audit.js', 'expert-audit');
  onceScript('onboarding.js', 'onboarding');

  const upperTillerInput = document.getElementById('upperTiller');
  const lowerTillerInput = document.getElementById('lowerTillerMeasured');
  if (upperTillerInput) { upperTillerInput.value = ''; upperTillerInput.placeholder = 'Ex : 222'; }
  if (lowerTillerInput) { lowerTillerInput.value = ''; lowerTillerInput.placeholder = 'Ex : 218'; }

  let queued = false;
  let running = false;
  function run() {
    if (queued || running) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      running = true;
      try {
        applyStaticUi();
        installAppSettingsControl();
        const result = document.getElementById('result');
        if (result) {
          removeAlternativeSpines(result);
          augmentEaston(result);
          explainModels(result);
          enhancePointAdvice();
        }
        alignMerchants();
        if (document.documentElement.dataset.testFixVersion !== cfg.version) document.documentElement.dataset.testFixVersion = cfg.version;
      } finally {
        running = false;
      }
    });
  }
  function init() {
    run();
    const observer = new MutationObserver(mutations => {
      if (running) return;
      const relevant = mutations.some(mutation => {
        const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
        return target?.closest?.('#result,#arcSetupResult,#notebookResult,#sightResult,.app-settings-body,.hero,#aaNeedsGuide');
      });
      if (relevant) run();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener('submit', () => { setTimeout(run, 0); setTimeout(run, 150); setTimeout(run, 500); }, true);
    document.addEventListener('change', () => setTimeout(run, 100), true);
    queueMicrotask(() => { try { window.applyBowStyle?.(window.currentBowStyle?.()); } catch {} });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
