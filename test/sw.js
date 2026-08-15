const CACHE_NAME = "choix-fleches-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./audit-fixes.js",
  "./barebow-guidance.js",
  "./ui-refactor.js",
  "./onboarding.js",
  "./expert-audit.js",
  "./manifest.webmanifest",
  "./icon-assistant-archer-v11.svg",
  "./404.html"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);const isAppAsset=["/index.html","/app.js","/audit-fixes.js","/barebow-guidance.js","/ui-refactor.js","/onboarding.js","/expert-audit.js","/styles.css","/manifest.webmanifest","/icon-assistant-archer-v11.svg"].some(x=>url.pathname.endsWith(x));if(isAppAsset){event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html"))));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match("./index.html"))))});