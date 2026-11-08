/* Interface de la version auditée. Les anciennes extensions techniques sont hors chargement. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=id=>{const s=$(id)?.value?.trim();return s?Number(s):NaN;};
  const link=(url,title)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a>`;
  $('appReleaseStatic').textContent='Assistant Archer · version du 8 novembre 2026';

  // Descriptive measurements only, for both classic and barebow.
  $('arcSetupIntro').textContent='Relevez les mesures de votre arc. La notice du modèle exact fixe les plages de band et les limites de réglage des vis.';
  for(const block of document.querySelectorAll('.arc-classic-only')){
    block.classList.remove('arc-classic-only');block.hidden=false;
  }
  $('arcSetupDocRef').innerHTML=link('https://www.worldarchery.sport/sport/equipment/barebow','Présentation de l’arc nu — World Archery')+' · Cette présentation ne prescrit pas un tiller universel.';
  const power=$('riserLength').closest('.subcard');
  power.querySelector('h3').textContent='Identification du matériel';
  power.querySelector('p').textContent='La puissance marquée sur les branches ne remplace pas la mesure au peson à votre allonge. Aucune puissance réelle n’est déduite de ces champs.';
  $('arcLength').closest('.subcard').querySelector('p').textContent='Tiller = distance haute moins distance basse, avec la même méthode de mesure. La notice et les essais au tir déterminent le réglage adapté.';
  $('arcSetupResult').innerHTML='<h2>Mesures personnelles</h2><p>Saisissez vos mesures. Aucun exemple n’est présenté comme un relevé de votre arc.</p>';
  $('upperTiller').value='';$('lowerTillerMeasured').value='';
  $('limbMarkedWeight').value='';$('drawLengthForWeight').value='';
  window.updateArcSetupCopyForBowStyle=style=>{
    $('arcSetupHeading').textContent=style==='barebow'?'Mesures de mon arc nu':'Mesures de mon arc classique';
    $('arcSetupIntro').textContent='Relevez les mesures de votre arc. La notice du modèle exact fixe les plages et les limites de réglage.';
    for(const block of document.querySelectorAll('.arc-classic-only'))block.hidden=false;
    $('barebowArcSetupCard').hidden=true;
  };
  $('arc-setup-form').addEventListener('submit',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    const high=num('upperTiller'),low=num('lowerTillerMeasured'),band=num('braceMeasured');
    const tiller=high-low;
    $('arcSetupResult').innerHTML=Number.isFinite(high)&&Number.isFinite(low)&&high>0&&low>0?`<h2>Vos mesures</h2><p>Tiller calculé : <strong>${tiller>0?'+':''}${tiller.toFixed(1)} mm</strong>.</p><p>Band : ${Number.isFinite(band)&&band>0?band.toFixed(1)+' cm':'non renseigné'}.</p><p>Aucune cible universelle de band, de tiller ou de détalonnage n’est déduite. En arc nu, vérifiez le comportement aux prises de corde et distances réellement utilisées. Pour les vis de branches, suivez la procédure et les limites de la notice de votre modèle.</p>`:'<h2>Mesures incomplètes</h2><p>Renseignez deux distances positives, en millimètres, avec la même méthode.</p>';
  },true);
  $('prefillNotebookBtn').textContent='Reprendre mes mesures';
  $('prefillNotebookBtn').addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    // Never overwrite a measured value with a computed target or confuse draw length with arrow length.
    if(Number.isFinite(num('braceMeasured')))$('notebookBrace').value=$('braceMeasured').value+' cm';
    if(Number.isFinite(num('upperTiller')))$('notebookUpperTiller').value=$('upperTiller').value+' mm';
    if(Number.isFinite(num('lowerTillerMeasured')))$('notebookLowerTiller').value=$('lowerTillerMeasured').value+' mm';
    $('notebookStatus').textContent='Mesures renseignées reprises. Allonge, flèches et puissance restent à saisir depuis vos relevés.';
  },true);
  $('notebookEstimatedWeight').closest('label').firstChild.textContent='Puissance personnelle (préciser mesurée ou estimée)';
  $('notebookPositiveTiller').closest('label').firstChild.textContent='Tiller haut moins bas (signé)';
  // Carnet et réglette : structure et commandes du modèle historique.
  if(typeof currentBowStyle==='function'){
    window.updateSightCopyForBowStyle(currentBowStyle());
    window.updateArcSetupCopyForBowStyle(currentBowStyle());
  }

  const foc=document.createElement('section');foc.className='card';
  foc.innerHTML=`<details><summary>Calculer le FOC de ma flèche (facultatif)</summary><p>Montez tous les composants. L : du creux d’encoche à la fin du tube, sans la pointe. A : du même creux d’encoche au point d’équilibre.</p><div class="field-grid"><label>Longueur L (cm)<input id="verifiedFocLength" type="number" min="0" step="0.1"></label><label>Distance A (cm)<input id="verifiedFocBalance" type="number" min="0" step="0.1"></label></div><button type="button">Calculer le FOC</button><p role="status"></p><p>FOC (%) = 100 × (A − L/2) / L. Ce calcul décrit la position du centre de masse ; il ne valide pas le vol de la flèche. ${link('https://eastonarchery.com/foc-calculator/','Méthode Easton')}</p></details>`;
  $('result').after(foc);
  const updateFoc=()=>{const value=window.AssistantArcherVerifiedEngine.measuredFoc(num('verifiedFocLength'),num('verifiedFocBalance'));foc.querySelector('[role="status"]').textContent=value===null?'Renseignez une longueur positive et une distance au point d’équilibre positive ou nulle.':`FOC calculé : ${value.toFixed(1)} %. À interpréter avec vos essais au tir.`;};
  foc.querySelector('button').addEventListener('click',updateFoc);
  foc.addEventListener('input',updateFoc);
})();
