import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const base = json('test/manufacturer-reference.json');
const extra = json('test/manufacturer-reference-v13.json');
const integration = read('test/manufacturer-reference.js');

assert(base.policy?.manufacturerFirst === true, 'Priorite fabricant desactivee dans la base');
assert(extra.version === '2026-08-22-prealpha-v13', 'Version reference v13 inattendue');
assert(extra.policy?.manufacturerFirst === true, 'Priorite fabricant v13 desactivee');
assert(extra.policy?.unknownDataMustRemainUnknown === true, 'Une donnee inconnue ne doit jamais etre inventee');
assert(extra.policy?.carbonExpressEnabled === false, 'Carbon Express doit rester retire du perimetre TEST');

for (const source of [
  'eastonAce','eastonParallel4','eastonParallel32','eastonX7','eastonX23','eastonRx7','eastonXx75',
  'victoryVap','victoryVxt','skylonPrecium','skylonEdge','skylonBruxx','skylonEmpros'
]) assert(/^https:\/\//.test(extra.sources?.[source] || ''), `Source fabricant v13 absente: ${source}`);

for (const model of ['a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x7','x23','rx7','xx75 platinum plus','vap','vxt','precium','edge','bruxx','empros']) {
  assert(extra.models?.[model], `Modele v13 absent: ${model}`);
}

const ace = extra.models['a/c/e'];
for (const spine of ['370','400','430','470','520','570','620','670','720','780','850','920','1000','1100','1250']) assert(ace.spines?.[spine], `ACE spine absent ${spine}`);
assert(ace.straightnessIn === 0.0015 && ace.weightToleranceGr === 0.5, 'Tolerance ACE corrompue');
assert(ace.spines['720'].gpi === 6.4 && ace.spines['720'].maxTrimIn === 6, 'ACE 720 corrompu');

const pp4 = extra.models['x10 parallel pro 4 mm'];
for (const spine of ['250','300','340','380','420','470','520','570','610','660','710','810','880','1000','1150']) assert(pp4.spines?.[spine], `Parallel Pro 4mm spine absent ${spine}`);
assert(pp4.spines['660'].gpi === 6.9 && pp4.spines['810'].odIn === 0.209, 'Parallel Pro 4mm donnees corrompues');

const pp32 = extra.models['x10 parallel pro 3.2 mm'];
for (const spine of ['340','380','420','460','500','550','600','650','700','750','800','900','1000']) assert(pp32.spines?.[spine], `Parallel Pro 3.2 spine absent ${spine}`);
assert(pp32.spines['700'].gpi === 6.8 && pp32.spines['1000'].odIn === 0.177, 'Parallel Pro 3.2 donnees corrompues');

const x7 = extra.models.x7;
assert(x7.straightnessIn === 0.001 && x7.weightTolerancePercent === 0.75, 'Tolerance X7 corrompue');
for (const size of ['1514','1614','1714','1814','1914','2014','2114','2213','2214','2413','2512','2613']) assert(x7.spines?.[size], `X7 taille absente ${size}`);

const x23 = extra.models.x23;
for (const size of ['2312','2314','2315','2318']) assert(x23.spines?.[size], `X23 taille absente ${size}`);
assert(x23.spines['2315'].gpi === 11.8 && x23.spines['2315'].odIn === 0.365, 'X23 2315 corrompu');

const rx7 = extra.models.rx7;
for (const size of ['23-420','22-475','21-525']) assert(rx7.spines?.[size], `RX7 taille absente ${size}`);
assert(rx7.profile.includes('rear taper') && rx7.spines['23-420'].gpi === 10.4, 'RX7 profil/donnees corrompus');

const xx75 = extra.models['xx75 platinum plus'];
assert(xx75.straightnessIn === 0.002 && xx75.weightTolerancePercent === 1, 'Tolerance XX75 corrompue');
for (const size of ['1416','1516','1616','1716','1816','1913','1916','2013','2016','2114','2213']) assert(xx75.spines?.[size], `XX75 taille absente ${size}`);

for (const family of ['vap','vxt']) {
  const v = extra.models[family];
  assert(v.grades?.V1 === 0.001 && v.grades?.V3 === 0.003 && v.grades?.V6 === 0.006, `${family}: grades Victory corrompus`);
  assert(v.weightMatchingGr === 0.5 && v.innerDiameterIn === 0.166, `${family}: donnees Victory corrompues`);
}
assert(!extra.models.vap.spines && !extra.models.vxt.spines, 'Aucun GPI/spine Victory non source ne doit etre invente');
assert(extra.models.vxt.frontParallelIn === 9 && extra.models.vxt.maxFrontCutIn === 8, 'Regle de coupe VXT corrompue');

for (const model of ['precium','edge','bruxx','empros']) {
  const spec = extra.models[model];
  assert(spec.brand === 'Skylon', `${model}: fabricant incorrect`);
  assert(Object.keys(spec.spines || {}).length > 0, `${model}: tableau spine vide`);
  for (const row of Object.values(spec.spines)) assert(Number.isFinite(row.gpi) && Number.isFinite(row.lengthIn), `${model}: GPI/longueur absents`);
}
assert(extra.models.precium.spines['700'].gpi === 5.55 && extra.models.precium.spines['700'].pointGr.includes(100), 'Precium 700 corrompu');
assert(extra.models.edge.spines['800'].gpi === 4.2, 'Edge 800 corrompu');
assert(extra.models.bruxx.straightnessIn === 0.0015, 'Bruxx rectitude corrompue');
assert(extra.models.empros.spines['300'].gpi === 9.5, 'Empros 300 corrompu');

for (const required of [
  "VERSION = 'Pré-alpha v13'", 'manufacturer-reference-v13.json', 'chooseEastonAluSize', 'refineEaston', 'refineSkylon', 'refineVictory',
  'removeCarbonExpress', 'manufacturerVerified', 'Donnée fabricant', "option[value=\"carbon\"]"
]) assert(integration.includes(required), `Integration fabricant v13 incomplete: ${required}`);
assert(!integration.includes('patchCarbonExpressSeries'), 'Ancienne integration Carbon Express encore active');

console.log('Assistant Archer: references fabricant Pré-alpha v13 controlees OK');
