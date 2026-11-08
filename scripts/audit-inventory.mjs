import fs from 'node:fs';
import crypto from 'node:crypto';
const files=fs.readdirSync('.').filter(p=>p.endsWith('.json')&&!['audit-inventory.json','verified-charts.json'].includes(p));
const records=[],sources=new Set();
let scalarClaims=0;
function walk(value,path,file){
  if(value&&typeof value==='object'){
    if(!Array.isArray(value)&&Object.values(value).some(v=>typeof v==='number'||typeof v==='string'||typeof v==='boolean'))
      records.push({file,path,status:'not-certified',disposition:'excluded-from-automatic-advice',sha256:crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')});
    for(const [k,v]of Object.entries(value))walk(v,path+'/'+k,file);
  } else {
    scalarClaims++;
    if(typeof value==='string'&&/^https:\/\//.test(value))sources.add(value);
  }
}
for(const file of files)walk(JSON.parse(fs.readFileSync(file,'utf8')),'',file);
const queue=[...sources];
const results=[];
async function worker(){
  while(queue.length){
    const url=queue.shift();
    try{
      const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'user-agent':'Assistant-Archer-Factual-Audit/1.0'}});
      results.push({url,httpStatus:r.status,finalUrl:r.url,contentType:r.headers.get('content-type'),access:r.ok?'reachable':'not-retrieved',technicalContentVerified:false});
      await r.body?.cancel();
    }catch(e){results.push({url,access:'not-retrieved',technicalContentVerified:false,reason:e.name});}
  }
}
await Promise.all(Array.from({length:8},worker));
const inventory={checkedOn:'2026-10-21',scope:'All root JSON data files excluding the newly verified chart dataset. test/ contains mirrored data; it is not counted twice.',policy:'Reachability is not evidence of technical correctness. No legacy record is certified by presence of a source URL, audit flag or HTTP 200.',files,recordCount:records.length,scalarFieldCount:scalarClaims,sourceCount:results.length,sourceChecks:results.sort((a,b)=>a.url.localeCompare(b.url)),records};
fs.writeFileSync('audit-inventory.json',JSON.stringify(inventory,null,2)+'\n');
fs.copyFileSync('audit-inventory.json','test/audit-inventory.json');
console.log(JSON.stringify({files:files.length,records:records.length,scalarFields:scalarClaims,sources:results.length,reachable:results.filter(r=>r.access==='reachable').length}));
