/* Mise en page barebow harmonisee avec le reglage de base. */
(() => {
  function field(id){return document.getElementById(id)}
  function buildBarebowLayout(){
    const card=field('barebowArcSetupCard');
    if(!card||card.dataset.layoutV2==='1')return;
    card.dataset.layoutV2='1';
    card.innerHTML=`
      <h3>Reglage de base</h3>
      <p>Renseignez les mesures principales de l arc. Gardez une prise de corde identique pendant les comparaisons, puis validez les reglages au tir.</p>
      <div class="field-grid">
        <label>Band mesure (cm)
          <input id="arcBbBandMeasured" type="number" min="18" max="28" step="0.1" placeholder="Ex : 22,4" />
        </label>
        <label>Tiller mesure (mm)
          <input id="arcBbTillerMeasured" type="number" min="-8" max="12" step="0.5" placeholder="Ex : 0" />
        </label>
        <label>Detalonnage mesure (mm)
          <input id="arcBbNockingMeasured" type="number" min="0" max="20" step="0.5" placeholder="Ex : 5" />
        </label>
        <label>Point d ancrage
          <input id="arcBbAnchorPoint" type="text" maxlength="80" placeholder="Ex : index sous la commissure des levres" />
        </label>
        <label>Prise de corde / ecart sous l encoche
          <input id="arcBbStringwalk" type="text" maxlength="80" placeholder="Ex : 3 doigts dessous, repere palette" />
        </label>
        <label>Berger button
          <input id="arcBbBerger" type="text" maxlength="80" placeholder="Ex : tension moyenne" />
        </label>
        <label>Centrage de fleche
          <input id="arcBbCenterShot" type="text" maxlength="80" placeholder="Ex : pointe legerement decalee vers l exterieur" />
        </label>
      </div>
      <p><strong>Ordre conseille :</strong> alignement, band, tiller, detalonnage, centrage et berger. Modifiez une seule variable a la fois.</p>
      <input id="arcBbNockingPoint" type="hidden" />
      <input id="arcBbBraceHeight" type="hidden" />
      <input id="arcBbTiller" type="hidden" />`;
  }

  function findPowerCard(){
    return [...document.querySelectorAll('[data-panel="arc-setup"] .subcard')].find(section=>section.querySelector('h3')?.textContent.trim().toLowerCase().includes('puissance tiree estimee'))||null;
  }

  function applyMode(){
    buildBarebowLayout();
    const bare=field('bowStyle')?.value==='barebow';
    const power=findPowerCard();
    if(power){
      power.classList.remove('arc-classic-only');
      power.hidden=false;
      power.style.display='';
      const p=power.querySelector('p');
      if(p)p.innerHTML='Le calcul utilise la <strong>taille de poignee</strong>, la <strong>puissance marquee des branches</strong> et l <strong>allonge reelle</strong>. Il donne une estimation de la puissance tiree.';
    }
    const heading=field('arcSetupHeading');
    const intro=field('arcSetupIntro');
    if(bare){
      if(heading)heading.textContent='Reglage de base';
      if(intro)intro.textContent='Renseignez vos mesures pour obtenir des reperes de reglage et une estimation de la puissance tiree.';
    }
  }

  const bow=field('bowStyle');
  if(bow)bow.addEventListener('change',()=>setTimeout(applyMode,20));
  setTimeout(applyMode,250);
  setTimeout(applyMode,1200);
})();