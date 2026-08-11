/* Garde-fous issus de l'audit final pour une lecture experte sans alourdir l'interface. */
(() => {
  function addDetails(panelSelector, id, title, html, afterSelector = null) {
    if (document.getElementById(id)) return;
    const panel = document.querySelector(panelSelector);
    if (!panel) return;
    const details = document.createElement('details');
    details.id = id;
    details.className = 'card notes expert-audit-note';
    details.innerHTML = `<summary>${title}</summary>${html}`;
    const after = afterSelector ? panel.querySelector(afterSelector) : null;
    if (after?.nextSibling) after.parentNode.insertBefore(details, after.nextSibling);
    else panel.appendChild(details);
  }

  function addMeasureHelp() {
    const weightLabel=document.getElementById('drawWeightLabel');
    const lengthLabel=document.getElementById('arrowLengthLabel');
    if(weightLabel && !document.getElementById('drawWeightHelp')){
      const d=document.createElement('details'); d.id='drawWeightHelp'; d.className='measurement-inline-help';
      d.innerHTML='<summary>Comment mesurer la puissance ?</summary><p><strong>Avec un peson adapte au tir a l arc</strong>, armez progressivement jusqu a votre ancrage habituel. Relevez la puissance a votre allonge normale et faites idealement 2 ou 3 mesures dans les memes conditions. Si vous debutez, faites-vous aider au club.</p><p>Pour le choix de fleche, utilisez cette <strong>puissance reellement mesuree</strong> plutot que seulement la valeur inscrite sur les branches.</p>';
      weightLabel.insertAdjacentElement('afterend',d);
    }
    if(lengthLabel && !document.getElementById('arrowLengthHelp')){
      const d=document.createElement('details'); d.id='arrowLengthHelp'; d.className='measurement-inline-help';
      d.innerHTML='<summary>Comment mesurer la longueur de fleche ?</summary><p>L application attend la longueur utilisee pour le tableau de selection : mesurez de la <strong>gorge de l encoche jusqu a l extremite du tube</strong>, sans compter la pointe. Ne confondez pas cette valeur avec votre allonge personnelle.</p><p>Si votre longueur definitive n est pas connue, faites-la determiner au club avant de couper un tube : une fleche trop courte peut etre dangereuse.</p>';
      lengthLabel.insertAdjacentElement('afterend',d);
    }
  }

  function installAuditNotes() {
    addDetails('[data-panel="spine"]','expertArrowAudit','Lecture technique du conseil fleche',`<p><strong>Le spine affiche est un point de depart, pas une mesure du spine dynamique.</strong> La selection combine les tableaux/modeles integres et des filtres de compatibilite. Pour un archer confirme, la valeur prioritaire reste celle obtenue avec la <strong>puissance reellement mesuree a l allonge</strong>, la longueur exacte du tube et le tableau du fabricant du modele choisi.</p><p>La validation finale se fait ensuite au tir : composants identiques, absence de contact, point d encochage stabilise et test fut nu repetable.</p>`,'#result');
    addDetails('[data-panel="arc-setup"]','expertBaseAudit','Priorites de reglage',`<p><strong>1. Fabricant</strong> pour le band, les limites de vis de branches et les contraintes de la poignee/branches. <strong>2. Mesure reelle</strong> pour la puissance a l allonge ; l estimation par marquage de branches reste indicative. <strong>3. Tir</strong> pour valider tiller, point d encochage, centrage et berger.</p><p>Le tiller classique +2 a +6 mm est traite ici comme une <strong>plage de depart</strong>, jamais comme une cible a +6 mm. En barebow, une valeur faible/proche de zero est egalement un point de depart, pas une norme.</p>`,'#arcSetupResult');
    addDetails('[data-panel="notebook"]','expertNotebookAudit','Conseil carnet',`<p>Pour rendre une comparaison exploitable, enregistrez toujours ensemble : arc/branches, corde, puissance mesuree, tube/spine, longueur, pointe, band, tiller, point d encochage, berger et conditions du test.</p>`);
    addDetails('[data-panel="sight"]','expertSightAudit','Conseil pour les reperes',`<p>Les reperes de viseur ou de crawl sont des <strong>mesures personnelles</strong>. En barebow, notez aussi la palette, la prise de corde et toute modification de materiel.</p>`);
  }

  function harmonizeIdentity() { document.title='Assistant Archer'; const h1=document.querySelector('.hero h1'); if(h1)h1.textContent='Assistant Archer'; const meta=document.querySelector('meta[name="theme-color"]'); if(meta&&!document.documentElement.dataset.theme)meta.setAttribute('content','#102b4e'); }
  setTimeout(() => { harmonizeIdentity(); installAuditNotes(); addMeasureHelp(); }, 250);
})();