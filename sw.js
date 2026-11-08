/* Une version complète par périmètre (racine et /test/ restent indépendants). */
const RELEASE='20261108-pointe-4';
const PREFIX='assistant-archer-v2:'+self.registration.scope+':';
const CACHE_NAME=PREFIX+RELEASE;
const ASSETS=['index.html','styles.css','release.css','app-config.js','app.js','foc-measure.js','reliability.js','verified-engine.js','verified-app.js','point-advisor.js','point-ui.js','backup-data.js','backup-ui.js','pwa.js','manifest.webmanifest','icon-assistant-archer-v11.svg','verified-charts.json','audit-report.md','audit-inventory.json'];
const urls=ASSETS.map(path=>/\.(js|css)$/.test(path)?path+'?v='+RELEASE:path);
urls.push('verified-charts.json?v=20261021-audit-1');
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urls))));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    if(event.request.mode==='navigate')return (await cache.match('index.html'))||fetch(event.request);
    return (await cache.match(event.request))||fetch(event.request);
  }));
});
