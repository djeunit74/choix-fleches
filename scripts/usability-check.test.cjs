const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

function pwa({controller=null,waiting=null,active=null,ready=Promise.resolve()}={}) {
  const events={},registrationEvents={},clicks={},sent=[];
  const status={textContent:''},button={hidden:true,addEventListener:(name,fn)=>clicks[name]=fn};
  const registration={active,waiting,addEventListener:(name,fn)=>registrationEvents[name]=fn};
  const serviceWorker={controller,ready,register:()=>Promise.resolve(registration),addEventListener:(name,fn)=>events[name]=fn};
  let reloads=0;
  const context={document:{createElement:()=>({querySelector:s=>s==='p'?status:button}),querySelector:()=>({append(){}})},window:{addEventListener:(name,fn)=>events[name]=fn},navigator:{onLine:true,serviceWorker},location:{reload:()=>reloads++}};
  vm.runInNewContext(fs.readFileSync('pwa.js','utf8'),context);
  return {events,registrationEvents,clicks,status,button,registration,serviceWorker,context,reloads:()=>reloads,sent};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('First offline installation never offers an update and becomes ready after activation',async()=>{
  let activate;const ready=new Promise(resolve=>activate=resolve);
  const app=pwa({waiting:{state:'installed'},ready});await tick();
  assert.equal(app.button.hidden,true);assert.doesNotMatch(app.status.textContent,/nouvelle version/);
  app.registration.waiting=null;app.registration.active={state:'activated'};app.serviceWorker.controller={};
  activate();app.events.controllerchange();await tick();
  assert.match(app.status.textContent,/prête hors connexion/);assert.equal(app.button.hidden,true);assert.equal(app.reloads(),0);
  app.context.navigator.onLine=false;app.events.offline();assert.match(app.status.textContent,/Hors connexion/);
});

test('An actual waiting update is activated only by the explicit reload button',async()=>{
  const sent=[];const app=pwa({controller:{},active:{state:'activated'},waiting:{state:'installed',postMessage:message=>sent.push(message)}});await tick();
  assert.equal(app.button.hidden,false);assert.match(app.status.textContent,/Enregistrez vos saisies/);
  assert.deepEqual(sent,[]);app.clicks.click();assert.deepEqual(sent,['ACTIVATE_UPDATE']);assert.equal(app.reloads(),0);
  app.registration.waiting=null;app.events.controllerchange();assert.equal(app.reloads(),1);
});

function sightContext(){
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.value='';this.events={};}
    appendChild(child){child.parent=this;this.children.push(child);}
    addEventListener(name,fn){this.events[name]=fn;}
  }
  class Input extends Element {constructor(){super('input');}}
  const container=new Element('div');let renders=0;
  const context={document:{createElement:tag=>tag==='input'?new Input():new Element(tag),querySelector:()=>container},HTMLInputElement:Input,sightInputForDistance:distance=>container.children.flatMap(label=>label.children).find(input=>input.dataset.distance===distance),renderSightVisual:()=>renders++};
  const source=fs.readFileSync('app.js','utf8');
  const start=source.indexOf('function normalizeSightDistance('),end=source.indexOf('\nfunction clampSightTop',start);
  vm.createContext(context);vm.runInContext(source.slice(start,end),context);
  return {context,container,renders:()=>renders};
}

test('Adding a personal distance creates a visible labelled empty field, never a predicted mark',()=>{
  const {context,container,renders}=sightContext();
  const input=context.ensureSightInput('25');
  assert.equal(input.type,'text');assert.equal(input.value,'');assert.equal(container.children[0].textContent,'25 m');
  assert.equal(context.ensureSightInput('25'),input);assert.equal(container.children.length,1);
  input.value='1,7';input.dataset.pending='true';input.events.input();
  assert.equal(input.dataset.pending,undefined);assert.equal(input.value,'1,7');assert.equal(renders(),1);
});

test('Personal distances reject fractional, missing and out-of-range entries without rounding',()=>{
  const {context}=sightContext();
  for(const value of ['',0,-1,121,'25,5','texte',Infinity])assert.equal(context.normalizeSightDistance(value),'');
  for(const value of [1,18,'25',120])assert.equal(context.normalizeSightDistance(value),String(value));
});
