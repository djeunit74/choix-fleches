const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const engine=require('../verified-engine.js');
const charts=JSON.parse(fs.readFileSync('verified-charts.json','utf8'));
const base={weight:30,length:28,skylonLength:28,front:100,limbs:'carbon',material:'carbon'};
const get=(brand,extra={})=>engine.lookup(charts,brand,{...base,...extra});

test('Easton: five transcription errors corrected against PN 301055-A',()=>{
  assert.equal(get('easton',{weight:65,length:34}).value,'250-200');
  assert.equal(get('easton',{weight:24,length:31,material:'alu'}).value,'1914 / 1916 / 2013 / RX7-21');
  assert.equal(get('easton',{weight:37,length:31,material:'alu'}).value,'2114 / 2213 / RX7-23');
  assert.equal(get('easton',{weight:50,length:31,material:'alu'}).value,'2314 / 2413 / 2315');
  assert.equal(get('easton',{weight:55,length:26,material:'alu'}).value,'2114 / 2016 / RX7-22');
});
test('Easton: published point and limb corrections and explicit length rounding',()=>{
  assert.equal(get('easton').value,'800-700');
  assert.equal(get('easton',{front:125}).adjusted,33);
  assert.equal(get('easton',{limbs:'beginner'}).adjusted,25);
  assert.equal(get('easton',{length:28.25}).column,28);
  assert.equal(get('easton',{length:28.5}).column,29);
  for(const extra of [{weight:20},{weight:26.5},{length:34.1},{length:20.9},{front:110},{front:NaN},{limbs:''}])assert.equal(get('easton',extra).ok,false);
});
test('Victory: published front mass bands, no ambiguous row/length resolution',()=>{
  assert.equal(get('victory').value,'700');
  assert.equal(get('victory',{front:150}).value,'600');
  for(const extra of [{weight:14,length:28},{front:126},{front:149},{front:176},{front:NaN},{length:28.5},{weight:26.5}])assert.equal(get('victory',extra).ok,false);
});
test('Skylon: cut-to-cut length is independent, Radius A3 and missing group entries fixed',()=>{
  const r=get('skylon',{skylonLength:27});
  assert.equal(r.value,'A3');
  assert.deepEqual(r.models.find(([n])=>n==='Radius')[1],[750,700]);
  assert.deepEqual(r.models.find(([n])=>n==='Edge')[1],[800]);
  assert.equal(get('skylon',{skylonLength:NaN}).ok,false);
  assert.equal(get('skylon',{skylonLength:27.5}).ok,false);
});
test('Carbon Express: ambiguous codes are never silently normalized',()=>{
  assert.equal(get('carbon').ok,false);
  assert.match(get('carbon').reason,/NPX7500/);
});
test('FOC: geometry, units, invalid/empty input and no universal target',()=>{
  assert.ok(Math.abs(engine.measuredFoc(72,43.2)-10)<1e-10);
  assert.equal(engine.measuredFoc(72,36),0);
  assert.equal(engine.measuredFoc(72,18),-25);
  assert.equal(engine.measuredFoc(72,72),50);
  assert.equal(engine.measuredFoc(72,0),-50);
  for(const pair of [[NaN,30],[72,NaN],[0,1],[72,-1],[-72,20]])assert.equal(engine.measuredFoc(...pair),null);
});
test('No old recommendation, component or merchant extension is loaded',()=>{
  const index=fs.readFileSync('index.html','utf8');
  for(const name of ['app-enhancements.js','merchant-ui.js','arrow-builder.js','refactor-smoke.js'])assert.ok(!index.includes('src="'+name));
  assert.ok(fs.readFileSync('app-config.js','utf8').includes('strictAudit:true'));
  assert.ok(!fs.readFileSync('app-config.js','utf8').includes('appendChild'));
  assert.ok(fs.readFileSync('app.js','utf8').includes('if (window.AssistantArcherConfig?.strictAudit) return;'));
});
test('Public and test active sources match byte-for-byte',()=>{
  for(const file of ['index.html','app.js','app-config.js','verified-app.js','verified-engine.js','verified-charts.json','reliability.js','styles.css','foc-measure.js'])assert.deepEqual(fs.readFileSync(file),fs.readFileSync('test/'+file));
});
test('Every published table has its expected dimensions, provenance and check date',()=>{
  assert.equal(charts.easton.carbon.length*14+charts.easton.alu.length*12+charts.victory.light.length*9+charts.victory.heavy.length*9+charts.skylon.rows.length*10,638);
  for(const [name,expected]of [['carbon',14],['alu',12]])for(const row of charts.easton[name])assert.equal(row.cells.length,expected);
  for(const row of [...charts.victory.light,...charts.victory.heavy])assert.equal(row.values.length,9);
  for(const row of charts.skylon.rows)assert.equal(row.values.length,10);
  assert.equal(charts.checkedOn,'2026-10-21');
  for(const source of Object.values(charts.sources))assert.ok(source.url.startsWith('https://'));
});
