import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const config = read('test/app-config.js');
const release = read('test/easton-mode-v33.js');
const groups = read('test/easton-groups-v34.js');
const easton = read('test/easton-precision-v37.js');

assert(config.includes("['all','carbon','avalon']"), 'Le retrait explicite de Toutes les marques doit rester présent');
assert(release.includes("const VERSION = 'Pré-alpha v37'"), 'La version globale TEST doit être v37');
assert(groups.includes('EastonGroupsV34Disabled'), 'La couche v34 doit rester désactivée');
assert(config.includes('easton-precision-v37.js?v=20260823-prealpha-v37'), 'Le mode précision Easton v37 doit être chargé');
assert(easton.includes('Poids de pointe de référence (gr)'), 'Champ poids de pointe Easton absent');
assert(easton.includes('Type de branches'), 'Champ type de branches Easton absent');
assert(easton.includes("'720-625':'T4'"), 'Correspondance Easton 720-625 -> T4 absente');
assert(/T4:700/.test(easton), 'Correspondance X10 recurve T4 -> 700 absente');
assert(/T4:720/.test(easton), 'Correspondance A/C/E recurve T4 -> 720 absente');
assert(!easton.includes('new MutationObserver'), 'Le mode Easton v37 ne doit pas observer le DOM global');
assert(!easton.includes('setInterval'), 'Le mode Easton v37 ne doit pas utiliser de boucle permanente');

console.log('Assistant Archer: mode Easton Pré-alpha v37 contrôlé OK');
