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

    /* Un seul formulaire de saisie pour classique et barebow. */
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

  function optionalNumber(value){
    const raw=String(value??'').trim();
    if(!raw||raw==='.'||raw==='+'||raw==='-')return null;
    const number=Number(raw.replace(',','.').replace(/[^\d.+-]/g,''));
    return Number.isFinite(number)?number:null;
  }

  function safeText(value){
    if(typeof escapeHtml==='function')return escapeHtml(value);
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  /* Le moteur historique lit encore ses champs internes barebow. Avant le calcul, on les
     synchronise avec les mesures visibles. Un champ non renseigne utilise un marqueur qui ne
     peut pas etre interprete comme 0. */
  function syncBarebowMeasuredValues(){
    if(field('bowStyle')?.value!=='barebow'||typeof els==='undefined')return;
    const brace=String(field('braceMeasured')?.value||'').trim();
    const upperRaw=String(field('upperTiller')?.value||'').trim();
    const lowerRaw=String(field('lowerTillerMeasured')?.value||'').trim();
    const upper=upperRaw?Number(upperRaw):NaN;
    const lower=lowerRaw?Number(lowerRaw):NaN;
    if(els.arcBbBandMeasured)els.arcBbBandMeasured.value=brace||'.';
    if(els.arcBbTillerMeasured)els.arcBbTillerMeasured.value=Number.isFinite(upper)&&Number.isFinite(lower)?String(Math.round((upper-lower)*10)/10):'.';
    if(els.arcBbNockingMeasured&&!optionalNumber(els.arcBbNockingMeasured.value))els.arcBbNockingMeasured.value='.';
  }

  function refineBarebowResult(input){
    if(field('bowStyle')?.value!=='barebow')return;
    const result=field('arcSetupResult');
    if(!result)return;
    const bb=typeof barebowArcSetupData==='function'?barebowArcSetupData():{};
    const brace=Number.isFinite(input?.braceMeasured)?input.braceMeasured:null;
    const upper=Number(input?.upperTiller);
    const lower=Number(input?.lowerTillerMeasured);
    const tiller=Number.isFinite(upper)&&Number.isFinite(lower)?Math.round((upper-lower)*10)/10:null;
    const nocking=optionalNumber(bb.nockingMeasured);

    const cards=[...result.querySelectorAll('.subcard')];
    const cardByTitle=title=>cards.find(card=>card.querySelector('h3')?.textContent.trim()===title);
    const fiche=cardByTitle('Fiche actuelle');
    const mechanical=cardByTitle('Base mecanique');
    const orientation=cardByTitle('Orientation claire des reglages');

    if(fiche){
      const measurements=[...fiche.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('Mesures relevees'));
      if(measurements){
        const parts=[];
        if(Number.isFinite(brace))parts.push(`band ${brace.toFixed(1)} cm`);
        if(Number.isFinite(tiller))parts.push(`tiller ${tiller.toFixed(1)} mm`);
        if(Number.isFinite(nocking))parts.push(`detalonnage ${nocking.toFixed(1)} mm`);
        measurements.innerHTML=parts.length?`<strong>Mesures relevees</strong> : ${parts.join(' | ')}`:'<strong>Mesures relevees</strong> : aucune mesure optionnelle renseignee';
      }
      [...fiche.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('Technique'))?.remove();
    }

    if(mechanical){
      const nockingGuide=[...mechanical.querySelectorAll('p')].find(p=>p.textContent.trim().startsWith('Detalonnage guide'));
      if(nockingGuide)nockingGuide.innerHTML='<strong>Detalonnage de depart</strong> : +5 a +6 mm (base pratique, a valider au tir)';
    }

    result.querySelector('.aa-barebow-technique')?.remove();
    const technique=[];
    if(String(bb.anchorPoint||'').trim())technique.push(`<p><strong>Ancrage</strong> : ${safeText(bb.anchorPoint)}</p>`);
    if(String(bb.stringwalk||'').trim())technique.push(`<p><strong>Prise de corde / stringwalking</strong> : ${safeText(bb.stringwalk)}</p>`);
    if(technique.length&&mechanical){
      const section=document.createElement('section');
      section.className='subcard aa-barebow-technique';
      section.innerHTML=`<h3>Technique de tir</h3>${technique.join('')}`;
      mechanical.insertAdjacentElement('afterend',section);
    }

    if(orientation){
      [...orientation.querySelectorAll('p')].forEach(p=>{
        const text=p.textContent.trim();
        if(text.startsWith('Band')&&!Number.isFinite(brace))p.remove();
        if(text.startsWith('Detalonnage')){
          if(!Number.isFinite(nocking))p.remove();
          else p.innerHTML=`<strong>Detalonnage</strong> : ${nocking.toFixed(1)} mm | base de depart +5 a +6 mm | valider au tir avant toute autre correction.`;
        }
      });
    }
  }

  const previousBarebowRender=typeof window.renderBarebowArcSetup==='function'?window.renderBarebowArcSetup:null;
  if(previousBarebowRender){
    window.renderBarebowArcSetup=function(input){
      syncBarebowMeasuredValues();
      const response=previousBarebowRender(input);
      refineBarebowResult(input);
      return response;
    };
  }

  field('arc-setup-form')?.addEventListener('submit',syncBarebowMeasuredValues,true);
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