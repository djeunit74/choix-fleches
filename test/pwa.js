(() => {
  'use strict';
  const bar=document.createElement('section');bar.className='app-connection';
  bar.innerHTML='<p role="status" id="offline-status">Préparation de l’accès hors connexion…</p><button type="button" hidden>Installer la mise à jour</button>';
  document.querySelector('main').append(bar);
  const status=bar.querySelector('p'),button=bar.querySelector('button');let ready=false,waiting=null,reload=false;
  const refresh=()=>{status.textContent=waiting?'Une nouvelle version est prête. Enregistrez vos saisies avant d’installer la mise à jour.':ready?(navigator.onLine?'Application prête hors connexion sur cet appareil. Les liens fabricants nécessitent Internet.':'Hors connexion : calculs, carnet et repères disponibles. Les liens fabricants attendront le réseau.'):'Accès hors connexion non prêt. Gardez cette page ouverte avec Internet pour terminer le chargement.';};
  window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
  if(!('serviceWorker'in navigator)){status.textContent='Ce navigateur ne permet pas de préparer l’application hors connexion.';return;}
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reload)location.reload();});
  button.addEventListener('click',()=>{if(!waiting)return;reload=true;waiting.postMessage('ACTIVATE_UPDATE');});
  const offer=registration=>{if(registration.waiting){waiting=registration.waiting;ready=false;button.hidden=false;button.textContent='Mettre à jour l’application (recharge la page)';refresh();}};
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(async registration=>{
    offer(registration);
    registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed')offer(registration);});});
    await navigator.serviceWorker.ready;ready=!registration.waiting;refresh();
  }).catch(()=>{ready=false;refresh();});
})();
