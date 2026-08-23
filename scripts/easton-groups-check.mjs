import fs from 'node:fs';

const src = fs.readFileSync('test/easton-precision-v37.js','utf8');

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

ok(src.includes("const VERSION = 'Pré-alpha v38'"), 'Version Easton v38 absente');
ok(src.includes("'720-625':'T4'"), 'Mapping 720-625 -> T4 absent');
ok(src.includes('compatibleSpines'), 'Le croisement plage Easton / spines fabriqués doit exister');
ok(src.includes('candidates[candidates.length - 1]'), 'Le côté le plus souple de la plage doit être retenu en recurve');
ok(src.includes('manufacturerSpec: row'), 'La ligne fabricant exacte doit être jointe au modèle');
ok(src.includes('manufacturerSelectionBasis'), 'La base de sélection fabricant doit être traçable');
ok(src.includes("if (key === 'protour') continue"), 'ProTour doit être exclue du recurve');
ok(!src.includes('new MutationObserver'), 'Le calculateur Easton v38 ne doit pas utiliser de MutationObserver global');
ok(!src.includes('setInterval'), 'Le calculateur Easton v38 ne doit pas utiliser de boucle permanente');

console.log('Easton selector groups v38: OK');
