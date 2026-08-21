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
for (const script of ['app-config.js','app.js','app-enhancements.js','merchant-ui.js','arrow-builder.js','foc-measure.js','refactor-smoke.js']) assert(index.includes(script), `Script non charge: ${script}`);
for (const style of ['arrow-builder.css','ui-polish.css','foc-measure.css']) assert(index.includes(style), `Style non charge: ${style}`);
assert(index.includes('20260821-v61'), 'Cache-buster v61 absent du shell TEST');
assert(!index.includes('20260821-v60'), 'Ancien cache-buster v60 encore present dans le shell TEST');
assert(!index.includes('audit-fixes.js') && !index.includes('final-fixes.js'), 'Ancienne couche de correctifs rechargee');
assert(!fs.existsSync('test/audit-fixes.js') && !fs.existsSync('test/final-fixes.js'), 'Ancien fichier de correctifs encore present');

const config = read('test/app-config.js');
has(config, ["version: '2026.08.21-v61'", "channel: 'test'", 'manufacturerSourcesFirst: true', 'coachValidationRecommended: true', 'measuredDrawWeightPreferred: true'], 'Configuration TEST incomplete');

const enhancements = read('test/app-enhancements.js');
for (const feature of [
  'EASTON_REFERENCES','x10','a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm',
  'alignMerchants','explainModels','renderBarebowArcSetup','tillerRange','barebow-guidance.js',
  'ui-refactor.js','expert-audit.js','onboarding.js','merchantDealsForModels','merchantDealKey',
  'packageInfo','priceOpportunityIds','Bonne affaire','uniqueRecommendationModels','renderComparisonBrandCard','data-aa-brand','renderAllModelList'
]) assert(enhancements.toLowerCase().includes(feature.toLowerCase()), `Fonction integree manquante: ${feature}`);
assert(enhancements.includes('const discipline = input.discipline'), 'La discipline choisie ne survit plus a la normalisation');
assert(enhancements.includes("disciplineWrap.hidden = true"), 'La discipline interne redevient visible');
assert(enhancements.includes('encodeURIComponent(cfg.version'), 'Les modules dynamiques ne suivent plus la version centrale');
assert(!enhancements.includes('?v=refactor2'), 'Ancien cache-buster refactor2 encore present');
assert(!enhancements.includes('Voici des offres compatibles avec la marque'), 'Fallback marchand trop large encore present');
assert(enhancements.includes("best.price <= next.price * 0.95"), 'Seuil Bonne affaire modifie');
assert(enhancements.includes("entry.package.key === 'unknown'"), 'Conditionnement inconnu doit rester exclu des comparaisons');
assert(!enhancements.includes('uniqueRecommendationModels(entry.rec?.models || []).slice('), 'Plafond arbitraire rajoute sur les modeles');

const merchantUi = read('test/merchant-ui.js');
const uiPolish = read('test/ui-polish.css');
has(merchantUi, ['merchant-disclosure','Voir les offres marchands','merchant-disclosure-count','MutationObserver','version: \'v58\''], 'Sous-menu marchand v58 incomplet');
has(uiPolish, ['.arrow-model-select','background:var(--accent-2)!important','.merchant-disclosure-summary','.merchant-disclosure-body'], 'Finition visuelle v58 incomplete');
assert(!uiPolish.includes('background:transparent!important'), 'Le bouton tube ne doit pas redevenir transparent');

const focMeasure = read('test/foc-measure.js');
const focCss = read('test/foc-measure.css');
has(focMeasure, ['calculateMeasuredFoc','classifyMeasuredFoc','100 * (balance - length / 2) / length','data-foc-length','data-foc-balance','Calculer mon FOC reel','eastonarchery.com/faqs/','version: \'v59\''], 'Mesure FOC v59 incomplete');
has(focCss, ['.foc-measure-card','.foc-measure-grid','.foc-measure-result','.foc-measure-button'], 'Styles FOC v59 incomplets');
execFileSync(process.execPath, ['-e', "require('./test/foc-measure.js'); const m=globalThis.AssistantArcherFocMeasureMath; if(!m) process.exit(1); const foc=m.calculateMeasuredFoc(72,43.2); if(Math.abs(foc-10)>1e-9) process.exit(2); if(m.calculateMeasuredFoc(72,73)!==null) process.exit(3); if(m.classifyMeasuredFoc(12).key!=='coherent') process.exit(4);"], { stdio: 'pipe' });

const uiRefactor = read('test/ui-refactor.js');
has(uiRefactor, ['bindDisciplineToTheme','themeSelect','disciplineWrap',"discipline.value=theme.value==='cible'?'target':'field'",'#disciplineWrap{display:none!important}'], 'Liaison theme/discipline incomplete');

const refreshPrices = read('scripts/refresh-prices.mjs');
has(refreshPrices, ['looksLikeMissingProduct','Soft 404 / product missing page','availability','lastCheckedAt','response.status === 404 || response.status === 410'], 'Verification URLs marchands incomplete');

for (const module of [
  'test/barebow-guidance.js','test/ui-refactor.js','test/expert-audit.js','test/onboarding.js',
  'test/avalon-addon.js','test/merchant-ui.js','test/arrow-builder.js','test/foc-measure.js'
]) assert(fs.existsSync(module), `Module fonctionnel manquant: ${module}`);

for (const jsFile of [
  'test/app.js','test/app-enhancements.js','test/merchant-ui.js','test/arrow-builder.js','test/foc-measure.js','test/refactor-smoke.js','test/ui-refactor.js',
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
const jet6 = json('test/jet6-vanes.json');
const componentMasses = json('test/component-masses.json');
const balance = json('test/arrow-balance.json');

// Parcours de fabrication conserve : Tube -> Empennage -> Pointe -> Equilibre.
has(builder, [
  'data-arrow-part="shaft"','data-arrow-part="vane"','data-arrow-part="point"','data-arrow-part="balance"',
  'modelEntries','decorateModelChoices',"insertAdjacentElement('beforebegin', builder)",'state.part = \'vane\'',
  'state.part = \'point\'','state.part = \'balance\'','scheduleRefresh(120)','arrow-balance.json','jet6-vanes.json'
], 'Parcours de fabrication incomplet');
assert(builder.indexOf('data-arrow-part="shaft"') < builder.indexOf('data-arrow-part="vane"'), 'Empennage doit suivre le tube');
assert(builder.indexOf('data-arrow-part="vane"') < builder.indexOf('data-arrow-part="point"'), 'Pointe doit suivre l empennage');
assert(builder.indexOf('data-arrow-part="point"') < builder.indexOf('data-arrow-part="balance"'), 'Equilibre doit suivre la pointe');
assert(!builder.includes('state.tube = state.tubes[0]'), 'Le premier tube ne doit jamais etre selectionne automatiquement');
assert(!builder.includes('renderTubePanel'), 'Le tube ne doit pas etre duplique dans le panneau flottant');
assert(builder.includes("version: 'v58'"), 'Version interne arrow-builder historique modifiee sans changement du module');

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
assert(builder.includes('skylonarchery.com/images/components/42parallel.png'), 'Photo constructeur Skylon Parallel absente');
assert(builder.includes('skylonarchery.com/images/components/42bulge.png'), 'Photo constructeur Skylon Bulge absente');
assert(!builder.toLowerCase().includes('dutchbowstore') && !builder.toLowerCase().includes('arrowforge'), 'Une photo revendeur Skylon est encore chargee');
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

// Empennages : masses fabricant + estimation Jet6 issue de deux sources independantes.
assert(Array.isArray(components.vanes) && components.vanes.length >= 10, 'Catalogue de plumes sourcees insuffisant');
for (const vane of components.vanes) {
  assert(vane.id && vane.manufacturer && vane.model && vane.sourceUrl, 'Plume sans identite ou source fabricant');
  assert(/^https:\/\//.test(vane.sourceUrl), `URL fabricant invalide pour ${vane.id}`);
}
const vaneById = id => components.vanes.find(vane => vane.id === id);
assert(vaneById('bohning-air-2')?.weightGrains === 4.5, 'Masse Bohning Air 2 perdue');
assert(vaneById('bohning-x-vane-15')?.weightGrains === 3.3, 'Masse Bohning X Vane 1.5 perdue');
assert(vaneById('bohning-x-vane-175')?.weightGrains === 4.3, 'Masse Bohning X Vane 1.75 perdue');
assert(vaneById('bohning-x3-175')?.weight === '4,3 gr', 'Masse Bohning X3 1.75 perdue');
assert(vaneById('bohning-x3-225')?.weight === '5,8 gr', 'Masse Bohning X3 2.25 perdue');
assert(vaneById('bohning-x3-225')?.disciplines?.includes('cible') && vaneById('bohning-x3-225')?.disciplines?.includes('3d'), 'Disciplines Bohning X3 2.25 corrompues');
for (const gasProId of ['gaspro-olympic-efficient-175','gaspro-recurve-hp-175','gaspro-wind-efficient-2','gaspro-field-efficient-2','gaspro-indoor-efficient-4']) {
  assert(vaneById(gasProId)?.weight === null, `Masse Gas Pro non documentee ne doit pas etre inventee: ${gasProId}`);
}
assert(Array.isArray(jet6.vanes) && jet6.vanes.length === 1, 'Catalogue Jet6 attendu avec une reference S 1.75');
const jet6S = jet6.vanes.find(vane => vane.id === 'jet6-s-175');
assert(jet6S?.manufacturer === 'Jet6 Archery' && jet6S?.length === '1,75"', 'Jet6 S 1.75 mal renseignee');
assert(jet6S?.weightGrains === 0.9, 'Estimation Jet6 S 1.75 perdue');
assert(JSON.stringify(jet6S?.weightRangeGrains) === JSON.stringify([0.8,1.0]), 'Plage recoupee Jet6 perdue');
assert(jet6S?.weightSourceTier === 'reseller-consensus' && jet6S?.massDataFile === 'component-masses.json', 'Traceabilite masse Jet6 perdue');

// Masses non constructeur : recoupement quand possible, proxy explicite sinon.
assert(componentMasses.policy?.resellerConsensusAllowed === true, 'Politique de recoupement revendeur desactivee');
assert(componentMasses.policy?.minimumIndependentSources === 2, 'Deux sources independantes doivent rester requises pour un consensus');
assert(componentMasses.policy?.comparableComponentProxyAllowed === true, 'Les estimations proxy documentees doivent rester autorisees comme repere');
const rearMassById = id => componentMasses.rearComponents?.find(entry => entry.id === id);
const skylonNockMass = rearMassById('skylon-recurve-pin-nock');
const skylonPin42Mass = rearMassById('skylon-pin-id42');
const skylonPin32Proxy = rearMassById('skylon-pin-id32-proxy');
const vectorNock = rearMassById('easton-g-nock-vector');
assert(skylonNockMass?.estimatedGrains === 2.4, 'Estimation encoche Skylon Recurve perdue');
assert(JSON.stringify(skylonNockMass?.rangeGrains) === JSON.stringify([2.28,2.5]), 'Plage encoche Skylon perdue');
assert(skylonNockMass?.sources?.length >= 2, 'Encoche Skylon sans deux sources');
assert(skylonPin42Mass?.estimatedGrains === 10.8, 'Masse pin Skylon ID4.2 perdue');
assert(skylonPin42Mass?.sources?.length >= 2, 'Pin Skylon ID4.2 sans deux sources');
assert(skylonPin32Proxy?.estimatedGrains === 8, 'Proxy pin Skylon ID3.2 perdu');
assert(JSON.stringify(skylonPin32Proxy?.rangeGrains) === JSON.stringify([7,9]), 'Plage prudente pin Skylon ID3.2 perdue');
assert(skylonPin32Proxy?.sourceTier === 'comparable-component-proxy', 'Le pin ID3.2 doit rester identifie comme proxy');
assert(vectorNock?.estimatedGrains === 7 && vectorNock?.confidence === 'high', 'Masse G Nock Vector perdue');
const skylonRear42 = componentMasses.rearAssemblies?.find(entry => entry.id === 'skylon-id42-recurve-rear');
const skylonRear32 = componentMasses.rearAssemblies?.find(entry => entry.id === 'skylon-id32-recurve-rear-proxy');
const vectorRear = componentMasses.rearAssemblies?.find(entry => entry.id === 'easton-vector-g-nock-rear');
assert(skylonRear42?.estimatedGrains === 13.2, 'Ensemble arriere Skylon ID4.2 perdu');
assert(JSON.stringify(skylonRear42?.rangeGrains) === JSON.stringify([13.08,13.3]), 'Plage ensemble arriere Skylon ID4.2 perdue');
assert(skylonRear32?.estimatedGrains === 10.4, 'Ensemble arriere proxy Skylon ID3.2 perdu');
assert(JSON.stringify(skylonRear32?.rangeGrains) === JSON.stringify([9.28,11.5]), 'Plage ensemble arriere Skylon ID3.2 perdue');
assert(vectorRear?.estimatedGrains === 7, 'Ensemble arriere Vector perdu');

// Donnees d equilibre : chaque profil actuel possede maintenant une masse arriere exploitable.
assert(balance.method?.targetFoc === 12, 'Repere de classement FOC historique modifie');
assert(JSON.stringify(balance.method?.coherentFocRange) === JSON.stringify([10,15]), 'Plage FOC de depart modifiee');
assert(Array.isArray(balance.profiles) && balance.profiles.length >= 15, 'Profils de masse insuffisants');
const balanceById = id => balance.profiles.find(profile => profile.id === id);
for (const profile of balance.profiles) {
  assert(profile.id && profile.manufacturer && Array.isArray(profile.tubeKeys) && profile.tubeKeys.length, 'Profil equilibre incomplet');
  assert(profile.gpiBySpine && typeof profile.gpiBySpine === 'object', `Champ GPI absent: ${profile.id}`);
  assert(/^https:\/\//.test(profile.sourceUrl), `Source GPI invalide: ${profile.id}`);
  assert(Number.isFinite(Number(profile.rearAssembly?.weightGrains)), `Masse arriere absente: ${profile.id}`);
}
for (const id of [
  'easton-avance','easton-ace','easton-superdrive-micro','easton-vector','easton-x10',
  'easton-x10-parallel-pro-32','easton-x10-parallel-pro-4','skylon-brixxon','skylon-radius',
  'skylon-paragon','skylon-performa','skylon-precium','skylon-preminens','victory-vap','victory-vxt'
]) assert(balanceById(id), `Profil equilibre attendu absent: ${id}`);
for (const id of [
  'easton-avance','easton-ace','easton-superdrive-micro','easton-vector','easton-x10',
  'easton-x10-parallel-pro-32','easton-x10-parallel-pro-4','skylon-brixxon','skylon-radius',
  'skylon-paragon','skylon-performa','skylon-precium','skylon-preminens'
]) assert(Object.keys(balanceById(id)?.gpiBySpine || {}).length > 0, `GPI fabricant attendu absent: ${id}`);
assert(Object.keys(balanceById('victory-vap')?.gpiBySpine || {}).length === 0, 'VAP ne doit pas recevoir un GPI non verifie');
assert(Object.keys(balanceById('victory-vxt')?.gpiBySpine || {}).length === 0, 'VXT ne doit pas recevoir un GPI non verifie');
assert(balanceById('victory-vap')?.rearAssembly?.weightGrains === 8, 'Masse arriere VAP officielle perdue');
assert(balanceById('victory-vxt')?.rearAssembly?.weightGrains === 15, 'Masse arriere VXT officielle perdue');
assert(balance.profiles.some(profile => profile.manufacturer === 'Easton' && profile.rearAssembly?.weightGrains === 11), 'Ensemble arriere Easton documente absent');
assert(balanceById('easton-vector')?.rearAssembly?.weightGrains === 7, 'Vector doit utiliser le G Nock 7 gr comme repere arriere');
assert(balanceById('easton-vector')?.rearAssembly?.sourceTier === 'manufacturer-documented-component', 'Source arriere Vector mal classee');
for (const id of ['skylon-brixxon','skylon-radius']) {
  const rear = balanceById(id)?.rearAssembly;
  assert(rear?.weightGrains === 13.2, `${id}: ensemble arriere recoupe absent`);
  assert(JSON.stringify(rear?.weightRangeGrains) === JSON.stringify([13.08,13.3]), `${id}: plage arriere recoupee absente`);
  assert(rear?.sourceTier === 'reseller-consensus', `${id}: niveau de source arriere perdu`);
}
for (const id of ['skylon-paragon','skylon-performa','skylon-precium','skylon-preminens']) {
  const rear = balanceById(id)?.rearAssembly;
  assert(rear?.weightGrains === 10.4, `${id}: estimation arriere ID3.2 absente`);
  assert(JSON.stringify(rear?.weightRangeGrains) === JSON.stringify([9.28,11.5]), `${id}: plage arriere ID3.2 absente`);
  assert(rear?.sourceTier === 'proxy-estimate', `${id}: estimation ID3.2 ne doit pas etre presentee comme constructeur`);
}

has(builderCss, ['.arrow-builder-inline','.arrow-model-select','.arrow-builder-dialog','.arrow-vane-svg','.arrow-part-balance','.arrow-balance-summary','.arrow-balance-visual','max-height:84vh'], 'Styles configurateur historiques incomplets');

const expertAudit = read('test/expert-audit.js');
assert(expertAudit.includes('window.AssistantArcherConfig?.version'), 'Avalon ne suit plus la version centrale');
assert(!expertAudit.includes('avalon-addon.js?v=20260814'), 'Ancien cache-buster Avalon encore present');

const app = read('test/app.js');
for (const feature of [
  'spineHistory','archerNotebook','sightNotebook','renderDeals','computeArcSetup','eastonCarbonRecommendation',
  'eastonAluRecommendation','victoryRecurveRecommendation','victoryVxtRecommendation','carbonExpressRecommendation','feedbackDraft'
]) assert(app.includes(feature), `Fonction coeur manquante: ${feature}`);

console.log('Assistant Archer refactor: controles statiques, FOC mesure et masses arriere v61 OK');
