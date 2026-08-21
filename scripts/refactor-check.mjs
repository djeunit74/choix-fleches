import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const index = read('test/index.html');
const requiredIds = [
  'spine-form','result','historyContent','clearHistoryBtn',
  'arc-setup-form','arcSetupResult','bowStyle',
  'notebook-form','notebookResult','notebookStatus','notebookContent',
  'sight-form','sightResult','sightStatus','sightMarkers',
  'feedbackToggleBtn','feedbackPanel','discipline','disciplineWrap','shaftMaterial','themeSelect'
];
for (const id of requiredIds) assert(index.includes(`id="${id}"`), `DOM essentiel manquant: ${id}`);
for (const brand of ['skylon','easton','victory','carbon']) assert(index.includes(`value="${brand}"`), `Marque absente: ${brand}`);
for (const script of ['app-config.js','app.js','app-enhancements.js','arrow-builder.js','refactor-smoke.js']) assert(index.includes(script), `Script non charge: ${script}`);
assert(index.includes('arrow-builder.css'), 'Style du configurateur non charge');
assert(!index.includes('audit-fixes.js'), 'Ancienne couche audit-fixes.js encore chargee');
assert(!index.includes('final-fixes.js'), 'Ancienne couche final-fixes.js encore chargee');
assert(!fs.existsSync('test/audit-fixes.js'), 'Ancien fichier audit-fixes.js encore present');
assert(!fs.existsSync('test/final-fixes.js'), 'Ancien fichier final-fixes.js encore present');
assert(index.includes('Version : chargement...'), 'La version est de nouveau codee en dur dans index.html');
for (const theme of ['value="cible"','value="campagne"','value="3d"']) assert(index.includes(theme), `Theme discipline absent: ${theme}`);
assert(index.includes('Peu importe / conseille-moi'), 'Choix materiau debutant absent');
assert(index.includes('20260821-v55'), 'Cache-buster v55 absent du shell TEST');
assert(!index.includes('20260821-v54'), 'Ancien cache-buster v54 encore present dans le shell TEST');

const config = read('test/app-config.js');
assert(config.includes("version: '2026.08.21-v55'"), 'Version TEST v55 absente de la configuration centrale');
assert(config.includes("channel: 'test'"), 'Canal TEST absent de la configuration centrale');
assert(config.includes('manufacturerSourcesFirst: true'), 'Principe sources fabricant absent');
assert(config.includes('coachValidationRecommended: true'), 'Validation coach absente');
assert(config.includes('measuredDrawWeightPreferred: true'), 'Puissance mesuree non prioritaire');

const enhancements = read('test/app-enhancements.js');
for (const feature of [
  'EASTON_REFERENCES','x10','a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm',
  'alignMerchants','explainModels','renderBarebowArcSetup','tillerRange',
  'barebow-guidance.js','ui-refactor.js','expert-audit.js','onboarding.js'
]) assert(enhancements.toLowerCase().includes(feature.toLowerCase()), `Fonction integree manquante: ${feature}`);
assert(enhancements.includes('const discipline = input.discipline'), 'La discipline choisie doit survivre a la normalisation');
assert(enhancements.includes("disciplineWrap.hidden = true"), 'La discipline ne doit pas redevenir visible dans le formulaire fleches');
assert(enhancements.includes("Peu importe / conseille-moi"), 'Libelle materiau debutant absent de la couche integration');
assert(enhancements.includes('aluminium/carbone'), 'Information tubes aluminium/carbone absente');
assert(enhancements.includes('encodeURIComponent(cfg.version'), 'Les modules dynamiques ne suivent pas la version centrale');
assert(!enhancements.includes('?v=refactor2'), 'Ancien cache-buster refactor2 encore present dans la couche integration');

const uiRefactor = read('test/ui-refactor.js');
for (const feature of ['bindDisciplineToTheme','themeSelect','disciplineWrap','discipline.value=theme.value===\'cible\'?\'target\':\'field\'','#disciplineWrap{display:none!important}']) {
  assert(uiRefactor.includes(feature), `Liaison theme/discipline manquante: ${feature}`);
}

// Offres marchands : uniquement les modeles techniques, sans fallback vague.
for (const feature of ['merchantDealsForModels','merchantDealKey','packageInfo','priceOpportunityIds','Bonne affaire']) {
  assert(enhancements.includes(feature), `Controle marchand manquant: ${feature}`);
}
assert(!enhancements.includes('Voici des offres compatibles avec la marque'), 'Fallback marchand trop large encore present');
assert(enhancements.includes("best.price <= next.price * 0.95"), 'Seuil Bonne affaire absent ou modifie');
assert(enhancements.includes("entry.package.key === 'unknown'"), 'Conditionnement inconnu doit etre exclu des comparaisons de prix');

// Multi-marques : pas de plafond arbitraire et chaque carte conserve sa marque.
for (const feature of ['uniqueRecommendationModels','renderComparisonBrandCard','data-aa-brand','renderAllModelList']) {
  assert(enhancements.includes(feature), `Generalisation multi-marques manquante: ${feature}`);
}
assert(!enhancements.includes('uniqueRecommendationModels(entry.rec?.models || []).slice('), 'Un plafond a ete rajoute sur les modeles multi-marques');

// Une bonne affaire doit etre basee sur une page marchande verifiee recemment.
for (const feature of ['dealVerificationFresh','availability','lastCheckedAt']) {
  assert(enhancements.includes(feature), `Controle de disponibilite marchand manquant: ${feature}`);
}
assert(enhancements.includes("deal.availability === 'unavailable'"), 'Les offres indisponibles ne sont pas filtrees');

const refreshPrices = read('scripts/refresh-prices.mjs');
for (const feature of ['looksLikeMissingProduct','Soft 404 / product missing page','availability','lastCheckedAt']) {
  assert(refreshPrices.includes(feature), `Verification quotidienne des URLs manquante: ${feature}`);
}
assert(refreshPrices.includes('response.status === 404 || response.status === 410'), 'Les HTTP 404/410 ne sont pas traites');

for (const module of ['test/barebow-guidance.js','test/ui-refactor.js','test/expert-audit.js','test/onboarding.js','test/avalon-addon.js','test/arrow-builder.js']) assert(fs.existsSync(module), `Module fonctionnel manquant: ${module}`);
JSON.parse(read('test/catalog.json'));
const dealsConfig = JSON.parse(read('test/deals-config.json'));
assert(dealsConfig.remoteJsonUrl === '../deals.json', 'TEST ne pointe pas vers la source marchands centrale');
assert(!fs.existsSync('test/deals.json'), 'Une copie test/deals.json recreerait une seconde source marchands');
JSON.parse(read('deals.json'));

// Configurateur : bloc persistant hors de #result, tube valide dans les modeles puis Pointe -> Empennage.
const builder = read('test/arrow-builder.js');
const builderCss = read('test/arrow-builder.css');
const components = JSON.parse(read('test/arrow-components.json'));
for (const feature of ['data-arrow-part="point"','data-arrow-part="shaft"','data-arrow-part="vane"','collectTubes','pointRange','vaneScore','arrow-components.json']) {
  assert(builder.includes(feature), `Configurateur incomplet: ${feature}`);
}
for (const feature of ['modelEntries','decorateModelChoices','Selectionner ce tube',"insertAdjacentElement('beforebegin', builder)",'pointReviewed','data-continue-vane','state.part = \'vane\'','scheduleRefresh(120)']) {
  assert(builder.includes(feature), `Parcours de fabrication incomplet: ${feature}`);
}
for (const feature of ['arrowBuilderDialog','showModal','arrow-builder-sheet','showAllVanes','ranked.slice(0, 3)','vaneGraphic']) {
  assert(builder.includes(feature), `Panneau compact incomplet: ${feature}`);
}

// Pointes : catalogue fabricant distinct, filtre tube + spine, poids et taille compatible documentes.
for (const feature of ['state.points','loadComponents','pointCatalogForTube','pointFit','renderPointCard','sourceLabel','fitmentBySpine','recommendedWeightsByTubeSpine']) {
  assert(builder.includes(feature), `Catalogue pointes non branche: ${feature}`);
}
assert(builder.includes("wanted === 'x10'"), 'X10 doit etre un alias exact pour ne pas capturer Parallel Pro');
assert(builder.includes("wanted === 'vap'"), 'VAP generique doit etre un alias exact pour ne pas capturer Gamer/Target par erreur');
assert(builder.includes('n est pas un spine fabricant documente'), 'Un spine non documente doit etre signale et non devine');
assert(builder.includes('Taille compatible fabricant'), 'Le terme fitment doit etre traduit dans l interface');
assert(builder.includes('POINT_MEDIA'), 'Le support media des pointes est absent');
assert(builder.includes('data-point-image'), 'La gestion des photos de pointes est absente');
assert(builderCss.includes('.arrow-point-media'), 'Style des photos de pointes absent');
assert(!builder.includes('state.tube = state.tubes[0]'), 'Le premier tube ne doit pas etre selectionne automatiquement');
assert(!builder.includes('renderTubePanel'), 'Le choix du tube ne doit pas etre duplique dans le panneau flottant');
assert(builder.includes('Voir tous les modeles'), 'Le panneau empennage doit proposer Voir tous les modeles');
assert(!builder.includes('🪶'), 'L ancien emoji plume ne doit plus etre utilise');
assert(builder.includes('On n invente pas de pointe compatible'), 'Une pointe non documentee ne doit pas etre inventee');
assert(!builder.includes('dealsState'), 'Le configurateur technique ne doit pas dependre des offres marchands');
assert(!builder.includes('merchantDealsForModels'), 'Le configurateur technique ne doit pas appeler le moteur marchand');
assert(builderCss.includes('.arrow-builder-inline'), 'Style du bloc Ma fleche absent');
assert(builderCss.includes('.arrow-model-select'), 'Style du bouton Selectionner ce tube absent');
assert(builderCss.includes('.arrow-builder-dialog'), 'Style du panneau flottant absent');
assert(builderCss.includes('.arrow-vane-svg'), 'Silhouette d empennage absente');
assert(builderCss.includes('max-height:84vh'), 'Le panneau mobile doit limiter sa hauteur');

assert(Array.isArray(components.points) && components.points.length >= 20, 'Catalogue de pointes fabricant insuffisant');
const pointBrands = new Set(components.points.map(point => point.manufacturer));
for (const brand of ['Easton','Skylon','Victory']) assert(pointBrands.has(brand), `Marque de pointes absente: ${brand}`);
for (const point of components.points) {
  assert(point.id && point.manufacturer && point.model && point.sourceUrl, 'Pointe sans identite ou source fabricant');
  assert(Array.isArray(point.tubeKeys) && point.tubeKeys.length, `Pointe sans liaison tube: ${point.id}`);
  assert(/^https:\/\//.test(point.sourceUrl), `URL fabricant invalide pour ${point.id}`);
  assert(point.sourceTier === 'manufacturer-current', `Source non courante/non fabricant pour ${point.id}`);
}

assert(Array.isArray(components.vanes) && components.vanes.length >= 5, 'Catalogue de plumes sourcees insuffisant');
for (const vane of components.vanes) {
  assert(vane.id && vane.manufacturer && vane.model && vane.sourceUrl, 'Plume sans identite ou source fabricant');
  assert(/^https:\/\//.test(vane.sourceUrl), `URL fabricant invalide pour ${vane.id}`);
}

const expertAudit = read('test/expert-audit.js');
assert(expertAudit.includes('window.AssistantArcherConfig?.version'), 'Avalon ne suit pas la version centrale');
assert(!expertAudit.includes('avalon-addon.js?v=20260814'), 'Ancien cache-buster Avalon encore present');

const app = read('test/app.js');
for (const feature of [
  'spineHistory','archerNotebook','sightNotebook','renderDeals','computeArcSetup',
  'eastonCarbonRecommendation','eastonAluRecommendation','victoryRecurveRecommendation',
  'victoryVxtRecommendation','carbonExpressRecommendation','feedbackDraft'
]) assert(app.includes(feature), `Fonction coeur manquante: ${feature}`);

console.log('Assistant Archer refactor: controles statiques OK');
