(() => {
  'use strict';
  const card=document.getElementById('backup-card');
  const block=document.createElement('div');
  block.innerHTML='<h3>Retrouver mes fiches sur cet appareil</h3><p>Choisissez une sauvegarde JSON Assistant Archer. Les fiches du carnet et les repères seront ajoutés sans remplacer vos fiches actuelles. Les doublons identiques sont ignorés. L’historique et les anciens brouillons ne sont pas importés.</p><label>Fichier de sauvegarde<input id="backup-file" type="file" accept=".json,application/json"></label><p id="backup-preview" role="status"></p><button id="backup-restore" type="button" disabled>Ajouter les fiches de cette sauvegarde</button>';
  card.append(block);const file=block.querySelector('input'),status=block.querySelector('[role="status"]'),button=block.querySelector('button');
  let pending=null,revision=0;
  file.addEventListener('change',async()=>{
    const current=++revision;pending=null;button.disabled=true;
    if(!file.files[0]){status.textContent='Aucun fichier choisi.';return;}
    if(file.files[0].size>2000000){status.textContent='Fichier trop volumineux (2 Mo maximum).';return;}
    try{
      const parsed=window.AssistantArcherBackup.parse(await file.files[0].text());if(current!==revision)return;
      const plans=prepare(parsed);pending=parsed;
      status.textContent=`Prêt à ajouter : ${plans.archerNotebook.added} fiche(s) et ${plans.sightNotebook.added} jeu(x) de repères. Les données restent sur cet appareil.`;
      button.disabled=!plans.archerNotebook.added&&!plans.sightNotebook.added;
    }catch(e){status.textContent=e.message;}
  });
  function prepare(data){return Object.fromEntries(['archerNotebook','sightNotebook'].map(key=>[key,window.AssistantArcherBackup.merge(JSON.parse(localStorage.getItem(key)||'[]'),data[key],key)]));}
  button.addEventListener('click',()=>{
    if(!pending)return;
    const before={};let writing=false;
    try{
      // Recompute from current storage: edits made since the preview are preserved.
      const plans=prepare(pending);
      for(const key of Object.keys(plans))before[key]=localStorage.getItem(key);
      writing=true;
      for(const [key,plan]of Object.entries(plans))localStorage.setItem(key,JSON.stringify(plan.records));
      renderNotebook();renderSightEntries();pending=null;button.disabled=true;status.textContent='Fiches ajoutées. Vos données précédentes sont conservées.';
    }catch(e){
      if(writing){try{for(const [key,raw]of Object.entries(before)){if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);}}catch{status.textContent='Stockage inaccessible. Conservez vos fichiers de sauvegarde et vérifiez le carnet avant de continuer.';return;}}
      status.textContent='Import impossible : '+e.message;
    }
  });
})();
