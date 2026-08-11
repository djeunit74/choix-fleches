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

  function installAuditNotes() {
    addDetails('[data-panel="spine"]','expertArrowAudit','A retenir',`
      <p>Le <strong>spine propose est un point de depart</strong>. Confirmez votre choix avec le tableau du fabricant et, si possible, par un essai au tir.</p>
      <hr>
      <h3>Bien prendre les mesures</h3>
      <p><strong>Puissance a l allonge</strong> : utilisez un peson adapte au tir a l arc. Armez normalement jusqu a votre ancrage habituel et relevez la puissance indiquee. Faites idealement 2 ou 3 mesures dans les memes conditions. Pour le choix de fleche, cette mesure est plus utile que la seule puissance inscrite sur les branches.</p>
      <p><strong>Longueur de fleche</strong> : mesurez de la gorge de l encoche jusqu a l extremite du tube, sans compter la pointe. Ne confondez pas cette valeur avec votre allonge personnelle.</p>
      <p><strong>En cas de doute</strong>, faites verifier ces mesures au club avant de commander ou de couper des tubes.</p>`,'#result');
    addDetails('[data-panel="arc-setup"]','expertBaseAudit','Priorites de reglage',`<p><strong>1. Fabricant</strong> pour le band, les limites de vis de branches et les contraintes de la poignee/branches. <strong>2. Mesure reelle</strong> pour la puissance a l allonge ; l estimation par marquage de branches reste indicative. <strong>3. Tir</strong> pour valider tiller, point d encochage, centrage et berger.</p><p>Le tiller classique +2 a +6 mm est traite ici comme une <strong>plage de depart</strong>, jamais comme une cible a +6 mm. En barebow, une valeur faible/proche de zero est egalement un point de depart, pas une norme.</p>`,'#arcSetupResult');
    addDetails('[data-panel="notebook"]','expertNotebookAudit','Conseil carnet',`<p>Pour rendre une comparaison exploitable, enregistrez toujours ensemble : arc/branches, corde, puissance mesuree, tube/spine, longueur, pointe, band, tiller, point d encochage, berger et conditions du test.</p>`);
    addDetails('[data-panel="sight"]','expertSightAudit','Conseil pour les reperes',`<p>Les reperes de viseur ou de crawl sont des <strong>mesures personnelles</strong>. En barebow, notez aussi la palette, la prise de corde et toute modification de materiel.</p>`);
  }

  function harmonizeIdentity() { document.title='Assistant Archer'; const h1=document.querySelector('.hero h1'); if(h1)h1.textContent='Assistant Archer'; const meta=document.querySelector('meta[name="theme-color"]'); if(meta&&!document.documentElement.dataset.theme)meta.setAttribute('content','#102b4e'); }
  setTimeout(() => { harmonizeIdentity(); installAuditNotes(); }, 250);
})();