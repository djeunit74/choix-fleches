import fs from 'node:fs';

const src = fs.readFileSync('test/easton-mode-v35.js','utf8');

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

ok(src.includes("const VERSION = 'Pré-alpha v35'"), 'Version Easton v35 absente');
ok(src.includes("'720-625':'T4'"), 'Mapping 720-625 -> T4 absent');
ok(src.includes('T4:[650,700]'), 'X10 groupe T4 absent');
ok(src.includes('T4:[670,720]'), 'A-C-E groupe T4 absent');
ok(src.includes('sizes[sizes.length - 1]'), 'La taille recurve marquée R doit être retenue');
ok(src.includes('advisedSpine:exact'), 'Le spine exact groupe Easton doit être injecté dans la recommandation');
ok(!src.includes('rec.models.filter('), 'Le mode Easton ne doit pas supprimer brutalement les modèles');
ok(!src.includes('new MutationObserver'), 'Le mode Easton v35 ne doit pas utiliser de MutationObserver global');

console.log('Easton groups v35: OK');
