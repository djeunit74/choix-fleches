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
    addDetails('[data-panel="spine"]','expertArrowAudit','Lecture technique du conseil fleche',`
      <p><strong>Le spine affiche est un point de depart, pas une mesure du spine dynamique.</strong> La selection combine les tableaux/modeles integres et des filtres de compatibilite. Pour un archer confirme, la valeur prioritaire reste celle obtenue avec la <strong>puissance reellement mesuree a l allonge</strong>, la longueur exacte du tube et le tableau du fabricant du modele choisi.</p>
      <p>La validation finale se fait ensuite au tir : composants identiques, absence de contact, point d encochage stabilise et test fut nu repetable. Une recommandation de tube ne doit pas etre forcee pour faire correspondre un resultat de test instable.</p>`,'#result');

    addDetails('[data-panel="arc-setup"]','expertBaseAudit','Priorites de reglage',`
      <p><strong>1. Fabricant</strong> pour le band, les limites de vis de branches et les contraintes de la poignee/branches. <strong>2. Mesure reelle</strong> pour la puissance a l allonge ; l estimation par marquage de branches reste indicative. <strong>3. Tir</strong> pour valider tiller, point d encochage, centrage et berger.</p>
      <p>Le tiller classique +2 a +6 mm est traite ici comme une <strong>plage de depart</strong>, jamais comme une cible a +6 mm. En barebow, une valeur faible/proche de zero est egalement un point de depart, pas une norme.</p>`,'#arcSetupResult');

    addDetails('[data-panel="notebook"]','expertNotebookAudit','Conseil carnet',`
      <p>Pour rendre une comparaison exploitable, enregistrez toujours ensemble : arc/branches, corde, puissance mesuree, tube/spine, longueur, pointe, band, tiller, point d encochage, berger et conditions du test. Une valeur isolee est difficile a comparer plusieurs semaines plus tard.</p>`);

    addDetails('[data-panel="sight"]','expertSightAudit','Conseil pour les reperes',`
      <p>Les reperes de viseur ou de crawl sont des <strong>mesures personnelles</strong>. Ne deduisez pas automatiquement un repere intermediaire si la courbe de votre configuration n a pas ete verifiee au tir. En barebow, notez aussi la palette, la prise de corde et toute modification de materiel.</p>`);
  }

  function harmonizeIdentity() {
    document.title = 'Assistant Archer';
    const h1 = document.querySelector('.hero h1');
    if (h1) h1.textContent = 'Assistant Archer';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && !document.documentElement.dataset.theme) meta.setAttribute('content','#102b4e');
  }

  setTimeout(() => { harmonizeIdentity(); installAuditNotes(); }, 250);
})();