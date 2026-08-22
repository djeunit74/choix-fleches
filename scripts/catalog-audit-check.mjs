import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};
const data=json('test/catalog-audit-v17.json');
const extra=json('test/catalog-audit-v17-extra.json');
const tech=json('test/manufacturer-reference-v17.json');
const js=read('test/catalog-audit.js');
const cfg=read('test/app-config.js');
const avalon=read('test/avalon-addon.js');
const easton={...(data.brands?.easton?.models||{}),...(extra.brands?.easton?.models||{})};

assert(data.version==='2026-08-22-prealpha-v17','Version catalogue data v17 inattendue');
assert(data.policy?.allCurrentFamiliesRegistered===true,'Le registre complet doit etre actif');
assert(data.policy?.autoSelectionRequiresVerifiedSizing===true,'Selection auto sans table verifiee interdite');
for(const brand of ['easton','victory','skylon','avalon']) assert(data.brands?.[brand]?.models,`Marque absente ${brand}`);
for(const m of ['x10','a/c/e','avance','avance sport','superdrive micro','vector','inspire','rx7','x7','x23','xx75 platinum plus','xx75 jazz','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x10 protour','a/c/g','a/c/c','carbon one','apollo','superdrive 19','6.5 matrix match grade','6.5 flatline','full bore','xx75 genesis','xx75 tribute','xx75 neos','6mm aftermath','xx75 magnum crossbow']) assert(easton[m],`Easton non enregistre ${m}`);
for(const m of ['vap','vxt','vft','3dhv','v-tac 23','v-tac 25','v-tac 27','vx-27','vap jr','ares','venus','vlr','hlr','rival','rival x','rip ss','rip xv','rip','vap ss','vap tko','rip tko','vf tko','vforce','bamboo trad']) assert(data.brands.victory.models[m],`Victory non enregistre ${m}`);
for(const m of ['novice','radius','brixxon','performa','precium','paragon','preminens','bruxx','empros','quantic','instec','backbone','savage','edge','phoric','maverick','rove','ebony','frontier','bentwood','fast wing']) assert(data.brands.skylon.models[m],`Skylon non enregistre ${m}`);
for(const m of ['tyro carbon arrows','classic carbon arrows','hybrid carbon arrows','tyro carbon shafts']) assert(data.brands.avalon.models[m],`Avalon non enregistre ${m}`);

assert(easton['a/c/g'].status==='discontinued','ACG doit rester discontinué');
assert(easton['x10 protour'].recurve===false,'ProTour doit rester hors recurve');
assert(data.brands.skylon.models.edge.recurve===false,'Edge doit rester hors recurve');
assert(data.brands.skylon.models.novice.status==='auto','Novice doit etre injectable apres verification fabricant');

assert(tech.models?.novice?.spines?.['600']?.gpi===7.09,'Table Novice fabricant absente/corrompue');
assert(tech.models?.inspire?.spines?.['900']?.gpi===7.7,'Table Inspire fabricant absente/corrompue');
assert(tech.models?.['xx75 jazz']?.spines?.['2016']?.gpi===10.6,'Table Jazz fabricant absente/corrompue');
assert(tech.models?.['avalon classic carbon arrows']?.availableSpines?.includes(2000),'Spines Avalon Classic incomplets');
assert(tech.models?.['avalon hybrid carbon arrows']?.availableSpines?.includes(500),'Spines Avalon Hybrid incomplets');
assert(tech.models?.['avalon tyro carbon shafts']?.stockLengthIn===32,'Longueur Tyro shafts absente');

assert(js.includes("const VERSION='Pré-alpha v21'"),'Version JS v21 absente');
assert(js.includes("if(rec.brand==='avalon')return rec"),'Avalon doit etre exclu du filtrage catalogue general');
assert(js.includes("brand==='avalon'&&window.AssistantArcherAvalon?.recommend"),'Le wrapper catalogue doit appeler directement le moteur Avalon');
assert(js.includes('Avalon utilise son moteur fabricant dédié'),'Explication du moteur Avalon dédié absente');

assert(avalon.includes("const VERSION='Pré-alpha v20'"),'Avalon v20 absent');
for(const m of ['Avalon Tyro Carbon Arrows','Avalon Classic Carbon Arrows','Avalon Hybrid Carbon Arrows','Avalon Tyro Carbon Shafts']) assert(avalon.includes(m),`Famille Avalon v20 absente: ${m}`);
assert(avalon.includes('function buildAvalonRecommendation'),'Moteur Avalon explicite absent');
assert(avalon.includes('window.AssistantArcherAvalon'),'API runtime Avalon absente');
assert(avalon.includes('current-spine'),'Distinction correspondance Avalon par spine absente');
assert(avalon.includes('lengthCompatible'),'Garde-fou longueur Avalon absent');
assert(avalon.includes('meta:modelMeta(c.family,c.spine)'),'Metadonnees Avalon locales non attachees aux candidats');
assert(!avalon.includes('rankModels(candidates.map'),'Avalon ne doit plus dependre du catalogue global pour afficher ses candidats');
assert(cfg.includes('catalog-audit.js?v=20260822-prealpha-v21'),'Boot audit v21 absent');
assert(cfg.includes('avalon-addon.js?v=20260822-prealpha-v20'),'Boot Avalon v20 absent');

console.log('Assistant Archer: catalogue complet + Avalon Pré-alpha v21 contrôlés OK');
