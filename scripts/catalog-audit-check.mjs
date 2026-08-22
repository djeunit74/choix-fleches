import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};
const data=json('test/catalog-audit-v17.json');
const extra=json('test/catalog-audit-v17-extra.json');
const tech=json('test/manufacturer-reference-v17.json');
const js=read('test/catalog-audit.js');
const cfg=read('test/app-config.js');
const expert=read('test/expert-model-ranking.js');
const avalon=read('test/avalon-addon.js');
const easton={...(data.brands?.easton?.models||{}),...(extra.brands?.easton?.models||{})};

assert(data.version==='2026-08-22-prealpha-v22','Version catalogue data v22 inattendue');
assert(data.policy?.allCurrentFamiliesRegistered===true,'Le registre complet doit etre actif');
assert(data.policy?.autoSelectionRequiresVerifiedSizing===true,'Selection auto sans table verifiee interdite');
for(const brand of ['easton','victory','skylon']) assert(data.brands?.[brand]?.models,`Marque absente ${brand}`);
assert(!data.brands?.avalon,'Avalon ne doit plus etre present dans le registre actif');
for(const m of ['x10','a/c/e','avance','avance sport','superdrive micro','vector','inspire','rx7','x7','x23','xx75 platinum plus','xx75 jazz','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x10 protour','a/c/g','a/c/c','carbon one','apollo','superdrive 19','6.5 matrix match grade','6.5 flatline','full bore','xx75 genesis','xx75 tribute','xx75 neos','6mm aftermath','xx75 magnum crossbow']) assert(easton[m],`Easton non enregistre ${m}`);
for(const m of ['vap','vxt','vft','3dhv','v-tac 23','v-tac 25','v-tac 27','vx-27','vap jr','ares','venus','vlr','hlr','rival','rival x','rip ss','rip xv','rip','vap ss','vap tko','rip tko','vf tko','vforce','bamboo trad']) assert(data.brands.victory.models[m],`Victory non enregistre ${m}`);
for(const m of ['novice','radius','brixxon','performa','precium','paragon','preminens','bruxx','empros','quantic','instec','backbone','savage','edge','phoric','maverick','rove','ebony','frontier','bentwood','fast wing']) assert(data.brands.skylon.models[m],`Skylon non enregistre ${m}`);

assert(easton['a/c/g'].status==='discontinued','ACG doit rester discontinué');
assert(easton['x10 protour'].recurve===false,'ProTour doit rester hors recurve');
assert(data.brands.skylon.models.edge.recurve===false,'Edge doit rester hors recurve');
assert(data.brands.skylon.models.novice.status==='auto','Novice doit etre injectable apres verification fabricant');
assert(tech.models?.novice?.spines?.['600']?.gpi===7.09,'Table Novice fabricant absente/corrompue');
assert(tech.models?.inspire?.spines?.['900']?.gpi===7.7,'Table Inspire fabricant absente/corrompue');
assert(tech.models?.['xx75 jazz']?.spines?.['2016']?.gpi===10.6,'Table Jazz fabricant absente/corrompue');
assert(!Object.values(tech.models||{}).some(m=>m?.brand==='Avalon'),'Aucune reference technique Avalon ne doit rester active');
assert(!Object.keys(tech.sources||{}).some(k=>k.toLowerCase().includes('avalon')),'Aucune source Avalon ne doit rester active');

assert(js.includes("const VERSION='Pré-alpha v23'"),'Version audit JS v23 absente');
assert(js.includes("!['easton','victory','skylon'].includes(rec.brand)"),'Audit actif doit etre limite a Easton/Victory/Skylon');
assert(js.includes('removeAvalonFromRuntime'),'Garde-fou retrait Avalon absent');
assert(!js.includes('AssistantArcherAvalon'),'Le moteur d audit ne doit plus appeler Avalon');
assert(js.includes("option[value=\"competition\"]")||js.includes("option[value='competition']")||js.includes("option[value=\"competition\"]"),'Le nettoyage de l ancienne option competition doit rester present');

assert(expert.includes("const VERSION='Pré-alpha v24'"),'Classement expert v24 absent');
assert(expert.includes('Performance / compétition'),'Categorie fusionnee performance/competition absente');
assert(expert.includes('Performance maximale / tuning expert'),'Categorie tuning expert absente');
assert(expert.includes('ELITE_OUTDOOR'),'Shortlist expert outdoor absente');
assert(expert.includes('ELITE_INDOOR'),'Shortlist expert indoor absente');
assert(expert.includes("if(c.objective==='elite')"),'Filtrage tuning expert absent');
assert(expert.includes('if(specialized.length)'),'Fallback expert sans modele specialise absent');
assert(cfg.includes('expert-model-ranking.js?v=20260822-prealpha-v24'),'Boot expert v24 absent');
assert(cfg.includes('catalog-audit.js?v=20260822-prealpha-v23'),'Boot audit v23 absent');
assert(!cfg.includes('avalon-addon.js'),'Avalon ne doit plus etre charge depuis app-config');
assert(!/Tyro|Classic Carbon|Hybrid Carbon|Carbon Composite/.test(avalon),'Les donnees Avalon doivent etre effacees de l add-on');

console.log('Assistant Archer: Pré-alpha v24 - shortlist tuning expert différenciée');
