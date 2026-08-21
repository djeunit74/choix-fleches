import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const has = (text, values, label) => {
  for (const value of values) assert(text.includes(value), `${label}: ${value}`);
};

const index = read('test/index.html');
for (const id of [
  'spine-form','result','historyContent','clearHistoryBtn','arc-setup-form','arcSetupResult','bowStyle',
  'notebook-form','notebookResult','notebookStatus','notebookContent','sight-form','sightResult','sightStatus',
  'sightMarkers','feedbackToggleBtn','feedbackPanel','discipline','disciplineWrap','shaftMaterial','themeSelect'
]) assert(index.includes(`id="${id}"`), `DOM essentiel manquant: ${id}`);
for (const brand of ['skylon','easton','victory','carbon']) assert(index.includes(`value="${brand}"`), `Marque absente: ${brand}`);
for (const script of ['app-config.js','app.js','app-enhancements.js','arrow-builder.js','refactor-smoke.js']) assert(index.includes(script), `Script non charge: ${script}`);
assert(index.includes('arrow-builder.css'), 'Style du configurateur non charge');
assert(index.includes('20260821-v56'), 'Cache-buster v56 absent du shell TEST');
assert(!index.includes('20260821-v55'), 'Ancien cache-buster v55 encore present dans le shell TEST');
assert(!index.includes('audit-fixes.js') && !index.includes('final-fixes.js'), 'Ancienne couche de correctifs rechargee');
assert(!fs.existsSync('test/audit-fixes.js') && !fs.existsSync('test/final-fixes.js'), 'Ancien fichier de correctifs encore present');

const config = read('test/app-config.js');
has(config, ["version: '2026.08.21-v56'", "channel: 'test'", 'manufacturerSourcesFirst: true', 'coachValidationRecommended: true', 'measuredDrawWeightPreferred: true'], 'Configuration TEST incomplete');

const enhancements = read('test/app-enhancements.js');
for (const feature of [
  'EASTON_REFERENCES','x10','a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm',
  'alignMerchants','explainModels','renderBarebowArcSetup','tillerRange','barebow-guidance.js',
  'ui-refactor.js','expert-audit.js','onboarding.js','merchantDealsForModels','merchantDealKey',
  'packageInfo','priceOpportunityIds','Bonne affaire','uniqueRecommendationModels','renderComparisonBrandCard','data-aa-brand','renderAllModelList'
]) assert(enhancements.toLowerCase().includes(feature.toLowerCase()), `Fonction integree manquante: ${feature}`);
assert(enhancements.includes('const discipline = input.discipline'), 'La discipline choisie ne survit plus a la normalisation');
assert(enhancements.includes("disciplineWrap.hidden = true"), 'La discipline interne redevient visible');
assert(enhancements.includes('encodeURIComponent(cfg.version'), 'Les modules dynamiques ne suivent pas la version centrale');
assert(!enhancements.includes('?v=refactor2'), 'Ancien cache-buster refactor2 encore present');
assert(!enhancements.includes('Voici des offres compatibles avec la marque'), 'Fallback marchand trop large encore present');
assert(enhancements.includes("best.price <= next.price * 0.95"), 'Seuil Bonne affaire modifie');
assert(enhancements.includes("entry.package.key === 'unknown'"), 'Conditionnement inconnu doit rester exclu des comparaisons');
assert(!enhancements.includes('uniqueRecommendationModels(entry.rec?.models || []).slice('), 'Plafond arbitraire rajoute sur les modeles');

const uiRefactor = read('test/ui-refactor.js');
has(uiRefactor, ['bindDisciplineToTheme','themeSelect','disciplineWrap',"discipline.value=theme.value==='cible'?'target':'field'",'#disciplineWrap{display:none!important}'], 'Liaison theme/discipline incomplete');

const refreshPrices = read('scripts/refresh-prices.mjs');
has(refreshPrices, ['looksLikeMissingProduct','Soft 404 / product missing page','availability','lastCheckedAt','response.status === 404 || response.status === 410'], 'Verification URLs marchands incomplete');

for (const module of [
  'test/barebow-guidance.js','test/ui-refactor.js','test/expert-audit.js','test/onboarding.js',
  'test/avalon-addon.js','test/arrow-builder.js'
]) assert(fs.existsSync(module), `Module fonctionnel manquant: ${module}`);

for (const jsFile of [
  'test/app.js','test/app-enhancements.js','test/arrow-builder.js','test/refactor-smoke.js','test/ui-refactor.js',
  'test/onboarding.js','test/avalon-addon.js','test/expert-audit.js','test/barebow-guidance.js'
]) execFileSync(process.execPath, ['--check', jsFile], { stdio: 'pipe' });

json('test/catalog.json');
const dealsConfig = json('test/deals-config.json');
assert(dealsConfig.remoteJsonUrl === '../deals.json', 'TEST ne pointe plus vers la source marchands centrale');
assert(!fs.existsSync('test/deals.json'), 'Une seconde source marchands test/deals.json a ete recreee');
json('deals.json');

const builder = read('test/arrow-builder.js');
const builderCss = read('test/arrow-builder.css');
const components = json('test/arrow-components.json');
const balance = json('test/arrow-balance.json');

// Parcours de fabrication v56 : Tube -> Empennage -> Pointe -> Equilibre.
has(builder, [
  'data-arrow-part="shaft"','data-arrow-part="vane"','data-arrow-part="point"','data-arrow-part="balance"',
  'modelEntries','decorateModelChoices',"insertAdjacentElement('beforebegin', builder)",'state.part = \'vane\'',
  'state.part = \'point\'','state.part = \'balance\'','scheduleRefresh(120)','arrow-balance.json'
], 'Parcours de fabrication v56 incomplet');
assert(builder.indexOf('data-arrow-part="shaft"') < builder.indexOf('data-arrow-part="vane"'), 'Empennage doit suivre le tube');
assert(builder.indexOf('data-arrow-part="vane"') < builder.indexOf('data-arrow-part="point"'), 'Pointe doit suivre l empennage');
assert(builder.indexOf('data-arrow-part="point"') < builder.indexOf('data-arrow-part="balance"'), 'Equilibre doit suivre la pointe');
assert(!builder.includes('state.tube = state.tubes[0]'), 'Le premier tube ne doit jamais etre selectionne automatiquement');
assert(!builder.includes('renderTubePanel'), 'Le tube ne doit pas etre duplique dans le panneau flottant');

// Pointe : uniquement compatibilites fabricant, puis classement d equilibre si les masses existent.
has(builder, [
  'pointCatalogForTube','pointFit','pointCandidates','estimateBalance','balanceProfileForTube','renderPointPanel',
  'renderBalancePanel','Voir tous les poids compatibles','Taille compatible fabricant','n est pas un spine fabricant documente',
  "wanted === 'x10'","wanted === 'vap'"
], 'Moteur de pointe/equilibre incomplet');
assert(!builder.includes('dealsState') && !builder.includes('merchantDealsForModels'), 'Le configurateur technique depend des offres marchands');
assert(builder.includes('FOC non calcule'), 'Les donnees insuffisantes doivent interdire un faux FOC');
assert(builder.includes('Il ne remplace pas la mesure du point d equilibre reel'), 'La limite du FOC estime doit etre visible');
assert(builder.includes('POINT_MEDIA') && builder.includes('data-point-image'), 'Support photo des pointes absent');
assert(!builder.includes('🪶'), 'Ancien emoji plume encore utilise');

// Catalogue pointes et correction Avance issue du tableau specifique tube/spine.
assert(Array.isArray(components.points) && components.points.length >= 20, 'Catalogue de pointes fabricant insuffisant');
const pointBrands = new Set(components.points.map(point => point.manufacturer));
for (const brand of ['Easton','Skylon','Victory']) assert(pointBrands.has(brand), `Marque de pointes absente: ${brand}`);
for (const point of components.points) {
  assert(point.id && point.manufacturer && point.model && point.sourceUrl, 'Pointe sans identite ou source fabricant');
  assert(Array.isArray(point.tubeKeys) && point.tubeKeys.length, `Pointe sans liaison tube: ${point.id}`);
  assert(/^https:\/\//.test(point.sourceUrl), `URL fabricant invalide pour ${point.id}`);
  assert(point.sourceTier === 'manufacturer-current', `Source non courante/non fabricant pour ${point.id}`);
}
const avancePoint = components.points.find(point => point.id === 'easton-avance-4mm-ml');
assert(avancePoint, 'Pointe Avance absente');
for (const spine of ['1000','1150','1400','1600','1800','2000']) {
  assert(JSON.stringify(avancePoint.weightsBySpine?.[spine]) === JSON.stringify([60,70,80]), `Avance ${spine}: la plage doit etre 60/70/80 gr`);
}

// Empennages : les donnees de masse manquantes restent explicitement manquantes.
assert(Array.isArray(components.vanes) && components.vanes.length >= 5, 'Catalogue de plumes sourcees insuffisant');
for (const vane of components.vanes) {
  assert(vane.id && vane.manufacturer && vane.model && vane.sourceUrl, 'Plume sans identite ou source fabricant');
  assert(/^https:\/\//.test(vane.sourceUrl), `URL fabricant invalide pour ${vane.id}`);
}
const x3_175 = components.vanes.find(vane => vane.id === 'bohning-x3-175');
const x3_225 = components.vanes.find(vane => vane.id === 'bohning-x3-225');
assert(x3_175?.weight === '4,3 gr', 'Masse Bohning X3 1.75 perdue');
assert(x3_225?.weight === '5,8 gr', 'Masse Bohning X3 2.25 perdue');
assert(x3_225?.disciplines?.includes('cible') && x3_225?.disciplines?.includes('3d'), 'Disciplines Bohning X3 2.25 corrompues');

// Donnees d equilibre : profils separes et sources fabricant.
assert(balance.method?.targetFoc === 12, 'Repere de classement FOC v56 modifie');
assert(JSON.stringify(balance.method?.coherentFocRange) === JSON.stringify([10,15]), 'Plage FOC de depart modifiee');
assert(Array.isArray(balance.profiles) && balance.profiles.length >= 5, 'Profils de masse insuffisants');
for (const profile of balance.profiles) {
  assert(profile.id && profile.manufacturer && Array.isArray(profile.tubeKeys) && profile.tubeKeys.length, 'Profil equilibre incomplet');
  assert(profile.gpiBySpine && Object.keys(profile.gpiBySpine).length, `GPI absent: ${profile.id}`);
  assert(/^https:\/\//.test(profile.sourceUrl), `Source GPI invalide: ${profile.id}`);
}
assert(balance.profiles.some(profile => profile.manufacturer === 'Easton' && profile.rearAssembly?.weightGrains === 11), 'Ensemble arriere Easton documente absent');
assert(balance.profiles.some(profile => profile.manufacturer === 'Skylon' && profile.rearAssembly === null), 'Une masse arriere Skylon non documentee ne doit pas etre inventee');

has(builderCss, ['.arrow-builder-inline','.arrow-model-select','.arrow-builder-dialog','.arrow-vane-svg','.arrow-part-balance','.arrow-balance-summary','.arrow-balance-visual','max-height:84vh'], 'Styles configurateur v56 incomplets');

const expertAudit = read('test/expert-audit.js');
assert(expertAudit.includes('window.AssistantArcherConfig?.version'), 'Avalon ne suit plus la version centrale');
assert(!expertAudit.includes('avalon-addon.js?v=20260814'), 'Ancien cache-buster Avalon encore present');

const app = read('test/app.js');
for (const feature of [
  'spineHistory','archerNotebook','sightNotebook','renderDeals','computeArcSetup','eastonCarbonRecommendation',
  'eastonAluRecommendation','victoryRecurveRecommendation','victoryVxtRecommendation','carbonExpressRecommendation','feedbackDraft'
]) assert(app.includes(feature), `Fonction coeur manquante: ${feature}`);

console.log('Assistant Archer refactor: controles statiques v56 OK');
