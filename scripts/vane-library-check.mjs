import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};
const data=json('test/vane-catalog-v25.json');
const js=read('test/vane-library-v25.js');
const cfg=read('test/app-config.js');

assert(data.version==='2026-08-22-prealpha-v25','Version empennages v25 inattendue');
assert(data.policy?.manufacturerFirst===true,'Source fabricant prioritaire absente');
assert(data.policy?.noInventedWeight===true,'Garde-fou masse empennage absent');
assert(data.policy?.disciplineAware===true,'Filtrage discipline absent');
assert(data.policy?.imagesManufacturerOnly===true,'Politique image fabricant absente');

const ids=new Map((data.vanes||[]).map(v=>[v.id,v]));
for(const id of ['gaspro-olympic-efficient-175','gaspro-recurve-hp-175','gaspro-field-efficient-2','gaspro-indoor-efficient-4','bohning-air-2','bohning-x-vane-15','bohning-x-vane-175','spinwing-original-175','spinwing-original-vld-175','spinwing-elite-175','elivanes-p3','elivanes-s3']) assert(ids.has(id),`Empennage absent ${id}`);
assert(ids.get('gaspro-field-efficient-2').disciplines.includes('campagne'),'Gas Pro Field doit rester campagne');
assert(ids.get('gaspro-field-efficient-2').disciplines.includes('3d'),'Gas Pro Field doit rester 3D');
assert(ids.get('gaspro-indoor-efficient-4').contexts.includes('salle'),'Gas Pro Indoor doit rester identifié salle');
assert(ids.get('spinwing-elite-175').disciplines.includes('3d'),'SpinWing Elite 1.75 doit rester compatible 3D');
assert(ids.get('elivanes-p3').sourceTier==='manufacturer-legacy','EliVanes P3 doit rester signalée comme source fabricant ancienne');
assert(ids.get('elivanes-s3').disciplines.includes('campagne'),'EliVanes S3 doit rester campagne/H+F');
assert(ids.get('bohning-air-2').weightGrains===4.5,'Masse Bohning Air 2 incorrecte');

for(const vane of data.vanes){
  assert(vane.sourceUrl&&vane.sourceLabel,`Source manquante ${vane.id}`);
  if(vane.weightGrains!=null) assert(Number.isFinite(Number(vane.weightGrains)),`Masse invalide ${vane.id}`);
  if(vane.imageUrl) assert(/^https:\/\//.test(vane.imageUrl),`Image non HTTPS ${vane.id}`);
}

assert(js.includes('vane-brand-group'),'Organisation par marque absente');
assert(js.includes('Photo fabricant'),'Mention photo fabricant absente');
assert(js.includes('vane-context-tags'),'Etiquettes discipline/contexte absentes');
assert(cfg.includes('vane-catalog-v25.json?v=20260822-prealpha-v25'),'Intercepteur catalogue empennages absent');
assert(cfg.includes('vane-library-v25.js?v=20260822-prealpha-v25'),'Boot UI empennages v25 absent');
assert(cfg.includes('arrow-components\\.json'),'Fusion avec arrow-components absente');

console.log('Assistant Archer: bibliothèque empennages Pré-alpha v25 contrôlée OK');
