import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m)};

const data=json('test/point-catalog-v31.json');
const cfg=read('test/app-config.js');
const ui=read('test/point-audit-v31.js');
const base=json('test/arrow-components.json');

assert(data.version==='2026-08-23-prealpha-v31','Version pointes v31 inattendue');
assert(data.policy?.manufacturerFirst===true,'Priorité fabricant pointes absente');
assert(data.policy?.noInventedWeights===true,'Garde-fou poids de pointe absent');
for(const brand of ['Easton','Victory','Skylon']) assert(data.policy?.threeActiveBrandsVerified?.includes(brand),`Marque non auditée: ${brand}`);

const extra=new Map((data.points||[]).map(p=>[p.id,p]));
for(const id of ['easton-rx7-adjustable-bullet-100','easton-x23-adjustable-bullet-100','easton-x7-bullet-point','easton-xx75-platinum-plus-bullet','easton-xx75-jazz-bullet','victory-vft-vforce-ss-point']) assert(extra.has(id),`Pointe v31 absente: ${id}`);
assert(extra.get('easton-rx7-adjustable-bullet-100').weights.includes(100),'RX7 100 gr absent');
assert(extra.get('easton-x23-adjustable-bullet-100').weights.includes(100),'X23 100 gr absent');
assert(extra.get('easton-x7-bullet-point').weightsBySpine['2214'][0]===100,'X7 2214 Bullet 100 gr incorrect');
assert(extra.get('easton-xx75-jazz-bullet').weightsBySpine['2016'][0]===90,'Jazz 2016 Bullet 90 gr incorrect');
assert(extra.get('victory-vft-vforce-ss-point').weights.join(',')==='80,100,120,150','VFT VForce SS masses incorrectes');

const baseIds=new Set((base.points||[]).map(p=>p.id));
for(const id of ['easton-x10-tungsten-breakoff','easton-ace-4mm-hl','easton-avance-4mm-ml','victory-vap-ss-breakoff-80-100','victory-vxt-ss-breakoff-120-140','skylon-32-parallel','skylon-42-parallel']) assert(baseIds.has(id),`Pointe de base perdue: ${id}`);

assert(cfg.includes('point-catalog-v31.json?v=20260823-prealpha-v31'),'Chargement point-catalog v31 absent');
assert(cfg.includes('expandSpecialPointAliases'),'Correction alias X10/A-C-E/VAP absente');
assert(cfg.includes('point-audit-v31.js?v=20260823-prealpha-v31'),'Boot UI audit pointes absent');
assert(ui.includes("const VERSION = 'Pré-alpha v31'"),'Version UI pointes v31 absente');

console.log('Assistant Archer: pointes Easton/Victory/Skylon Pré-alpha v31 contrôlées OK');
