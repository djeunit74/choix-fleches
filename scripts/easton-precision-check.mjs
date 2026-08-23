import fs from 'node:fs';

const src = fs.readFileSync('test/easton-precision-v37.js','utf8');
const app = fs.readFileSync('test/app-config.js','utf8');
const release = fs.readFileSync('test/easton-mode-v33.js','utf8');
const assert = (ok,msg) => { if(!ok) throw new Error(msg); };

assert(src.includes("const VERSION = 'Pré-alpha v37'"), 'Version Easton v37 absente');
assert(src.includes("'720-625':'T4'"), 'Mapping Easton 720-625 vers T4 absent');
assert(/T4:700/.test(src), 'T4 doit donner X10 700 en recurve');
assert(/T4:720/.test(src), 'T4 doit donner A-C-E 720 en recurve');
assert(src.includes('manufacturerSpec:row'), 'La ligne fabricant exacte doit être attachée au modèle');
assert(src.includes('meta:metaFromManufacturer'), 'La meta technique ne doit plus rester nulle pour les familles enrichies');
assert(src.includes("modelKey(e.model)!=='protour'"), 'X10 ProTour doit être exclue du recurve');
assert(!src.includes('new MutationObserver'), 'La précision Easton v37 ne doit pas installer d observer global');
assert(!src.includes('setInterval'), 'La précision Easton v37 ne doit pas utiliser de boucle permanente');
assert(app.includes('easton-precision-v37.js?v=20260823-prealpha-v37'), 'Le module Easton v37 doit être chargé par TEST');
assert(release.includes("const VERSION = 'Pré-alpha v37'"), 'La version visible globale doit être v37');

console.log('Assistant Archer: précision Easton Pré-alpha v37 contrôlée OK');
