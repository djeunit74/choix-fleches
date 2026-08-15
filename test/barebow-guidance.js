/* Barebow : presentation, sources officielles et interpretation prudente. Le formulaire de base reste commun au classique. */
(() => {
  function field(id){ return document.getElementById(id); }
  function setupCard(){ return field('upperTiller')?.closest('.subcard') || null; }
  function powerCard(){ return field('riserLength')?.closest('.subcard') || null; }

  function setLabelText(input,text){
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
    if(heading)heading.textContent='Reglage de base barebow';
    if(intro)intro.textContent="Reglez d'abord une base mecanique reproductible. Les valeurs de depart doivent ensuite etre validees au tir, notamment avec le stringwalking.";
    if(ref)ref.innerHTML='<strong>References officielles :</strong> <a href="https://www.worldarchery.sport/fr/sport/equipment/barebow" target="_blank" rel="noopener noreferrer">World Archery - Arc nu</a> pour le materiel et la technique barebow ; <a href="https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf" target="_blank" rel="noopener noreferrer">World Archery Coaching Manual Level 2</a> pour le reglage et l affinage. Les valeurs numeriques affichees par l app sont des bases de travail, pas des prescriptions World Archery.';

    const setupIntro=setup?.querySelector('p');
    if(setupIntro)setupIntro.innerHTML='<strong>Base mecanique</strong> : band, tiller et detalonnage. Le but est d obtenir un point de depart stable avant les tests au tir. En barebow, le stringwalking modifie les contraintes sur l arc selon le crawl : validez donc le comportement a plusieurs distances.';
    const powerIntro=power?.querySelector('p');
    if(powerIntro)powerIntro.innerHTML='<strong>Puissance tiree</strong> : estimation a partir de la poignee, de la puissance marquee des branches et de l allonge reelle. Une allonge constante est essentielle pour conserver une force et un comportement de fleche reproductibles.';
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
    const riser=Number(field('riserLength')?.value),limbs=Number(field('limbMarkedWeight')?.value),draw=Number(field('drawLengthForWeight')?.value);
    if(![riser,limbs,draw].every(Number.isFinite))return;
    const estimated=Math.round((limbs+(riser===23?2:riser===27?-2:0)+(draw-28)*2)*10)/10;
    const section=document.createElement('section');
    section.className='subcard';section.dataset.barebowEstimatedPower='1';
    section.innerHTML=`<h3>Puissance tiree estimee</h3><p><strong>Estimation</strong> : ${estimated.toFixed(1)} lbs</p><p><strong>Donnees</strong> : poignee ${riser}\", branches ${limbs} lbs, allonge ${draw.toFixed(2)}\".</p><p><small>Estimation pratique : une mesure au peson reste la reference pour connaitre la puissance reelle a votre allonge.</small></p>`;
    result.appendChild(section);
  }

  function professionalizeBarebowResult(){
    if(field('bowStyle')?.value!=='barebow')return;
    const result=field('arcSetupResult');
    if(!result)return;
    /* Ne jamais transformer une donnee absente en mesure utilisateur. */
    result.querySelectorAll('p,li').forEach(node=>{
      const text=node.textContent.toLowerCase();
      if(text.includes('non renseigne')||text.includes('non renseigné'))node.remove();
    });
    if(result.querySelector('[data-barebow-method]'))return;
    const section=document.createElement('section');
    section.className='subcard';section.dataset.barebowMethod='1';
    section.innerHTML=`
      <h3>Methode de reglage barebow</h3>
      <p><strong>1. Base mecanique</strong> : stabilisez band, tiller et detalonnage avant de chercher un affinage fin.</p>
      <p><strong>2. Technique reproductible</strong> : gardez une allonge et un ancrage constants. World Archery souligne que la regularite de l allonge est essentielle en barebow.</p>
      <p><strong>3. Stringwalking</strong> : controlez le comportement sur plusieurs crawls/distances ; la position des doigts change les contraintes appliquees a la corde et au repose-fleche.</p>
      <p><strong>4. Reglage dynamique</strong> : affinez ensuite centrage, berger button et comportement de la fleche au tir. Le Coaching Manual indique que le pressure button se regle selon les memes principes de base qu en recurve.</p>
      <p><small><strong>Important :</strong> l app distingue les regles World Archery des valeurs de depart de tuning. Les recommandations numeriques restent des points de depart a confirmer au tir, avec un entraineur si possible.</small></p>`;
    result.appendChild(section);
  }

  field('arc-setup-form')?.addEventListener('submit',()=>{
    syncBarebowMeasuredValues();
    setTimeout(()=>{ensureBarebowEstimatedPower();professionalizeBarebowResult();},0);
  },true);
  field('bowStyle')?.addEventListener('change',()=>{applyBarebowLayout();requestAnimationFrame(applyBarebowLayout);});
  document.addEventListener('click',event=>{if(event.target.closest('[data-tab="arc-setup"], [data-tab="sight"]'))setTimeout(applyBarebowLayout,0);});
  applyBarebowLayout();requestAnimationFrame(applyBarebowLayout);
})();