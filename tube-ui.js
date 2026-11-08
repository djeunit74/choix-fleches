(() => {
  'use strict';
  const $=id=>document.getElementById(id),form=$('spine-form'),result=$('result');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=id=>$(id).value.trim()===''?NaN:Number($(id).value.replace(',','.'));
  const names={easton:'Easton',victory:'Victory',skylon:'Skylon',carbon:'Carbon Express'};
  const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  let revision=0,submitted=false;
  let previousBrand=$('preferredBrand').value,previousWeightUnit=$('tube-weight-unit').value,previousLengthUnit=$('tube-length-unit').value;
  const convertField=(id,factor)=>{const value=num(id);if(Number.isFinite(value))$(id).value=String(Math.round(value*factor*1e10)/1e10);};
  const charts=fetch('verified-charts.json?v=20261021-audit-1',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(d.version!=='2026-10-21-audit-1')throw Error();return d;}).catch(()=>null);
  const description=()=>{
    const brand=$('preferredBrand').value,all=brand==='all',doc=brand==='carbon';
    if(brand!==previousBrand){
      if(previousBrand==='skylon')$('verifiedSkylonLength').value=$('arrowLength').value;
      if(previousBrand&&!(previousBrand==='easton'&&all)&&!(previousBrand==='all'&&brand==='easton')){
        $('arrowLength').value=brand==='skylon'?$('verifiedSkylonLength').value:'';
      }
      previousBrand=brand;
    }
    if($('tube-weight-unit').value!==previousWeightUnit){convertField('drawWeight',$('tube-weight-unit').value==='kg'?0.45359237:1/0.45359237);previousWeightUnit=$('tube-weight-unit').value;}
    if($('tube-length-unit').value!==previousLengthUnit){const factor=$('tube-length-unit').value==='cm'?2.54:1/2.54;convertField('arrowLength',factor);convertField('verifiedSkylonLength',factor);previousLengthUnit=$('tube-length-unit').value;}
    $('tube-measures').hidden=doc||!brand;$('tube-conditions').hidden=doc||!brand;
    $('tube-confirmation').hidden=doc||!brand;$('tube-submit').hidden=doc||!brand;
    $('tube-document').hidden=!doc;
    $('verifiedLimbs').closest('label').hidden=!all&&brand!=='easton';
    $('verifiedFront').closest('label').hidden=brand==='skylon';
    $('tube-conditions').hidden=doc||!brand||brand==='skylon';
    $('tube-skylon-extra').hidden=!all;
    const unit=$('tube-length-unit').value==='cm'?'cm':'pouces';
    $('tube-length-title').textContent=brand==='skylon'?`Longueur du tube de coupe à coupe (${unit})`:`Longueur de flèche pour le tableau (${unit})`;
    $('tube-skylon-title').textContent=`Longueur Skylon de coupe à coupe (${unit}, facultatif)`;
    $('tube-length-help').textContent=brand==='skylon'?'Mesurez le tube entre ses deux coupes, sans ajouter la pointe ou l’encoche.':brand==='victory'?'Le document Victory indique « Arrow length ». Confirmez la convention auprès du fabricant pour votre montage.':'Easton : mesurez du creux d’encoche à la fin du tube, sans la pointe.';
    if(all)$('tube-length-help').textContent+=' Victory utilise « Arrow length » : vérifiez sa convention. Skylon nécessite la mesure distincte ci-dessous.';
    $('tube-compatibility').hidden=!brand||doc||all||brand==='easton'||$('shaftMaterial').value!=='alu';
    if(doc||!brand)result.hidden=true;
  };
  const invalidate=event=>{
    revision++;$('selection-status').textContent='';
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    if(event?.target?.id!=='verifiedConvention')$('verifiedConvention').checked=false;
    if(submitted){result.hidden=false;result.innerHTML='<h2>Mesures modifiées</h2><p>Relancez la lecture pour obtenir un résultat correspondant à vos nouvelles saisies.</p>';}
    description();
  };
  form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);
  result.addEventListener('click',e=>{if(e.target.closest('[data-open-point]'))setActiveTab('point');});
  description();
  form.addEventListener('submit',async event=>{
    event.preventDefault();event.stopImmediatePropagation();const current=++revision;
    const input={brand:$('preferredBrand').value,material:$('shaftMaterial').value,weight:num('drawWeight'),weightUnit:$('tube-weight-unit').value,length:num('arrowLength'),skylonLength:num('verifiedSkylonLength'),lengthUnit:$('tube-length-unit').value,front:num('verifiedFront'),limbs:$('verifiedLimbs').value};
    $('selection-status').textContent='Chargement des tableaux…';
    const data=await charts;if(current!==revision)return;
    if(!data){$('selection-status').textContent='Tableaux indisponibles. Reconnectez-vous puis rechargez la page ; aucun résultat de remplacement n’est utilisé.';return;}
    const answer=window.AssistantArcherTubeSelector.evaluate(data,input);
    if(!answer.ok){$('selection-status').textContent=answer.message;for(const id of answer.fields)$(id)?.setAttribute('aria-invalid','true');$(answer.fields[0])?.focus();return;}
    if(answer.documentOnly){$('selection-status').textContent='Consultez le document Carbon Express ci-dessus : aucune lecture automatique n’est disponible.';return;}
    if(!$('verifiedConvention').checked){$('selection-status').textContent='Confirmez vos mesures et les conditions du tableau.';$('verifiedConvention').focus();return;}
    submitted=true;$('selection-status').textContent='';result.hidden=false;
    const heading=answer.count?input.brand==='all'?`${answer.count} référence(s) disponible(s)`:'Votre référence de départ':'Aucun résultat exploitable pour ces mesures';
    result.innerHTML=`<h2>${heading}</h2><p class="tube-result-summary">Puissance utilisée : ${answer.measurements.weight.toLocaleString('fr-FR',{maximumFractionDigits:4})} lb${input.brand==='skylon'?' · longueur cut-to-cut : '+answer.measurements.skylonLength.toLocaleString('fr-FR',{maximumFractionDigits:4})+' pouces':''}.</p>`+answer.records.map(({brand,material,reading:r})=>{
      const source=data.sources[brand];
      return `<section class="tube-reading ${r.ok?'is-readable':'is-unavailable'}"><h3>${esc(names[brand])}${brand==='easton'?' · '+(material==='alu'?'aluminium':'carbone / aluminium-carbone'):''}</h3>${r.ok?`<p class="tube-reference">${esc(r.value)}</p><p>${esc(r.kind)}</p><details><summary>Comprendre cette lecture</summary><p>Ligne ${esc(r.row)} · colonne ${r.column} pouces${Number.isFinite(r.adjusted)?` · puissance corrigée pour ce tableau : ${r.adjusted.toLocaleString('fr-FR')} lb`:''}.</p><p>${brand==='easton'?'Easton arrondit la longueur à la colonne la plus proche, avec le demi-pouce vers le haut. Les limites de puissance ne sont pas interpolées.':brand==='skylon'?'Longueur de coupe à coupe. Aucun arrondi de longueur non publié n’est appliqué.':'Aucune interpolation de longueur ou de masse avant entre les bandes publiées.'}</p>${r.models?'<h4>Tailles citées dans ce groupe</h4><ul>'+r.models.map(([name,spines])=>`<li>${esc(name)} : ${spines.map(esc).join(' / ')}</li>`).join('')+'</ul>':''}</details>`:`<p><strong>Lecture indisponible</strong> — ${esc(r.reason)}</p>`}<p class="tube-source">${link(source.url,'Ouvrir le tableau '+names[brand])} · transcription contrôlée le ${esc(data.checkedOn)}</p></section>`;
    }).join('')+`<p class="tube-result-limit">Un tableau donne une base de choix. Vérifiez que le modèle existe dans cette taille et que ses composants sont compatibles, puis confirmez le montage au tir. Un code aluminium n’est pas un spine carbone.</p>${answer.count?'<button type="button" class="secondary-action" data-open-point>Vérifier ensuite la pointe de mon tube</button>':''}`;
    result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});
  },true);
})();
