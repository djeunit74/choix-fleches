import fs from 'node:fs';

const src = fs.readFileSync('test/easton-precision-v37.js','utf8');
const app = fs.readFileSync('test/app-config.js','utf8');
const release = fs.readFileSync('test/easton-mode-v33.js','utf8');
const assert = (ok,msg) => { if(!ok) throw new Error(msg); };

assert(src.includes("const VERSION = 'Pré-alpha v38'"), 'Version Easton v38 absente');
assert(src.includes("'720-625':'T4'"), 'Mapping Easton 720-625 vers T4 absent');
assert(src.includes('pointAdjustment'), 'Correction poids de pointe absente');
assert(src.includes("return document.getElementById('eastonLimbProfileV38')?.value === 'beginner' ? -5 : 0"), 'Correction branches débutant absente');
assert(src.includes("selectorResult(isParallelPro(key) ? -5 : 0)"), 'Correction Parallel Pro -5 lbs absente');
assert(src.includes('manufacturerSpec: row'), 'La ligne fabricant exacte doit être attachée au modèle');
assert(src.includes('meta: metaFromManufacturer'), 'La meta technique fabricant doit être exploitée');
assert(src.includes("if (key === 'protour') continue"), 'X10 ProTour doit être exclue du recurve');
assert(src.includes('candidates[candidates.length - 1]'), 'La sélection recurve doit prendre le côté le plus souple de la plage');
assert(!src.includes('new MutationObserver'), 'Le calculateur Easton v38 ne doit pas installer d observer global');
assert(!src.includes('setInterval'), 'Le calculateur Easton v38 ne doit pas utiliser de boucle permanente');
assert(app.includes('easton-precision-v37.js?v=20260823-prealpha-v38'), 'Le module Easton v38 doit être chargé par TEST');
assert(release.includes("const VERSION = 'Pré-alpha v38'"), 'La version visible globale doit être v38');

console.log('Assistant Archer: précision Easton Pré-alpha v38 contrôlée OK');
