import fs from 'node:fs';

const src = fs.readFileSync('test/easton-precision-v37.js','utf8');

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

ok(src.includes("const VERSION = 'Pré-alpha v37'"), 'Version Easton v37 absente');
ok(src.includes("'720-625':'T4'"), 'Mapping 720-625 -> T4 absent');
ok(/T4:700/.test(src), 'X10 recurve T4 doit être 700');
ok(/T4:720/.test(src), 'A-C-E recurve T4 doit être 720');
ok(src.includes('manufacturerSpec:row'), 'La ligne fabricant exacte doit être jointe au modèle');
ok(src.includes('manufacturerSelectionBasis:basis'), 'La base de sélection fabricant doit être traçable');
ok(src.includes("modelKey(e.model)!=='protour'"), 'ProTour doit être exclue du recurve');
ok(!src.includes('new MutationObserver'), 'Le mode Easton v37 ne doit pas utiliser de MutationObserver global');
ok(!src.includes('setInterval'), 'Le mode Easton v37 ne doit pas utiliser de boucle permanente');

console.log('Easton groups v37: OK');
