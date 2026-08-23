import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const config = read('test/app-config.js');
const easton = read('test/easton-mode-v33.js');

assert(config.includes("option[value=\"all\"]") || config.includes("['all','carbon','avalon']"), 'Le retrait explicite de Toutes les marques doit rester présent');
assert(config.includes("brand.value = brand.querySelector('option[value=\"easton\"]') ? 'easton'"), 'Easton doit devenir le choix par défaut si all était sélectionné');
assert(config.includes('easton-mode-v33.js?v=20260823-prealpha-v33'), 'Le mode Easton v33 doit être chargé');
assert(easton.includes("const VERSION = 'Pré-alpha v33'"), 'Version Easton v33 absente');
assert(easton.includes('Poids de pointe de référence (gr)'), 'Champ poids de pointe Easton absent');
assert(easton.includes('Type de branches'), 'Champ type de branches Easton absent');
assert(easton.includes('rec.models = rec.models'), 'Le mode Easton doit reclasser les modèles');
assert(!easton.includes('rec.models = rec.models.filter'), 'Le mode Easton v33 ne doit pas filtrer brutalement les modèles');
assert(easton.includes("['720-625'"), 'La table Easton doit contenir la plage 720-625');
assert(easton.includes('sans exclusion automatique'), 'Le caractère non destructif du mode Easton doit être explicite');

console.log('Assistant Archer: mode Easton Pré-alpha v33 contrôlé OK');
