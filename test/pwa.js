(() => {
  'use strict';
  const bar=document.createElement('section');bar.className='app-connection';
  bar.innerHTML='<p role="status" id="offline-status">Préparation de l’accès hors connexion…</p><button type="button" hidden>Installer la mise à jour</button>';
  document.querySelector('main').append(bar);
  const status=bar.querySelector('p'),button=bar.querySelector('button');let ready=false,waiting=null,reload=false,currentRegistration=null;
  const refresh=()=>{status.textContent=waiting?'Une nouvelle version est prête. Enregistrez vos saisies avant d’installer la mise à jour.':ready?(navigator.onLine?'Application prête hors connexion sur cet appareil. Les liens fabricants nécessitent Internet.':'Hors connexion : calculs, carnet et repères disponibles. Les liens fabricants attendront le réseau.'):'Accès hors connexion non prêt. Gardez cette page ouverte avec Internet pour terminer le chargement.';};
  window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
  if(!('serviceWorker'in navigator)){status.textContent='Ce navigateur ne permet pas de préparer l’application hors connexion.';return;}
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reload)location.reload();else if(currentRegistration)offer(currentRegistration);});
  button.addEventListener('click',()=>{if(!waiting)return;reload=true;waiting.postMessage('ACTIVATE_UPDATE');});
  const offer=registration=>{
    // The first installation can briefly be waiting before becoming active.
    // Offer a reload only when an existing controller and a genuinely waiting worker coexist.
    waiting=registration.waiting?.state==='installed'&&navigator.serviceWorker.controller?registration.waiting:null;
    ready=!!registration.active&&!!navigator.serviceWorker.controller&&!waiting;
    button.hidden=!waiting;button.textContent='Mettre à jour l’application (recharge la page)';refresh();
  };
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(async registration=>{
    currentRegistration=registration;
    offer(registration);
    registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(['installed','activated'].includes(installing.state))offer(registration);});});
    await navigator.serviceWorker.ready;offer(registration);
  }).catch(()=>{ready=false;refresh();});
})();
