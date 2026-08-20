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
assert(index.includes('20260820-v50'), 'Cache-buster v50 absent du shell TEST');

const config = read('test/app-config.js');
assert(config.includes("version: '2026.08.20-v50'"), 'Version TEST v50 absente de la configuration centrale');
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

// Configurateur de fleche : il compose les composants apres le calcul sans remplacer le moteur de spine.
const builder = read('test/arrow-builder.js');
const components = JSON.parse(read('test/arrow-components.json'));
for (const feature of ['data-arrow-part="point"','data-arrow-part="shaft"','data-arrow-part="vane"','collectTubes','pointChoices','pointRange','vaneScore','arrow-components.json']) {
  assert(builder.includes(feature), `Configurateur incomplet: ${feature}`);
}
assert(builder.includes('Reference exacte pas encore documentee'), 'Le configurateur doit signaler une pointe non documentee au lieu de l inventer');
assert(builder.includes('poids commerciaux et references compatibles ne sont pas encore relies'), 'Une simple plage de pointe ne doit pas devenir des poids commerciaux inventes');
assert(!builder.includes('dealsState'), 'Le configurateur technique ne doit pas dependre des offres marchands');
assert(!builder.includes('merchantDealsForModels'), 'Le configurateur technique ne doit pas appeler le moteur marchand');
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
