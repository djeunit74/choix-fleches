import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const config = read('test/app-config.js');
const release = read('test/easton-mode-v33.js');
const groups = read('test/easton-groups-v34.js');
const easton = read('test/easton-precision-v37.js');

assert(config.includes("['all','carbon','avalon']"), 'Le retrait explicite de Toutes les marques doit rester présent');
assert(release.includes("const VERSION = 'Pré-alpha v38'"), 'La version globale TEST doit être v38');
assert(groups.includes('EastonGroupsV34Disabled'), 'La couche v34 doit rester désactivée');
assert(config.includes('easton-precision-v37.js?v=20260823-prealpha-v38'), 'Le calculateur Easton v38 doit être chargé');
assert(easton.includes('Calculateur Easton — cible recurve carbone / A-C'), 'Bloc calculateur Easton absent');
assert(easton.includes('Poids de pointe'), 'Champ poids de pointe Easton absent');
assert(easton.includes('Type de branches'), 'Champ type de branches Easton absent');
assert(easton.includes('pointAdjustment'), 'Correction de poids de pointe Easton absente');
assert(easton.includes("isParallelPro(key) ? -5 : 0"), 'Correction -5 lbs Parallel Pro absente');
assert(easton.includes('chooseRecurveSpine'), 'Choix du côté recurve le plus souple absent');
assert(!easton.includes('new MutationObserver'), 'Le calculateur Easton v38 ne doit pas observer le DOM global');
assert(!easton.includes('setInterval'), 'Le calculateur Easton v38 ne doit pas utiliser de boucle permanente');

console.log('Assistant Archer: calculateur Easton Pré-alpha v38 contrôlé OK');
