const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const advisor=require('../point-advisor.js'),backup=require('../backup-data.js'),charts=require('../verified-charts.json');
const input={brand:'easton',model:'Avance',spine:'800',material:'carbon',length:28,weight:30,point:100,insert:0,limbs:'carbon',candidates:[75,125,110],impact:'none'};
test('Existing shaft comparison uses the total front mass and preserves unsupported candidates',()=>{
  const a=advisor.assess(charts,input);assert.equal(a.current.status,'match');
  assert.deepEqual(a.candidates.map(r=>r.status),['match','outside','unknown']);
  assert.equal(a.trial.kind,'untested');
  assert.equal(advisor.assess(charts,{...input,point:75,insert:25}).current.total,100);
  assert.equal(advisor.assess(charts,{...input,point:75,insert:25}).current.status,'match');
});
test('Victory bands, unavailable front masses and exact aluminium codes are respected',()=>{
  assert.equal(advisor.assess(charts,{...input,brand:'victory',spine:'700'}).current.status,'match');
  assert.equal(advisor.assess(charts,{...input,brand:'victory',point:140}).current.status,'unknown');
  assert.equal(advisor.assess(charts,{...input,material:'alu',weight:24,length:31,spine:'1914'}).current.status,'match');
  assert.equal(advisor.assess(charts,{...input,material:'alu',weight:24,length:31,spine:'191'}).current.status,'outside');
});
test('Skylon uses its exact model and cannot simulate point corrections; Carbon Express remains blocked',()=>{
  const a=advisor.assess(charts,{...input,brand:'skylon',model:'Radius',length:27,spine:'750'});
  assert.equal(a.current.status,'match');assert.deepEqual(a.candidates,[]);assert.ok(a.pointRule);
  assert.equal(advisor.assess(charts,{...input,brand:'skylon',model:'Unknown',length:27}).current.status,'unknown');
  assert.equal(advisor.assess(charts,{...input,brand:'carbon'}).current.status,'unknown');
});
test('Missing and non-finite measurements never produce an assessment',()=>{
  for(const change of [{weight:NaN},{length:0},{insert:NaN},{insert:-1},{point:0},{spine:''},{spine:'1914/R'},{model:''},{candidates:[Infinity]},{candidates:Array(13).fill(100)}])assert.equal(advisor.assess(charts,{...input,...change}).ok,false);
});
test('Bare-shaft advice reverses for left-handed archers and refuses unreliable observations',()=>{
  const trial={hand:'right',impact:'left',repeatable:true,clearance:true};
  assert.equal(advisor.trialAdvice(trial).kind,'heavier');
  assert.equal(advisor.trialAdvice({...trial,hand:'left'}).kind,'lighter');
  assert.equal(advisor.trialAdvice({...trial,impact:'right'}).kind,'lighter');
  assert.equal(advisor.trialAdvice({...trial,impact:'right',hand:'left'}).kind,'heavier');
  assert.equal(advisor.trialAdvice({...trial,impact:'center'}).kind,'keep');
  for(const change of [{repeatable:false},{clearance:false},{hand:''}])assert.equal(advisor.trialAdvice({...trial,...change}).kind,'inconclusive');
  assert.match(advisor.trialAdvice({...trial,bowStyle:'barebow'}).text,/prises de corde/);
});
const wrap=data=>JSON.stringify({schema:'assistant-archer-backup-v1',data});
test('Direct proposal separates a provisional table direction from an actual trial',()=>{
  assert.equal(advisor.assess(charts,input).proposal.kind,'keep');
  const stiff=advisor.assess(charts,{...input,spine:'600',candidates:[125,150]});
  assert.equal(stiff.proposal.kind,'heavier');assert.match(stiff.proposal.basis,/tableau/);assert.match(stiff.proposal.action,/compatible/);
  const weak=advisor.assess(charts,{...input,spine:'1000'});assert.equal(weak.proposal.kind,'lighter');
  assert.equal(advisor.assess(charts,{...input,point:110,spine:'600'}).proposal.kind,'unknown');
  assert.equal(advisor.assess(charts,{...input,material:'alu',spine:'1914'}).proposal.kind,'unknown');
  assert.equal(advisor.assess(charts,{...input,brand:'skylon',model:'Radius',length:27,spine:'600'}).proposal.kind,'unknown');
});
test('Contradictory and inconclusive trials do not trigger a directional recommendation',()=>{
  const observed={...input,spine:'600',impact:'right',hand:'right',repeatable:true,clearance:true};
  assert.equal(advisor.assess(charts,observed).proposal.kind,'conflict');
  assert.equal(advisor.assess(charts,{...observed,repeatable:false}).proposal.kind,'unknown');
  assert.equal(advisor.assess(charts,{...observed,impact:'center'}).proposal.kind,'keep');
  assert.equal(advisor.assess(charts,{...observed,impact:'left'}).proposal.kind,'heavier');
});
test('Proposed masses are only user-entered matching options in the advised direction',()=>{
  const a=advisor.assess(charts,{...input,spine:'800',point:125,candidates:[75,100,110,150]});
  assert.equal(a.proposal.kind,'lighter');assert.deepEqual(a.proposal.options,[75,100]);
  assert.deepEqual(advisor.assess(charts,{...input,candidates:[]}).proposal.options,[]);
});
test('Backup import validates format, records and distances before any write',()=>{
  assert.equal(backup.parse(wrap({archerNotebook:[{id:'a',title:'Ma fiche'}]})).archerNotebook.length,1);
  for(const data of ['{}','{','x'.repeat(2000001),wrap({archerNotebook:{}}),wrap({archerNotebook:[{title:4}]}),wrap({sightNotebook:[{marks:{121:'a'}}]}),wrap({sightNotebook:[{marks:{18:{}}}]})])assert.throws(()=>backup.parse(data));
  assert.throws(()=>backup.parse('{"schema":"assistant-archer-backup-v1","data":{"archerNotebook":[{"__proto__":"x"}]}}'));
});
test('Backup merge preserves existing records, renames ID conflicts and is idempotent',()=>{
  const old=[{id:'a',title:'Original'}],added=[{id:'a',title:'Autre'}];
  const a=backup.merge(old,added,'archerNotebook');assert.equal(a.records.length,2);assert.equal(a.records[0].title,'Original');assert.notEqual(a.records[1].id,'a');
  assert.equal(backup.merge(a.records,added,'archerNotebook').added,0);assert.equal(old.length,1);
  assert.throws(()=>backup.merge(Array.from({length:50},(_,i)=>({id:String(i),title:String(i)})),added,'archerNotebook'));
});
test('All active sources match the test version and are present in the offline shell',()=>{
  const html=fs.readFileSync('index.html','utf8'),worker=fs.readFileSync('sw.js','utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^" ]*)?"/g)){
    const file=match[1];if(!/\.(?:js|css)$/.test(file))continue;
    assert.ok(worker.includes("'"+file+"'"),file+' absent from offline shell');
    assert.deepEqual(fs.readFileSync(file),fs.readFileSync('test/'+file));
  }
  assert.deepEqual(fs.readFileSync('sw.js'),fs.readFileSync('test/sw.js'));
});
test('Offline worker serves the precached document/assets without a network and isolates cache cleanup',async()=>{
  const handlers={},deleted=[];let urls=[];
  const scope='https://example.com/choix-fleches/';
  const cache={addAll:async list=>{urls=list;},match:async request=>request==='index.html'?'document':request?.url?.includes('point-advisor.js')?'advisor':undefined};
  const context={URL,self:{registration:{scope},location:{origin:'https://example.com'},clients:{claim:async()=>{}},addEventListener:(name,cb)=>handlers[name]=cb},caches:{open:async()=>cache,keys:async()=>['other-app','assistant-archer-v2:'+scope+':old','assistant-archer-v2:https://example.com/choix-fleches/test/:old'],delete:async name=>deleted.push(name)},fetch:()=>{throw Error('offline');}};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),context);
  let promise;handlers.install({waitUntil:p=>promise=p});await promise;assert.ok(urls.includes('point-advisor.js?v=20261108-personal-6'));
  handlers.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(deleted,['assistant-archer-v2:'+scope+':old']);
  handlers.fetch({request:{method:'GET',mode:'navigate',url:scope+'?pwa=11'},respondWith:p=>promise=p});assert.equal(await promise,'document');
  handlers.fetch({request:{method:'GET',mode:'cors',url:scope+'point-advisor.js?v=20261108-personal-6'},respondWith:p=>promise=p});assert.equal(await promise,'advisor');
});
test('Restored visual marks keep saved values and exclude unplaced cursors from saved data',()=>{
  const source=fs.readFileSync('app.js','utf8');
  const start=source.indexOf('function sightFormData()');
  const end=source.indexOf('\nfunction sightMarksSummary',start);
  class Input { constructor(distance,value,pending){this.dataset={distance,...(pending?{pending:'true'}:{})};this.value=value;} }
  const fields=[new Input('18','3,8'),new Input('25','0,0',true),new Input('30','repère personnel'),new Input('40','')];
  const els=Object.fromEntries(['sightDate','sightTitle','sightEquipment','sightArrows','sightNotes'].map(key=>[key,{value:'personnel'}]));
  const context={HTMLInputElement:Input,els,currentBowStyle:()=> 'barebow',document:{querySelectorAll:()=>fields}};
  vm.createContext(context);vm.runInContext(source.slice(start,end),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.sightFormData().marks)),{'18':'3,8','30':'repère personnel'});
  delete fields[1].dataset.pending;fields[1].value='1,0';
  assert.equal(context.sightFormData().marks['25'],'1,0');
});
