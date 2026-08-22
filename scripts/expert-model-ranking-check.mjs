import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const ranking = read('test/expert-model-ranking.js');
const config = read('test/app-config.js');
const extra = json('test/manufacturer-reference-v13.json');

assert(ranking.includes("const VERSION = 'Pré-alpha v14'"), 'Version classement expert v14 absente');
assert(config.includes('expert-model-ranking.js?v=20260822-prealpha-v14'), 'Boot classement expert v14 absent');
assert(ranking.includes("id=\"expertObjective\""), 'Sélecteur objectif expert absent');
assert(ranking.includes('Ce choix ne change pas le spine fabricant'), 'Séparation spine/classement non expliquée');
assert(ranking.includes('Interprétation app'), 'Rationale interprétative absente');
assert(ranking.includes("key==='edge' && ctx.bowType==='recurve'"), 'Edge doit être exclue du recurve');
assert(ranking.includes("'x10 parallel pro 3.2 mm'"), 'X10 Parallel Pro 3.2 absent du classement');
assert(ranking.includes("'x10 parallel pro 4 mm'"), 'X10 Parallel Pro 4 mm absent du classement');
assert(ranking.includes("'rx7'"), 'RX7 absent du classement indoor');
assert(ranking.includes('preminens'), 'Preminens absente du classement Skylon');
assert(ranking.includes("if (key === 'vxt')"), 'VXT absent du classement Victory');
assert(ranking.includes("if (key === 'vap')"), 'VAP absent du classement Victory');
assert(!ranking.toLowerCase().includes('carbon express'), 'Carbon Express ne doit pas revenir dans le classement v14');

for (const model of ['a/c/e','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x7','x23','rx7','xx75 platinum plus','vap','vxt','precium','edge','bruxx','empros']) {
  assert(extra.models?.[model], `Référence fabricant v13 absente: ${model}`);
}
assert(extra.models.edge.purpose.toLowerCase().includes('compound'), 'Positionnement compound de Edge perdu');
assert(extra.models['x10 parallel pro 3.2 mm'].straightnessIn === 0.001, 'Tolérance X10 3.2 perdue');
assert(extra.models.vxt.cuttingRule, 'Règle de coupe VXT absente');
assert(extra.policy?.carbonExpressEnabled === false, 'Carbon Express doit rester désactivé');

console.log('Assistant Archer: classement expert Pré-alpha v14 contrôlé OK');
