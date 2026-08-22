import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};
const data=json('test/vane-catalog-v25.json');
const mass=json('test/vane-mass-v27.json');
const rear=json('test/rear-precision-v28.json');
const js=read('test/vane-library-v25.js');
const massJs=read('test/vane-mass-v27.js');
const cfg=read('test/app-config.js');

assert(data.version==='2026-08-22-prealpha-v25','Version catalogue empennages inattendue');
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

for(const vane of data.vanes){
  assert(vane.sourceUrl&&vane.sourceLabel,`Source manquante ${vane.id}`);
  if(vane.weightGrains!=null) assert(Number.isFinite(Number(vane.weightGrains)),`Masse invalide ${vane.id}`);
  if(vane.imageUrl) assert(/^https:\/\//.test(vane.imageUrl),`Image non HTTPS ${vane.id}`);
}

assert(js.includes("const VERSION = 'Pré-alpha v28'"),'UI empennages v28 absente');
assert(js.includes('vane-product-thumb'),'Miniatures empennages absentes');
assert(js.includes('Photo fabricant'),'Mention photo fabricant absente');
assert(js.includes('Silhouette de repère'),'Fallback miniature sécurisé absent');
assert(js.includes('vane-context-tags'),'Etiquettes discipline/contexte absentes');
assert(massJs.includes("const VERSION='Pré-alpha v28'"),'Masses empennages v28 non alignées');
assert(mass.policy?.includeMountingMassForFoc===true,'Masse de fixation non incluse dans le FOC');

assert(rear.version==='2026-08-22-prealpha-v28','Audit arrière v28 absent');
assert(rear.policy?.manufacturerFirst===true,'Priorité fabricant arrière absente');
assert(rear.profiles?.['easton-x10']?.rearAssembly?.weightGrains===10,'Arrière X10 incorrect');
assert(rear.profiles?.['easton-ace']?.rearAssembly?.weightGrains===11,'Arrière ACE pin incorrect');
assert(rear.profiles?.['easton-ace']?.rearAssemblyAlternatives?.some(x=>x.weightGrains===7),'Alternative G Nock ACE absente');
assert(rear.profiles?.['victory-vap']?.rearAssembly?.weightGrains===8,'Arrière VAP origine incorrect');
assert(rear.profiles?.['victory-vap']?.rearAssemblyAlternatives?.some(x=>x.weightGrains===15),'Alternative pin VAP absente');
assert(rear.profiles?.['victory-vxt']?.rearAssembly?.weightGrains===15,'Arrière VXT incorrect');
assert(rear.profiles?.['victory-vap']?.gpiBySpine?.['700']===5.7,'GPI VAP 700 absent');
assert(rear.profiles?.['victory-vxt']?.gpiBySpine?.['550']===7.1,'GPI VXT 550 absent');
assert(rear.profiles?.['skylon-paragon']?.rearAssembly?.sourceTier==='proxy-estimate','Proxy Skylon ID3.2 doit rester explicite');

assert(cfg.includes('rear-precision-v28.json?v=20260822-prealpha-v28'),'Fusion précision arrière absente');
assert(cfg.includes('arrow-balance\\.json'),'Intercepteur arrow-balance absent');
assert(cfg.includes('vane-library-v25.js?v=20260822-prealpha-v28'),'Boot miniatures v28 absent');
assert(cfg.includes('vane-mass-v27.js?v=20260822-prealpha-v28'),'Boot masses v28 absent');

console.log('Assistant Archer: Pré-alpha v28 empennages + précision arrière contrôlés OK');
