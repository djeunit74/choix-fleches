import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const data = json('test/manufacturer-reference.json');
const integration = read('test/manufacturer-reference.js');
const expertAudit = read('test/expert-audit.js');

assert(data.version === '2026-08-22-prealpha-v12', 'Version reference fabricant inattendue');
assert(data.policy?.manufacturerFirst === true, 'Priorite fabricant desactivee');
assert(data.policy?.merchantDataMayAffectTechnicalRecommendation === false, 'Les prix marchands ne doivent jamais influencer la technique');
assert(data.policy?.unknownDataMustRemainUnknown === true, 'Une donnee inconnue ne doit jamais etre inventee');

for (const source of [
  'easton2026','eastonAvance','eastonX10','eastonVector','eastonSuperdriveMicro',
  'victoryGuide','victoryVap','victoryVxt',
  'skylonBrixxon','skylonRadius','skylonPerforma','skylonParagon','skylonPreminens',
  'carbonExpressRecurve'
]) assert(/^https:\/\//.test(data.sources?.[source] || ''), `Source fabricant absente: ${source}`);

for (const model of ['avance','superdrive micro','vector','x10','vap','vxt','brixxon','radius','performa','paragon','preminens']) {
  assert(data.models?.[model], `Modele fabricant absent: ${model}`);
}

const avance = data.models.avance;
for (const spine of ['340','400','450','500','550','600','660','730','810','900','1000','1150','1400','1600','1800','2000']) {
  assert(avance.spines?.[spine], `Avance: spine fabricant absent ${spine}`);
}
assert(avance.spines['660'].gpi === 6.2, 'Avance 660 GPI corrompu');
assert(JSON.stringify(avance.spines['730'].pointGr) === JSON.stringify([70,80,90]), 'Avance 730 pointes fabricant corrompues');

const x10 = data.models.x10;
for (const spine of ['325','350','380','410','450','500','550','600','650','700','750','830','900','1000']) {
  assert(x10.spines?.[spine], `X10: spine fabricant absent ${spine}`);
}
assert(x10.straightnessIn === 0.001 && x10.weightToleranceGr === 0.5, 'Tolerance X10 corrompue');

const superdrive = data.models['superdrive micro'];
for (const spine of ['325','375','425','475','525','575','625','675','750','850','950']) {
  assert(superdrive.spines?.[spine], `SuperDrive Micro: spine fabricant absent ${spine}`);
}

const vector = data.models.vector;
for (const spine of ['600','800','1000','1200','1400','1600','1800','2000']) {
  assert(vector.spines?.[spine], `Vector: spine fabricant absent ${spine}`);
}

assert(!data.models.vap.spines && !data.models.vxt.spines, 'Victory GPI/spines ne doivent pas etre inventes sans tableau fabricant valide');
assert(data.models.vap.grades?.V1 === 0.001 && data.models.vap.grades?.V3 === 0.003 && data.models.vap.grades?.V6 === 0.006, 'Grades Victory VAP corrompus');
assert(data.models.vxt.grades?.V1 === 0.001 && data.models.vxt.grades?.V3 === 0.003 && data.models.vxt.grades?.V6 === 0.006, 'Grades Victory VXT corrompus');

for (const model of ['brixxon','radius','performa','paragon','preminens']) {
  const spec = data.models[model];
  assert(spec.brand === 'Skylon', `${model}: fabricant incorrect`);
  assert(Object.keys(spec.spines || {}).length > 0, `${model}: tableau spine vide`);
  for (const [spine, row] of Object.entries(spec.spines)) {
    assert(Number.isFinite(Number(spine)), `${model}: spine invalide ${spine}`);
    assert(Number.isFinite(row.gpi) && Number.isFinite(row.lengthIn), `${model} ${spine}: GPI/longueur absents`);
    assert(Array.isArray(row.pointGr) && row.pointGr.length, `${model} ${spine}: pointes fabricant absentes`);
  }
}

const cx = data.carbonExpressRecurveSeries;
assert(cx?.lengthsIn?.length === 10 && cx?.rows?.length === 9, 'Tableau Carbon Express Recurve Series incomplet');
const cxText = JSON.stringify(cx);
assert(!cxText.includes('NPX7500'), 'Erreur de transcription NPX7500 encore presente');
assert(!cxText.includes('NST420'), 'Erreur de transcription NST420 encore presente');
assert(cxText.includes('NSST450'), 'Correction NSST450 absente');

for (const required of [
  'chooseEastonSpineForModel','refineEaston','refineSkylon','refineVictory','patchCarbonExpressSeries',
  'manufacturerVerified','Donnée fabricant','unknownDataMustRemainUnknown'
]) assert(integration.includes(required), `Integration fabricant incomplete: ${required}`);
assert(integration.includes("s.src='manufacturer-reference.js") === false, 'Le module fabricant ne doit pas se charger lui-meme');
assert(expertAudit.includes("manufacturer-reference.js?v=20260822-prealpha-v12"), 'Le module fabricant v12 n est pas charge par expert-audit');

console.log('Assistant Archer: references fabricant Pré-alpha v12 controlees OK');
