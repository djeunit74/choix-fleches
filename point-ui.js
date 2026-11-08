(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=id=>$(id).value.trim()===''?NaN:Number($(id).value.replace(',','.'));
  const form=$('point-form'),result=$('point-result');
  let revision=0,last=null;
  const charts=fetch('verified-charts.json?v=20261021-audit-1').then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(d.version!=='2026-10-21-audit-1')throw Error();return d;}).catch(()=>null);
  const invalidate=event=>{
    revision++;last=null;$('save-point').disabled=true;$('point-save-status').textContent='';
    if(['point-brand','point-model','point-material','point-spine','point-weight','point-length','point-mass','point-insert','point-limbs'].includes(event?.target?.id))$('point-measured').checked=false;
    result.innerHTML='<h2>Vérification à lancer</h2><p>Vérifiez vos saisies puis lancez l’analyse.</p>';
  };
  form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);
  const showConditions=()=>{
    $('point-limbs').closest('label').hidden=$('point-brand').value!=='easton';
    $('point-length-help').textContent=$('point-brand').value==='skylon'?'Skylon : mesure du tube de coupe à coupe, sans encoche ni pointe.':$('point-brand').value==='victory'?'Victory : confirmez la convention « Arrow length » du document fabricant.':'Easton : du creux d’encoche à la fin du tube, sans pointe.';
    $('point-candidates').closest('label').hidden=['skylon','carbon'].includes($('point-brand').value);
  };
  $('point-brand').addEventListener('change',showConditions);showConditions();
  const describe=row=>row.status==='match'?'Votre spine figure dans la référence du tableau.':row.status==='outside'?'Votre spine est hors de la référence du tableau.':row.reason;
  form.addEventListener('submit',async event=>{
    event.preventDefault();const version=++revision;last=null;$('save-point').disabled=true;
    if(!$('point-measured').checked){result.innerHTML='<h2>Mesures à confirmer</h2><p>Confirmez la puissance mesurée, la convention de longueur et les masses réellement présentes.</p>';return;}
    const input={brand:$('point-brand').value,model:$('point-model').value.trim(),material:$('point-material').value,spine:$('point-spine').value.trim(),weight:number('point-weight'),length:number('point-length'),point:number('point-mass'),insert:number('point-insert'),limbs:$('point-limbs').value,candidates:['skylon','carbon'].includes($('point-brand').value)?[]:$('point-candidates').value.trim().split(';').filter(s=>s.trim()).map(s=>Number(s.trim().replace(',','.'))),hand:$('point-hand').value,impact:$('point-impact').value,repeatable:$('point-repeatable').checked,clearance:$('point-clearance').checked,bowStyle:currentBowStyle()};
    result.innerHTML='<p>Lecture des références…</p>';const data=await charts;if(version!==revision)return;
    if(!data){result.innerHTML='<h2>Références indisponibles</h2><p>Reconnectez-vous et rechargez l’application. Aucun résultat de remplacement n’est calculé.</p>';return;}
    const answer=window.AssistantArcherPointAdvisor.assess(data,input);
    if(!answer.ok){result.innerHTML='<h2>Saisie à compléter</h2><p>'+esc(answer.reason)+'</p>';return;}
    const source=data.sources[input.brand];
    result.innerHTML=`<h2>Ma pointe : que vérifier ?</h2><p class="answer-lead">${esc(describe(answer.current))}</p><p>${esc(input.model)} · ${esc(input.spine)} · pointe ${input.point} gr + autres composants avant ${input.insert} gr = <strong>${answer.current.total} gr à l’avant</strong>.</p>${answer.current.reference?`<p>Référence : <strong>${esc(answer.current.reference)}</strong> · ligne ${esc(answer.current.reading.row)} · colonne ${answer.current.reading.column} pouces.</p>`:''}<p>${esc(answer.pointRule||'Une concordance avec le tableau ne prouve ni le bon vol, ni la disponibilité du spine pour votre modèle, ni la compatibilité physique de la pointe. Une discordance ne démontre pas à elle seule qu’il faut changer la pointe.')}</p><h3>Décision après l’essai au tir</h3><p>${esc(answer.trial.text)}</p>${answer.candidates.length?`<h3>Les masses que vous souhaitez comparer</h3><div class="table-scroll"><table><thead><tr><th>Pointe</th><th>Total avant</th><th>Lecture du tableau</th></tr></thead><tbody>${answer.candidates.map(r=>`<tr><td>${r.point} gr</td><td>${r.total} gr</td><td>${esc(describe(r))}${r.reference?' Référence : '+esc(r.reference):''}</td></tr>`).join('')}</tbody></table></div><p>Ces masses sont vos hypothèses d’essai. Vérifiez qu’une pointe compatible existe, ainsi que les masses et limites du fabricant, avant tout montage. Aucune masse « idéale » n’est calculée.</p>`:''}<details><summary>Méthode et sources</summary><p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a> · transcription contrôlée le ${esc(data.checkedOn)}.</p><p><a href="https://eastonarchery.com/faqs/" target="_blank" rel="noopener noreferrer">Easton : effet de la masse de pointe</a> · <a href="https://eastonarchery.com/wp-content/uploads/2019/08/TuningGuideEaston.pdf" target="_blank" rel="noopener noreferrer">Guide de réglage Easton, pages 5 et 10</a>. Principes relus le 8 novembre 2026. Le test fûts nus concerne ici les arcs classiques / nus à décoche aux doigts, avec pointes de cible.</p></details>`;
    result.querySelector('h2').textContent='Comparaison avec le tableau';
    const proposal=answer.proposal;
    result.insertAdjacentHTML('afterbegin',`<section class="mass-proposal"><h2>${esc(proposal.title)}</h2><p><strong>${esc(proposal.basis)}</strong></p><p>${esc(proposal.reason)}</p>${proposal.action?`<p>${esc(proposal.action)}</p><p>Changez un seul élément à la fois. La différence de spine ne permet pas de calculer un nombre de grains à ajouter ou à retirer.</p>`:''}${proposal.options.length?`<p>Parmi vos masses de pointe comparées, <strong>${proposal.options.map(n=>esc(n)+' gr').join(' / ')}</strong> vont dans ce sens et placent votre spine dans la référence lue. Ce sont des options d’essai, après confirmation de la compatibilité des composants.</p>`:''}</section>`);
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
