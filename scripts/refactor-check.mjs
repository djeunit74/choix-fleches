import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const index = read('test/index.html');
const requiredIds = [
  'spine-form','result','historyContent','clearHistoryBtn',
  'arc-setup-form','arcSetupResult','bowStyle',
  'notebook-form','notebookResult','notebookStatus','notebookContent',
  'sight-form','sightResult','sightStatus','sightMarkers',
  'feedbackToggleBtn','feedbackPanel'
];
for (const id of requiredIds) assert(index.includes(`id="${id}"`), `DOM essentiel manquant: ${id}`);

for (const brand of ['skylon','easton','victory','carbon']) assert(index.includes(`value="${brand}"`), `Marque absente: ${brand}`);
for (const script of ['app-config.js','app.js','app-enhancements.js','refactor-smoke.js']) assert(index.includes(script), `Script non charge: ${script}`);
assert(!index.includes('audit-fixes.js'), 'Ancienne couche audit-fixes.js encore chargee');
assert(!index.includes('final-fixes.js'), 'Ancienne couche final-fixes.js encore chargee');

const config = read('test/app-config.js');
assert(config.includes("channel: 'test'"), 'Canal TEST absent de la configuration centrale');
assert(config.includes('manufacturerSourcesFirst: true'), 'Principe sources fabricant absent');
assert(config.includes('coachValidationRecommended: true'), 'Validation coach absente');
assert(config.includes('measuredDrawWeightPreferred: true'), 'Puissance mesuree non prioritaire');

const enhancements = read('test/app-enhancements.js');
for (const feature of ['EASTON_REFERENCES','x10','a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','alignMerchants','explainModels','barebow-guidance.js','ui-refactor.js','expert-audit.js','onboarding.js']) {
  assert(enhancements.toLowerCase().includes(feature.toLowerCase()), `Fonction integree manquante: ${feature}`);
}

for (const module of ['test/barebow-guidance.js','test/ui-refactor.js','test/expert-audit.js','test/onboarding.js','test/avalon-addon.js']) assert(fs.existsSync(module), `Module fonctionnel manquant: ${module}`);

for (const json of ['test/catalog.json','test/deals.json','test/deals-config.json']) JSON.parse(read(json));

const app = read('test/app.js');
for (const feature of ['spineHistory','archerNotebook','sightNotebook','renderDeals','computeArcSetup','eastonCarbonRecommendation','victoryRecurveRecommendation','carbonExpressRecommendation']) assert(app.includes(feature), `Fonction coeur manquante: ${feature}`);

console.log('Assistant Archer refactor: controles statiques OK');
