(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=id=>$(id).value.trim()===''?NaN:Number($(id).value.replace(',','.'));
  const form=$('point-form'),result=$('point-result');
  let revision=0,last=null,submitted=false;
  const saveActions=$('save-point').closest('.point-actions');
  const charts=fetch('verified-charts.json?v=20261021-audit-1').then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(d.version!=='2026-10-21-audit-1')throw Error();return d;}).catch(()=>null);
  const invalidate=event=>{
    revision++;last=null;$('save-point').disabled=true;$('point-save-status').textContent='';
    saveActions.hidden=true;
    if(['point-brand','point-model','point-material','point-spine','point-weight','point-length','point-mass','point-insert','point-limbs'].includes(event?.target?.id))$('point-measured').checked=false;
    result.hidden=!submitted;
    result.innerHTML='<h2>Saisies modifiées</h2><p>Relancez la comparaison pour actualiser le résultat.</p>';
  };
  form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);
  const showConditions=()=>{
    const brand=$('point-brand').value,documentOnly=brand==='carbon',hasForm=!!brand&&!documentOnly;
    const first=form.querySelector('fieldset');
    first.querySelectorAll('label').forEach(label=>{label.hidden=!label.contains($('point-brand'))&&!hasForm;});
    form.querySelectorAll('fieldset').forEach((fieldset,index)=>{if(index>0)fieldset.hidden=!hasForm;});
    $('point-limbs').closest('label').hidden=brand!=='easton';
    $('point-length-help').hidden=!hasForm;
    $('point-length-help').nextElementSibling.hidden=!hasForm;
    $('point-length-help').textContent=brand==='skylon'?'Skylon : tube mesuré de coupe à coupe, sans encoche ni pointe.':brand==='victory'?'Victory : confirmez la convention « Arrow length » du fabricant.':'Easton : du creux d’encoche à la fin du tube, sans pointe.';
    $('point-options').hidden=!hasForm||brand==='skylon';
    form.querySelector('.trial-details').hidden=!hasForm;
    $('point-measured').closest('label').hidden=!hasForm;
    form.querySelector('button[type="submit"]').hidden=!hasForm;
    $('point-document').hidden=!documentOnly;
  };
  const documentBlock=document.createElement('p');documentBlock.id='point-document';documentBlock.hidden=true;
  documentBlock.innerHTML='Carbon Express : les codes ambigus empêchent une comparaison automatique. <a href="https://thecarbonexpress.com/wp-content/uploads/2024/11/recurve-series-arrow-selection-chart.pdf" target="_blank" rel="noopener noreferrer">Consulter le document fabricant</a>.';
  form.querySelector('fieldset').append(documentBlock);
  $('point-brand').addEventListener('change',showConditions);showConditions();
  const describe=row=>row.status==='match'?'Votre spine figure dans la référence du tableau.':row.status==='outside'?'Votre spine est hors de la référence du tableau.':row.reason;
  form.addEventListener('submit',async event=>{
    event.preventDefault();const version=++revision;last=null;submitted=true;result.hidden=false;saveActions.hidden=true;$('save-point').disabled=true;
    if(!$('point-measured').checked){result.innerHTML='<h2>Mesures à confirmer</h2><p>Confirmez la puissance mesurée, la convention de longueur et les masses réellement présentes.</p>';return;}
    const input={brand:$('point-brand').value,model:$('point-model').value.trim(),material:$('point-material').value,spine:$('point-spine').value.trim(),weight:number('point-weight'),length:number('point-length'),point:number('point-mass'),insert:number('point-insert'),limbs:$('point-limbs').value,candidates:['skylon','carbon'].includes($('point-brand').value)?[]:$('point-candidates').value.trim().split(';').filter(s=>s.trim()).map(s=>Number(s.trim().replace(',','.'))),hand:$('point-hand').value,impact:$('point-impact').value,repeatable:$('point-repeatable').checked,clearance:$('point-clearance').checked,bowStyle:currentBowStyle()};
    result.innerHTML='<p>Lecture des références…</p>';const data=await charts;if(version!==revision)return;
    if(!data){result.innerHTML='<h2>Références indisponibles</h2><p>Reconnectez-vous et rechargez l’application. Aucun résultat de remplacement n’est calculé.</p>';return;}
    const answer=window.AssistantArcherPointAdvisor.assess(data,input);
    if(!answer.ok){result.innerHTML='<h2>Saisie à compléter</h2><p>'+esc(answer.reason)+'</p>';return;}
    const source=data.sources[input.brand];
    const proposal=answer.proposal;
    const next={heavier:'Essayez une masse avant plus lourde avec des composants compatibles, puis contrôlez au tir.',lighter:'Essayez une pointe plus légère compatible, puis contrôlez au tir.',keep:'Gardez cette base et comparez vos groupements au tir.',unknown:'Complétez les mesures ou reprenez un essai régulier avant de modifier.',conflict:'Revérifiez mesures, latéralité et contacts avant de modifier le montage.'}[proposal.kind];
    result.innerHTML=`<h2>${esc(proposal.title)}</h2><p class="field-hint">${esc(proposal.basis)}</p><p class="answer-lead">${esc(describe(answer.current))}</p><p><strong>Prochaine étape :</strong> ${esc(next)}</p><p class="field-hint">Le tableau ne valide pas la compatibilité physique des pièces. Respectez les masses et limites du fabricant.</p>
      ${answer.candidates.length?`<details open><summary>Mes masses comparées (${answer.candidates.length})</summary><div class="table-scroll"><table><thead><tr><th>Pointe</th><th>Total avant</th><th>Tableau</th></tr></thead><tbody>${answer.candidates.map(r=>`<tr><td>${r.point} gr</td><td>${r.total} gr</td><td>${esc(describe(r))}${r.reference?' Référence : '+esc(r.reference):''}</td></tr>`).join('')}</tbody></table></div><p>Ce sont vos hypothèses d’essai, sans masse idéale calculée.</p>${proposal.options.length?`<p>Options dans le sens proposé et dans la référence lue : ${proposal.options.map(n=>n+' gr').join(' / ')}. Confirmez la compatibilité avant tout essai.</p>`:''}</details>`:''}
      <details><summary>Pourquoi ce résultat ?</summary><p>${esc(proposal.reason)}</p>${proposal.action?`<p>${esc(proposal.action)}</p><p>Changez un seul élément à la fois. Aucun nombre de grains à ajouter ou retirer ne se déduit de l’écart de spine.</p>`:''}<p>${esc(answer.trial.text)}</p>${answer.pointRule?'<p>'+esc(answer.pointRule)+'</p>':''}</details>
      <details><summary>Mesures utilisées et sources</summary><p>${esc(input.model)} · spine / code ${esc(input.spine)} · pointe ${input.point} gr + autres composants avant ${input.insert} gr = ${answer.current.total} gr à l’avant.</p>${answer.current.reference?`<p>Référence : ${esc(answer.current.reference)} · ligne ${esc(answer.current.reading.row)} · colonne ${answer.current.reading.column} pouces.</p>`:''}<p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a> · transcription contrôlée le ${esc(data.checkedOn)}.</p><p><a href="https://eastonarchery.com/faqs/" target="_blank" rel="noopener noreferrer">Effet de la masse de pointe — Easton</a> · <a href="https://eastonarchery.com/wp-content/uploads/2019/08/TuningGuideEaston.pdf" target="_blank" rel="noopener noreferrer">Guide de réglage Easton, pages 5 et 10</a>. Principes relus le 8 novembre 2026. Essais pour arcs classiques / nus à décoche aux doigts avec pointes de cible.</p></details>`;
    saveActions.hidden=false;
    result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});
    last={input,answer};$('save-point').disabled=false;
  });
  $('save-point').addEventListener('click',()=>{
    if(!last)return;
    const {input,answer}=last;
    try {
      const entries=readNotebook();if(!Array.isArray(entries)||entries.length>=50)throw Error('Carnet plein ou illisible : exportez-le avant de continuer.');
      const now=new Date();
      writeNotebook([{id:'point-'+now.getTime(),date:todayIsoDate(),title:'Pointe — '+input.model,arrowBrand:input.brand,arrowModel:input.model,arrowSpine:input.spine,arrowLength:input.length+' pouces',pointWeight:input.point+' gr',estimatedWeight:input.weight+' lb mesurées',notes:(answer.proposal.title+' — '+answer.proposal.basis+'. '+answer.proposal.reason+' '+(answer.proposal.action||'')+' Autres composants avant : '+input.insert+' gr. '+describe(answer.current)).slice(0,1000),updatedAt:now.toISOString()},...entries]);
      $('point-save-status').textContent='Vérification enregistrée dans Mon carnet.';
    }catch(e){$('point-save-status').textContent=e.message||'Enregistrement impossible. Exportez une sauvegarde.';}
  });
  // A bow-style change also changes the interpretation of the trial.
  $('bowStyle').addEventListener('change',invalidate);
})();
