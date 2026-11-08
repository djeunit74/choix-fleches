/* Interface de la version auditée. Les anciennes extensions techniques sont hors chargement. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=id=>{const s=$(id)?.value?.trim();return s?Number(s):NaN;};
  const link=(url,title)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a>`;
  let data=null;
  let requestVersion=0;
  const dataPromise=fetch('verified-charts.json?v=20261021-audit-1',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(d.version!=='2026-10-21-audit-1')throw Error('Version inattendue');data=d;return d;}).catch(()=>null);

  $('appReleaseStatic').textContent='Version : reprise du 8 novembre 2026 · tableaux contrôlés le 21 octobre';
  $('searchModeHelp').textContent='Les résultats sont des lectures de tableaux publiés. Le niveau et l’objectif ne modifient pas le spine. Une référence du tableau ne valide pas un montage complet.';
  for(const id of ['archerExperience','guidedGoal'])$(id).closest('label').hidden=true;
  document.querySelector('.search-mode').hidden=true;
  for(const id of ['shootingEnvironmentWrap','disciplineWrap'])$(id).hidden=true;
  const controls=document.createElement('fieldset');
  controls.className='verified-conditions';
  controls.innerHTML=`<legend>Conditions du tableau fabricant</legend><label>Masse avant totale : pointe + insert (grains)<input id="verifiedFront" type="number" min="1" step="1" placeholder="À renseigner"></label><label>Branches pour Easton<select id="verifiedLimbs"><option value="">À identifier</option><option value="carbon">Branches carbone de compétition (termes du tableau)</option><option value="beginner">Branches bois / fibre de verre débutant</option></select></label><label>Longueur Skylon cut-to-cut (pouces)<input id="verifiedSkylonLength" type="number" min="1" step="0.01" placeholder="Mesure distincte du creux d’encoche"></label><p>Easton : du creux d’encoche à la fin du tube. Skylon : tube coupé, de coupe à coupe. Victory indique « Arrow length » sur ce tableau : confirmez la convention du fabricant pour votre montage.</p><label><input id="verifiedConvention" type="checkbox"> J’ai vérifié la convention de longueur et les conditions du tableau choisi.</label>`;
  $('spine-form').querySelector('button[type="submit"]').before(controls);
  $('drawWeight').value='';$('arrowLength').value='';
  $('drawWeightKnown').checked=false;$('arrowLengthKnown').checked=false;
  for(const id of ['verifiedFront','verifiedLimbs','verifiedSkylonLength','preferredBrand','shaftMaterial'])$(id).addEventListener('input',()=>{$('verifiedConvention').checked=false;});
  $('preferredBrand').addEventListener('change',()=>{$('verifiedConvention').checked=false;});
  // Editing a measurement must also invalidate a result or a pending lookup.
  const invalidate=()=>{
    requestVersion++;
    $('result').innerHTML='<h2>Lecture à recalculer</h2><p>Les paramètres ont changé. Vérifiez les mesures et les conditions puis relancez le calcul.</p>';
  };
  $('spine-form').addEventListener('input',invalidate);
  $('spine-form').addEventListener('change',invalidate);
  window.updateMaterialGuidance=()=>{$('materialGuidance').textContent='Le matériau sélectionne le tableau disponible. Il ne certifie ni l’usage ni la compatibilité d’un modèle.';};
  window.updateMaterialGuidance();
  $('arrowLengthKnown').closest('label').lastChild.textContent=' Je connais les longueurs réellement mesurées selon les conventions des tableaux utilisés.';

  const policy=document.querySelector('.reliability-card');
  policy.innerHTML=`<h2>Des résultats traçables</h2><p>Les tableaux Easton, Victory et Skylon ont été contrôlés : 638 cases de grille comparées aux documents originaux. Les limites et conditions restent affichées avec chaque résultat.</p><details><summary>Ce qui est vérifié et ce qui est suspendu</summary><p>Les anciennes recommandations de modèles, scores de performance, masses estimées, compatibilités de composants, prix et stocks sont suspendus : une URL de fabricant ou une page marchande accessible ne suffit pas à les certifier. Carbon Express reste consultable dans son PDF original, sans recommandation automatique.</p><p>Votre carnet et vos repères restent des observations personnelles. Vos anciennes fiches sont conservées ; elles ne sont pas validées par cet audit.</p>${link('audit-report.md','Lire le rapport détaillé')} · ${link('audit-inventory.json','Consulter l’inventaire des données écartées')}</details>`;
  $('history').hidden=true;
  const sourceCard=document.querySelector('[data-panel="spine"] > .card.notes:last-child');
  if(sourceCard)sourceCard.innerHTML='<h3>Avant de choisir un tube</h3><p>Vérifiez le modèle exact et sa taille fabriquée dans le catalogue actuel. Les codes aluminium (ex. 1914) ne sont pas des valeurs de spine carbone. Un tableau constitue une base de sélection, à confirmer au tir. Inspectez vos flèches selon la procédure du fabricant.</p>'+link('https://eastonarchery.com/safety/','Consignes Easton sur l’inspection des flèches');

  // Capture prevents all legacy recommendation handlers from running.
  $('spine-form').addEventListener('submit',async event=>{
    event.preventDefault();event.stopImmediatePropagation();
    const version=++requestVersion;
    const result=$('result');
    if(!$('drawWeightKnown').checked||!$('arrowLengthKnown').checked||!$('verifiedConvention').checked){result.innerHTML='<h2>Mesures à confirmer</h2><p>Confirmez les deux mesures et les conditions du tableau avant de calculer.</p>';return;}
    const input={weight:num('drawWeight'),length:num('arrowLength'),skylonLength:num('verifiedSkylonLength'),front:num('verifiedFront'),limbs:$('verifiedLimbs').value,material:$('shaftMaterial').value};
    result.innerHTML='<h2>Lecture du tableau</h2><p>Chargement des références vérifiées…</p>';
    await dataPromise;
    if(version!==requestVersion)return;
    if(!data){result.innerHTML='<h2>Références indisponibles</h2><p>Le fichier vérifié n’a pas pu être chargé. Aucun calcul de remplacement n’est utilisé. Rechargez la page.</p>';return;}
    const brands=$('preferredBrand').value==='all'?['easton','victory','skylon','carbon']:[$('preferredBrand').value];
    result.innerHTML='<h2>Lecture des tableaux publiés</h2>'+brands.map(brand=>{
      const source=data.sources[brand];
      const materials=brand==='easton'&&input.material==='all'?['carbon','alu']:[input.material];
      return materials.map(material=>{
        const r=brand!=='easton'&&material==='alu'?{ok:false,reason:'Aucun tableau aluminium vérifié pour cette marque.'}:window.AssistantArcherVerifiedEngine.lookup(data,brand,{...input,material});
        return `<section class="subcard"><h3>${esc(({easton:'Easton',victory:'Victory',skylon:'Skylon',carbon:'Carbon Express'})[brand])}${brand==='easton'?' — '+(material==='alu'?'aluminium':'carbone / aluminium-carbone'):''}</h3>${r.ok?`<p><strong>${esc(r.kind)} : ${esc(r.value)}</strong></p><p>Ligne ${esc(r.row)} · colonne ${r.column} pouces${Number.isFinite(r.adjusted)?` · puissance corrigée pour le tableau : ${r.adjusted.toFixed(1)} lb`:''}.</p>${r.models?'<ul>'+r.models.map(([name,spines])=>`<li>${esc(name)} : ${spines.join(' / ')}</li>`).join('')+'</ul><p>Tailles citées dans ce tableau ; disponibilité actuelle et composants à vérifier séparément.</p>':''}<p>La lecture ne certifie pas la compatibilité d’un tube ou d’un montage. ${brand==='skylon'?'Longueur cut-to-cut.':brand==='victory'?'Confirmez la convention de longueur dans la documentation Victory.':'Arrondi de longueur à la colonne la plus proche selon Easton ; demi-pouce arrondi vers le haut.'}</p>`:`<p>${esc(r.reason)}</p>`}<p>${link(source.url,source.title)} · contrôlé le ${esc(data.checkedOn)}</p></section>`;
      }).join('');
    }).join('');
  },true);

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
  const save=document.createElement('button');save.type='submit';save.textContent='Enregistrer cette fiche';$('notebook-form').append(save);
  const note=document.createElement('p');note.textContent='Ces fiches contiennent vos saisies personnelles, y compris celles des versions précédentes. Elles ne constituent pas des données fabricant vérifiées.';$('notebook-form').before(note);

  // Personal sight/string-walking marks are entered by the archer, never predicted from distance.
  window.renderSightVisual=()=>{};
  window.updateSightCopyForBowStyle=style=>{
    $('sightHeading').textContent=style==='barebow'?'Mes repères de prise de corde':'Mes repères de viseur';
    $('sightTabButton').textContent='Mes repères';
    $('sightIntro').textContent='Saisissez vos repères réellement relevés et précisez leur unité dans les notes. Aucune valeur n’est calculée depuis la distance.';
    $('sightHelp').textContent='Une distance sans repère saisi n’est pas enregistrée.';
    $('sightScaleNote').textContent='';
    const notes=typeof els!=='undefined'?els.sightNotes:$('sightNotes');
    $('sightNotesLabel').textContent=style==='barebow'?'Notes et unité des repères de prise de corde':'Notes et unité des repères de viseur';
    if(notes)$('sightNotesLabel').append(notes);
    $('saveSightBtn').textContent='Enregistrer mes repères';
    $('sightResultHeading').textContent='Repères personnels enregistrés';
    $('sightRail').hidden=true;
    $('sightScaleSide').closest('label').hidden=true;
  };
  for(const input of $('sightMarkers').querySelectorAll('input')){
    const distance=input.id.replace('sightMark','');
    input.className='sight-mark-input';input.dataset.distance=distance;
  }
  window.ensureSightInput=distance=>{
    const key=String(distance);
    let input=[...$('sightMarkers').querySelectorAll('input')].find(el=>el.dataset.distance===key);
    if(input)return input;
    const label=document.createElement('label');label.dataset.customSight='true';label.textContent=key+' m';
    input=document.createElement('input');input.className='sight-mark-input';input.dataset.distance=key;input.type='text';
    label.append(input);$('sightMarkers').append(label);return input;
  };
  $('sightMarkers').replaceChildren();
  for(const distance of [18,30,40,50,60,70])window.ensureSightInput(distance).closest('label').removeAttribute('data-custom-sight');
  window.clearCustomSightInputs=()=>{
    $('sightMarkers').querySelectorAll('[data-custom-sight]').forEach(el=>el.remove());
    $('sightMarkers').querySelectorAll('input').forEach(input=>{input.value='';});
  };
  $('addSightDistanceBtn').addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    const distance=num('sightCustomDistance');
    if(!Number.isInteger(distance)||distance<1||distance>100){$('sightHelp').textContent='Saisissez une distance entière de 1 à 100 m.';return;}
    window.ensureSightInput(distance).focus();$('sightHelp').textContent='Saisissez le repère réellement relevé à cette distance.';
  },true);
  if(typeof currentBowStyle==='function'){
    window.updateSightCopyForBowStyle(currentBowStyle());
    window.updateArcSetupCopyForBowStyle(currentBowStyle());
  }

  const foc=document.createElement('section');foc.className='card';
  foc.innerHTML=`<h2>FOC de ma flèche terminée</h2><p>Montez tous les composants. L : du creux d’encoche à la fin du tube, sans la pointe. A : du même creux d’encoche au point d’équilibre.</p><div class="field-grid"><label>Longueur L (cm)<input id="verifiedFocLength" type="number" min="0" step="0.1"></label><label>Distance A (cm)<input id="verifiedFocBalance" type="number" min="0" step="0.1"></label></div><button type="button">Calculer le FOC</button><p role="status"></p><p>FOC (%) = 100 × (A − L/2) / L. Ce calcul décrit la position du centre de masse ; il ne valide pas le vol de la flèche. ${link('https://eastonarchery.com/foc-calculator/','Méthode Easton')}</p>`;
  $('result').after(foc);
  const updateFoc=()=>{const value=window.AssistantArcherVerifiedEngine.measuredFoc(num('verifiedFocLength'),num('verifiedFocBalance'));foc.querySelector('[role="status"]').textContent=value===null?'Renseignez une longueur positive et une distance au point d’équilibre positive ou nulle.':`FOC calculé : ${value.toFixed(1)} %. À interpréter avec vos essais au tir.`;};
  foc.querySelector('button').addEventListener('click',updateFoc);
  foc.addEventListener('input',updateFoc);
})();
