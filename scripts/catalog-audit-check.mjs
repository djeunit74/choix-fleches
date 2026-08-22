import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};
const data=json('test/catalog-audit-v17.json');
const tech=json('test/manufacturer-reference-v17.json');
const js=read('test/catalog-audit.js');
const cfg=read('test/app-config.js');

assert(data.version==='2026-08-22-prealpha-v17','Version catalogue v17 inattendue');
assert(data.policy?.allCurrentFamiliesRegistered===true,'Le registre complet doit etre actif');
assert(data.policy?.autoSelectionRequiresVerifiedSizing===true,'Selection auto sans table verifiee interdite');
for(const brand of ['easton','victory','skylon','avalon']) assert(data.brands?.[brand]?.models,`Marque absente ${brand}`);

for(const m of ['x10','a/c/e','avance','avance sport','superdrive micro','vector','inspire','rx7','x7','x23','xx75 platinum plus','xx75 jazz','x10 parallel pro 4 mm','x10 parallel pro 3.2 mm','x10 protour','a/c/g','a/c/c','carbon one','apollo']) assert(data.brands.easton.models[m],`Easton non enregistre ${m}`);
for(const m of ['vap','vxt','vft','3dhv','v-tac 23','v-tac 25','v-tac 27','vx-27','vap jr','ares','venus','vlr','hlr','rival','rival x','rip ss','rip xv','rip','vap ss','vap tko','rip tko','vf tko','vforce','bamboo trad']) assert(data.brands.victory.models[m],`Victory non enregistre ${m}`);
for(const m of ['novice','radius','brixxon','performa','precium','paragon','preminens','bruxx','empros','quantic','instec','backbone','savage','edge','phoric','maverick','rove','ebony','frontier','bentwood','fast wing']) assert(data.brands.skylon.models[m],`Skylon non enregistre ${m}`);
for(const m of ['tyro carbon arrows','classic carbon arrows','hybrid carbon arrows','tyro carbon shafts']) assert(data.brands.avalon.models[m],`Avalon non enregistre ${m}`);

assert(data.brands.easton.models['a/c/g'].status==='discontinued','ACG doit rester discontinué');
assert(data.brands.easton.models['x10 protour'].recurve===false,'ProTour doit rester hors recurve');
assert(data.brands.skylon.models.edge.recurve===false,'Edge doit rester hors recurve');
assert(data.brands.skylon.models.novice.status==='auto','Novice doit etre injectable apres verification fabricant');
assert(data.brands.avalon.models['hybrid carbon arrows'].status==='registered_only','Hybrid Avalon ne doit pas etre auto-selectionnee sans tableau de correspondance');

assert(tech.models?.novice?.spines?.['600']?.gpi===7.09,'Table Novice fabricant absente/corrompue');
assert(tech.models?.inspire?.spines?.['900']?.gpi===7.7,'Table Inspire fabricant absente/corrompue');
assert(tech.models?.['xx75 jazz']?.spines?.['2016']?.gpi===10.6,'Table Jazz fabricant absente/corrompue');
assert(tech.models?.['avalon classic carbon arrows']?.availableSpines?.includes(2000),'Spines Avalon Classic incomplets');
assert(tech.models?.['avalon tyro carbon arrows']?.note?.includes('ne pas l\'inventer'),'Garde-fou longueur Tyro absent');

assert(js.includes("const VERSION='Pré-alpha v17'"),'Version JS v17 absente');
assert(js.includes('catalog-audit-v17.json?v=20260822-prealpha-v17'),'Catalogue v17 non charge');
assert(js.includes('manufacturer-reference-v17.json?v=20260822-prealpha-v17'),'References techniques v17 non chargees');
assert(js.includes('INJECTABLE'),'Injection catalogue verifie absente');
for(const m of ["'x10'","'a/c/e'","'inspire'","'xx75 jazz'","'novice'","'bruxx'","'empros'"]) assert(js.includes(m),`Famille injectable absente ${m}`);
assert(js.includes('stockLengthCompatible'),'Garde-fou longueur fabricant absent');
assert(js.includes('rankRecommendation(rec,input)'),'Reclassement expert apres injection absent');
assert(js.includes("['easton','victory','skylon','avalon']"),'Audit Avalon absent');
assert(cfg.includes('catalog-audit.js?v=20260822-prealpha-v17'),'Boot audit v17 absent');

console.log('Assistant Archer: catalogue complet Easton/Victory/Skylon/Avalon Pré-alpha v17 OK');
