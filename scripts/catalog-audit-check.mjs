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

assert(data.version==='2026-08-22-prealpha-v17','Version catalogue v17 inattendue');
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
assert(data.brands.avalon.models['hybrid carbon arrows'].status==='registered_only','Hybrid Avalon reste distinct du mapping historique direct');

assert(tech.models?.novice?.spines?.['600']?.gpi===7.09,'Table Novice fabricant absente/corrompue');
assert(tech.models?.inspire?.spines?.['900']?.gpi===7.7,'Table Inspire fabricant absente/corrompue');
assert(tech.models?.['xx75 jazz']?.spines?.['2016']?.gpi===10.6,'Table Jazz fabricant absente/corrompue');
assert(tech.models?.['avalon classic carbon arrows']?.availableSpines?.includes(2000),'Spines Avalon Classic incomplets');
assert(tech.models?.['avalon hybrid carbon arrows']?.availableSpines?.includes(500),'Spines Avalon Hybrid incomplets');
assert(tech.models?.['avalon tyro carbon shafts']?.stockLengthIn===32,'Longueur Tyro shafts absente');
assert(tech.models?.['avalon tyro carbon arrows']?.note?.includes('ne pas l\'inventer'),'Garde-fou longueur Tyro absent');

assert(js.includes("const VERSION='Pré-alpha v17'"),'Version JS v17 absente');
assert(js.includes('catalog-audit-v17.json?v=20260822-prealpha-v17'),'Catalogue v17 non charge');
assert(js.includes('catalog-audit-v17-extra.json?v=20260822-prealpha-v17'),'Extension catalogue v17 non chargee');
assert(js.includes('manufacturer-reference-v17.json?v=20260822-prealpha-v17'),'References techniques v17 non chargees');
assert(js.includes('INJECTABLE'),'Injection catalogue verifie absente');
for(const m of ["'x10'","'a/c/e'","'inspire'","'xx75 jazz'","'novice'","'bruxx'","'empros'"]) assert(js.includes(m),`Famille injectable absente ${m}`);
assert(js.includes('stockLengthCompatible'),'Garde-fou longueur fabricant absent');
assert(js.includes('rankRecommendation(rec,input)'),'Reclassement expert apres injection absent');
assert(js.includes("['easton','victory','skylon','avalon']"),'Audit Avalon absent');

assert(avalon.includes("const VERSION='Pré-alpha v18'"),'Avalon v18 absent');
for(const m of ['Avalon Tyro Carbon Arrows','Avalon Classic Carbon Arrows','Avalon Hybrid Carbon Arrows','Avalon Tyro Carbon Shafts']) assert(avalon.includes(m),`Famille Avalon v18 absente: ${m}`);
assert(avalon.includes('HISTORICAL'),'Mapping historique Avalon absent');
assert(avalon.includes('current-spine'),'Distinction correspondance Avalon par spine absente');
assert(avalon.includes('Continuité de gamme non confirmée explicitement par Avalon.'),'Garde-fou Composite/Hybrid absent');
assert(avalon.includes('lengthCompatible'),'Garde-fou longueur Avalon absent');
assert(cfg.includes('catalog-audit.js?v=20260822-prealpha-v17'),'Boot audit v17 absent');
assert(cfg.includes('avalon-addon.js?v=20260822-prealpha-v18'),'Boot Avalon v18 absent');

console.log('Assistant Archer: catalogue complet + Avalon Pré-alpha v18 contrôlés OK');
