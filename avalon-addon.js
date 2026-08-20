(() => {
  const AVALON_2016 = 'https://www.bogentandler.at/pdf-attachments/tables/20160816_arrowselector.pdf';
  const AVALON_CURRENT = 'https://www.avalon-archery.com/fletched_arrows_shafts';
  const LENGTHS = [21,22,23,24,25,26,27,28,29,30,31,32];
  const ROWS = [
    { range:[16,19], cells:[null,null,null,null,'A1','A1','A1','A2',null,null,null,null] },
    { range:[20,23], cells:[null,null,null,null,'A2','A3','A4','A5','A6',null,null,null] },
    { range:[24,29], cells:[null,null,'A1','A2','A3','A4','A5','A6','A7','A8',null,null] },
    { range:[30,35], cells:[null,null,'A2','A3','A4','A5','A6','A7','A8','A9','A10','A11'] },
    { range:[36,40], cells:[null,null,'A3','A4','A5','A6','A7','A8','A9','A10','A12','A13'] },
    { range:[41,45], cells:[null,null,'A4','A5','A6','A7','A8','A9','A10','A12','A14','A15'] },
    { range:[46,50], cells:[null,null,'A5','A6','A7','A8','A9','A10','A12','A14','A15','A16'] },
    { range:[51,55], cells:[null,null,'A6','A7','A8','A9','A10','A12','A14','A15','A16','A17'] },
    { range:[56,60], cells:[null,null,'A7','A8','A9','A10','A12','A14','A15','A16','A17','A17'] },
    { range:[61,65], cells:[null,null,'A8','A9','A10','A12','A14','A15','A16','A17','A17','A18'] },
    { range:[66,70], cells:[null,null,'A9','A10','A12','A14','A15','A16','A17','A17','A18','A18'] }
  ];

  // Seuls les groupes pour lesquels un modele Tyro / Classic est documente sont renseignes.
  // Les groupes absents ne doivent jamais etre extrapoles.
  const GROUPS = {
    A1:['Avalon Tyro 1500','Avalon Tyro 1800','Avalon Classic 1500','Avalon Classic 1800'],
    A2:['Avalon Tyro 1300','Avalon Classic 1300'],
    A3:['Avalon Tyro 1100','Avalon Classic 1100'],
    A4:['Avalon Tyro 1000','Avalon Classic 1000'],
    A5:['Avalon Tyro 900','Avalon Classic 900'],
    A6:['Avalon Tyro 800','Avalon Tyro 900','Avalon Classic 800','Avalon Classic 900'],
    A7:['Avalon Tyro 700','Avalon Tyro 800','Avalon Classic 700','Avalon Classic 800'],
    A8:['Avalon Tyro 600','Avalon Tyro 700','Avalon Classic 600','Avalon Classic 700'],
    A9:['Avalon Tyro 600','Avalon Classic 600'],
    A10:['Avalon Tyro 600','Avalon Classic 500','Avalon Classic 600'],
    A12:['Avalon Classic 500'],
    A14:['Avalon Classic 500']
  };

  const spineOf = name => String(name).match(/(\d{3,4})$/)?.[1] || null;

  function groupFor(input) {
    const length = Math.round(input.arrowLength);
    const column = LENGTHS.indexOf(length);
    if (column < 0) return null;
    const row = ROWS.find(entry => input.drawWeight >= entry.range[0] && input.drawWeight <= entry.range[1]);
    if (!row) return null;
    const group = row.cells[column];
    return group ? { group, rowLabel:`${row.range[0]}-${row.range[1]} lbs`, length } : null;
  }

  function modelMeta(name) {
    const spine = Number(spineOf(name) || 800);
    const tyro = name.includes('Tyro');
    const points = tyro ? (spine >= 1800 ? [50] : spine >= 900 ? [70] : [90]) : [60,70,80,90,100,110,120];
    return {
      material:'carbon', diameters:['standard'], environments:['outdoor','mixed'],
      disciplines:['target','field'], bowTypes:['recurve'], goals:['club','polyvalent'],
      pointRange:[Math.min(...points),Math.max(...points)], pointChoices:points,
      note:'Correspondance issue du tableau Avalon 2016, gamme actuelle controlee.',
      seriesTier:'club', massClass:spine >= 1000 ? 'light' : 'medium',
      toleranceClass:'standard', componentSystem:'insert', useCase:'club',
      distanceBand:'mixed', dataPrecision:'model'
    };
  }

  function emptyRecommendation(input, profile, reason) {
    return {
      brand:'avalon', mode:'avalon-table', primary:'Hors tableau', softer:null, stiffer:null,
      load:input.drawWeight, confidence:'Faible', confidenceReasons:[reason,'Aucune extrapolation automatique.'],
      models:[], alternativeModels:[], fallbackLabel:'', recommendedMaterial:'carbon',
      recommendedDiameter:'standard', recommendedPointRange:profile.pointRange,
      recommendedPointWeight:input.pointWeight, recommendedPointChoices:[],
      recommendedPointProfile:'standard', recommendedPointSofter:null, recommendedPointStiffer:null,
      pointWeightNote:'Verifier le tableau fabricant.', recommendedSeries:'club',
      recommendedMass:'medium', recommendedTolerance:'standard', recommendedComponentSystem:'insert',
      recommendedUseCase:'club', recommendedDistanceBand:'mixed',
      notes:['Avalon : pas de correspondance automatique fiable pour cette combinaison.']
    };
  }

  function integrateSources() {
    const important = [...document.querySelectorAll('[data-panel="spine"] .card.notes')]
      .find(card => /Important/i.test(card.querySelector('h3')?.textContent || ''));
    const list = important?.querySelector('ul');
    if (!list) return;
    const sourceLine = [...list.querySelectorAll('li')]
      .find(li => /Tableaux officiels|Tableaux fabricants|fabricants a consulter/i.test(li.textContent || ''));
    if (!sourceLine || sourceLine.querySelector('a[data-avalon-source]')) return;

    const a2016 = document.createElement('a');
    a2016.href = AVALON_2016;
    a2016.target = '_blank';
    a2016.rel = 'noopener noreferrer';
    a2016.dataset.avalonSource = '2016';
    a2016.textContent = 'Avalon / ArrowSelector 2016';

    const current = document.createElement('a');
    current.href = AVALON_CURRENT;
    current.target = '_blank';
    current.rel = 'noopener noreferrer';
    current.dataset.avalonSource = 'current';
    current.textContent = 'gamme actuelle Avalon';

    const last = sourceLine.lastChild;
    if (last?.nodeType === Node.TEXT_NODE && /\.\s*$/.test(last.nodeValue || '')) {
      last.nodeValue = last.nodeValue.replace(/\.\s*$/, '');
    }
    sourceLine.append(document.createTextNode(', '), a2016, document.createTextNode(' et '), current, document.createTextNode('.'));
  }

  function installCatalog() {
    const select = document.getElementById('preferredBrand');
    if (select && !select.querySelector('option[value="avalon"]')) {
      const option = document.createElement('option');
      option.value = 'avalon';
      option.textContent = 'Avalon';
      select.appendChild(option);
    }
    if (typeof BRAND_ORDER !== 'undefined' && !BRAND_ORDER.includes('avalon')) BRAND_ORDER.push('avalon');

    const models = [...new Set(Object.values(GROUPS).flat())];
    const catalog = {};
    models.forEach(name => {
      const spine = spineOf(name);
      (catalog[spine] ??= []).push(name);
    });
    if (typeof arrowCatalog !== 'undefined') arrowCatalog.avalon = catalog;
    if (typeof catalogState !== 'undefined') {
      catalogState.catalog.avalon = catalog;
      models.forEach(name => { catalogState.models[normalizeModelKey(name)] = modelMeta(name); });
    }
  }

  function installRecommendation() {
    if (window.__avalonWrapped || typeof buildBrandRecommendation !== 'function') return;
    const original = buildBrandRecommendation;
    buildBrandRecommendation = function(input, brand) {
      if (brand !== 'avalon') return original(input, brand);
      const profile = deriveTargetProfile(input);
      const hit = groupFor(input);
      if (!hit) return emptyRecommendation(input, profile, 'Combinaison hors des cases documentees du tableau Avalon 2016.');

      const names = GROUPS[hit.group] || [];
      if (!names.length) {
        return emptyRecommendation(input, profile, `Groupe ${hit.group} present dans le tableau 2016 mais sans modele actuel documente dans l add-on.`);
      }

      const ranked = rankModels(names, input, profile).map(entry => ({ ...entry, advisedSpine:spineOf(entry.model) }));
      const top = ranked[0]?.meta || null;
      const point = estimatePointSetup(input, top?.pointRange || profile.pointRange, top);
      return {
        brand:'avalon', mode:'avalon-table', primary:hit.group,
        comparisonSpine:ranked[0]?.advisedSpine || null, softer:null, stiffer:null,
        load:input.drawWeight, confidence:'Moyenne',
        confidenceReasons:[`Groupe ${hit.group} du tableau Avalon 2016 (${hit.rowLabel}, ${hit.length}\").`,'Seuls les Tyro / Classic documentes dans l add-on sont proposes.'],
        models:ranked, alternativeModels:[], fallbackLabel:'',
        recommendedMaterial:top?.material || 'carbon', recommendedDiameter:top?.diameters?.[0] || 'standard',
        recommendedPointRange:top?.pointRange || profile.pointRange, recommendedPointWeight:point.recommended,
        recommendedPointChoices:point.pointChoices, recommendedPointProfile:point.profile,
        recommendedPointSofter:point.softerOption, recommendedPointStiffer:point.stifferOption,
        pointWeightNote:point.note, recommendedSeries:top?.seriesTier || 'club',
        recommendedMass:top?.massClass || 'medium', recommendedTolerance:top?.toleranceClass || 'standard',
        recommendedComponentSystem:top?.componentSystem || 'insert', recommendedUseCase:top?.useCase || 'club',
        recommendedDistanceBand:top?.distanceBand || 'mixed',
        notes:['Tableau Avalon historique utilise avec controle de la gamme actuelle.','Validation finale au tir recommandee.']
      };
    };
    window.__avalonWrapped = true;
  }

  function installComparisonGuard() {
    if (window.__avalonComparisonGuard || typeof renderComparisonBrandCard !== 'function') return;
    const original = renderComparisonBrandCard;
    renderComparisonBrandCard = function(entry, input) {
      if (entry?.brand === 'avalon' && !(entry.rec?.models || []).length) return '';
      return original(entry, input);
    };
    window.__avalonComparisonGuard = true;
  }

  function install() {
    try {
      installCatalog();
      installRecommendation();
      installComparisonGuard();
      integrateSources();
    } catch (error) {
      console.warn('Avalon non charge', error);
    }
  }

  setTimeout(install, 1200);
  setTimeout(install, 3000);
})();
