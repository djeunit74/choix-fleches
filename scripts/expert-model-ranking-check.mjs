import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const ranking = read('test/expert-model-ranking.js');
const config = read('test/app-config.js');
const extra = json('test/manufacturer-reference-v13.json');

assert(ranking.includes("const VERSION='Pré-alpha v30'"), 'Version classement expert v30 absente');
assert(config.includes('expert-model-ranking.js?v=20260823-prealpha-v30'), 'Boot classement expert v30 absent');
assert(ranking.includes('Progression / simplicité'), 'Sélecteur progression absent');
assert(ranking.includes('Performance / compétition'), 'Sélecteur performance/compétition absent');
assert(ranking.includes('Performance maximale / tuning expert'), 'Sélecteur tuning expert absent');
assert(ranking.includes('PROGRESSION_OUTDOOR'), 'Shortlist progression extérieur absente');
assert(ranking.includes('PROGRESSION_INDOOR'), 'Shortlist progression salle absente');
assert(ranking.includes("easton:new Set(['vector','avance'])"), 'Easton progression doit rester resserrée');
assert(ranking.includes("victory:new Set(['vap'])"), 'Victory progression doit privilégier VAP');
assert(ranking.includes("skylon:new Set(['radius','brixxon','performa'])"), 'Skylon progression extérieur inattendue');
assert(ranking.includes("ranked.slice(0,Math.min(3,ranked.length))"), 'Garde-fou maximum 3 candidats progression absent');
assert(ranking.includes('Le spine reste celui du fabricant'), 'Séparation spine/classement non expliquée');
assert(ranking.includes('Interprétation app'), 'Rationale interprétative absente');
assert(ranking.includes("rec.brand==='skylon'&&key==='edge'&&c.bowType==='recurve'"), 'Edge doit être exclue du recurve');
assert(ranking.includes("'x10 parallel pro 3.2 mm'"), 'X10 Parallel Pro 3.2 absent du classement');
assert(ranking.includes("'x10 parallel pro 4 mm'"), 'X10 Parallel Pro 4 mm absent du classement');
assert(ranking.includes("if(key==='vxt')"), 'VXT absent du classement Victory');
assert(ranking.includes("if(key==='vap')"), 'VAP absent du classement Victory');
assert(!ranking.toLowerCase().includes('carbon express'), 'Carbon Express ne doit pas revenir');

for (const model of ['a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x7','x23','rx7','xx75 platinum plus','vap','vxt','precium','edge','bruxx','empros']) {
  assert(extra.models?.[model], `Référence fabricant v13 absente: ${model}`);
}
assert(extra.models['x10 parallel pro 3.2 mm'].straightnessIn === 0.001, 'Tolérance X10 3.2 perdue');
assert(extra.models.vxt.cuttingRule, 'Règle de coupe VXT absente');
assert(extra.policy?.carbonExpressEnabled === false, 'Carbon Express doit rester désactivé');

console.log('Assistant Archer: classement expert Pré-alpha v30 contrôlé');
