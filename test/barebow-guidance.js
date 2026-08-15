/* Barebow : mise en page et textes specifiques. Le formulaire de reglage de base reste commun au classique. */
(() => {
  function field(id){ return document.getElementById(id); }
  function setupCard(){ return field('upperTiller')?.closest('.subcard') || null; }
  function powerCard(){ return field('riserLength')?.closest('.subcard') || null; }

  function setLabelText(input, text){
    const label=input?.closest('label');
    if(!label)return;
    const node=Array.from(label.childNodes).find(item=>item.nodeType===Node.TEXT_NODE&&item.textContent.trim());
    if(node)node.textContent=`\n                ${text}\n                `;
  }

  function applySightCopy(isBarebow){
    const tab=field('sightTabButton');
    if(tab)tab.textContent=isBarebow?'Repere palette':'Reperes';
    const form=field('sight-form');
    if(!form)return;
    const title=form.querySelector('.subcard h3');
    const equipment=field('sightEquipment');
    const notes=field('sightNotes');
    if(isBarebow){
      if(title)title.textContent='Fiche barebow';
      if(equipment){setLabelText(equipment,'Arc / materiel barebow');equipment.placeholder='Ex : WNS / Hoyt / palette / berger button';}
      if(notes)notes.placeholder='Ex : crawl 30 m, repere palette, prise de corde, sensations...';
    }else{
      if(title)title.textContent='Fiche viseur';
      if(equipment){setLabelText(equipment,'Viseur / arc');equipment.placeholder='Ex : Shibuya / viseur club / WNS';}
      if(notes)notes.placeholder='Ex : verifier 50 m avec vent de face, lumiere faible, changement de pointe...';
    }
  }

  function applyBarebowLayout(){
    const isBarebow=field('bowStyle')?.value==='barebow';
    const setup=setupCard();
    const power=powerCard();
    const legacy=field('barebowArcSetupCard');

    applySightCopy(isBarebow);

    [setup,power].forEach(card=>{
      if(!card)return;
      card.classList.remove('arc-classic-only');
      card.hidden=false;
      card.removeAttribute('hidden');
      card.style.removeProperty('display');
    });
    if(legacy?.isConnected)legacy.remove();

    if(!isBarebow)return;

    const heading=field('arcSetupHeading');
    const intro=field('arcSetupIntro');
    const ref=field('arcSetupDocRef');
    if(heading)heading.textContent='Reglage de base';
    if(intro)intro.textContent="Renseignez les mesures de l'arc puis lancez le calcul. L'interpretation est adaptee au barebow.";
    if(ref)ref.innerHTML='References barebow : <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> pour l equipement et le stringwalking, et <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery Coaching Manual Level 2</a> pour les principes de band, tiller, berger button, detalonnage et affinage au tir.';

    const setupIntro=setup?.querySelector('p');
    if(setupIntro)setupIntro.innerHTML='Le <strong>band</strong> depend surtout de la taille d arc. Le <strong>tiller</strong> se calcule avec les deux distances corde / branches. Une valeur faible sert de point de depart, puis le reglage se valide au tir.';

    const powerIntro=power?.querySelector('p');
    if(powerIntro)powerIntro.innerHTML='Le calcul utilise la <strong>taille de poignee</strong>, la <strong>puissance marquee des branches</strong> et l <strong>allonge reelle</strong> pour estimer la puissance tiree.';
  }

  function syncBarebowMeasuredValues(){
    if(field('bowStyle')?.value!=='barebow'||typeof els==='undefined')return;
    const brace=String(field('braceMeasured')?.value||'').trim();
    const upperRaw=String(field('upperTiller')?.value||'').trim();
    const lowerRaw=String(field('lowerTillerMeasured')?.value||'').trim();
    const upper=upperRaw?Number(upperRaw):NaN;
    const lower=lowerRaw?Number(lowerRaw):NaN;
    if(els.arcBbBandMeasured)els.arcBbBandMeasured.value=brace||'+';
    if(els.arcBbTillerMeasured)els.arcBbTillerMeasured.value=Number.isFinite(upper)&&Number.isFinite(lower)?String(Math.round((upper-lower)*10)/10):'+';
    if(els.arcBbNockingMeasured&&!String(els.arcBbNockingMeasured.value||'').trim())els.arcBbNockingMeasured.value='+';
  }

  function ensureBarebowEstimatedPower(){
    if(field('bowStyle')?.value!=='barebow')return;
    const result=field('arcSetupResult');
    if(!result||result.querySelector('[data-barebow-estimated-power]'))return;
    const riser=Number(field('riserLength')?.value);
    const limbs=Number(field('limbMarkedWeight')?.value);
    const draw=Number(field('drawLengthForWeight')?.value);
    if(![riser,limbs,draw].every(Number.isFinite))return;
    const riserAdjust=riser===23?2:riser===27?-2:0;
    const drawAdjust=(draw-28)*2;
    const estimated=Math.round((limbs+riserAdjust+drawAdjust)*10)/10;
    const section=document.createElement('section');
    section.className='subcard';
    section.dataset.barebowEstimatedPower='1';
    section.innerHTML=`
      <h3>Puissance tiree estimee</h3>
      <p><strong>Puissance tiree estimee</strong> : ${estimated.toFixed(1)} lbs</p>
      <p><strong>Base du calcul</strong> : poignee ${riser}\" + branches ${limbs} lbs + allonge ${draw.toFixed(2)}\".</p>
      <p><strong>Note</strong> : le band et le tiller n entrent pas directement dans ce calcul. Une modification des vis de branches peut toutefois faire varier la puissance ressentie.</p>`;
    result.appendChild(section);
  }

  field('arc-setup-form')?.addEventListener('submit',()=>{
    syncBarebowMeasuredValues();
    setTimeout(ensureBarebowEstimatedPower,0);
  },true);
  field('bowStyle')?.addEventListener('change',()=>{
    applyBarebowLayout();
    requestAnimationFrame(applyBarebowLayout);
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-tab="arc-setup"], [data-tab="sight"]'))setTimeout(applyBarebowLayout,0);
  });

  applyBarebowLayout();
  requestAnimationFrame(applyBarebowLayout);
})();