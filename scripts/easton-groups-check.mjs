import fs from 'node:fs';

const src = fs.readFileSync('test/easton-groups-v34.js','utf8');
const app = fs.readFileSync('test/app-config.js','utf8');

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

ok(src.includes("const VERSION = 'Pré-alpha v34'"), 'Version Easton v34 absente');
ok(src.includes("'720-625':'T4'"), 'Mapping 720-625 -> T4 absent');
ok(/T4:700/.test(src), 'X10 recurve T4 doit etre 700');
ok(/T4:720/.test(src), 'A-C-E recurve T4 doit etre 720');
ok(src.includes('la taille marquée R est la recommandation recurve') || src.includes('taille RECURVE'), 'Regle Easton R/recurve non documentee');
ok(src.includes('advisedSpine: exact'), 'Le spine exact groupe Easton doit etre injecte dans la recommandation');
ok(!src.includes('rec.models.filter('), 'Le mode groupe Easton ne doit pas supprimer brutalement les modeles');
ok(app.includes("easton-mode-v33.js?v=20260823-prealpha-v33"), 'Mode Easton v33 non charge');
ok(app.includes("easton-groups-v34.js?v=20260823-prealpha-v34"), 'Groupes Easton v34 non charges');
ok(app.indexOf('easton-mode-v33.js') < app.indexOf('easton-groups-v34.js'), 'Les groupes v34 doivent etre charges apres le mode Easton v33');

console.log('Easton groups v34: OK');
