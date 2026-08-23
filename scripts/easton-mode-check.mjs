import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const config = read('test/app-config.js');
const loader = read('test/easton-mode-v33.js');
const groups = read('test/easton-groups-v34.js');
const easton = read('test/easton-mode-v35.js');

assert(config.includes("['all','carbon','avalon']"), 'Le retrait explicite de Toutes les marques doit rester présent');
assert(loader.includes('easton-mode-v35.js?v=20260823-prealpha-v35-performance'), 'Le shim v33 doit charger le mode Easton v35');
assert(groups.includes('EastonGroupsV34Disabled'), 'La couche v34 doit rester désactivée');
assert(easton.includes("const VERSION = 'Pré-alpha v35'"), 'Version Easton v35 absente');
assert(easton.includes('Poids de pointe de référence (gr)'), 'Champ poids de pointe Easton absent');
assert(easton.includes('Type de branches'), 'Champ type de branches Easton absent');
assert(easton.includes("'720-625':'T4'"), 'Correspondance Easton 720-625 -> T4 absente');
assert(easton.includes('T4:[650,700]'), 'Correspondance X10 T4 absente');
assert(easton.includes('T4:[670,720]'), 'Correspondance A/C/E T4 absente');
assert(easton.includes('sizes[sizes.length - 1]'), 'La taille recurve R doit être la valeur retenue');
assert(!easton.includes('new MutationObserver'), 'Le mode Easton v35 ne doit pas observer tout le DOM');
assert(!easton.includes('rec.models = rec.models.filter'), 'Le mode Easton ne doit pas supprimer brutalement les modèles');

console.log('Assistant Archer: mode Easton Pré-alpha v35 contrôlé OK');
