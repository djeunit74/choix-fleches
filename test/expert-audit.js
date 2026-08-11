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

  function installPublishButton(){
    const isTest = location.pathname.includes('/test/');
    if(!isTest) return;
    const body=document.querySelector('.app-settings-body');
    if(!body || document.getElementById('publishPublicBtn')) return;
    const block=document.createElement('div');
    block.className='app-install-setting';
    block.style.cssText='margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)';
    block.innerHTML='<p style="margin:0 0 .55rem"><strong>Version TEST</strong></p><p style="margin:.2rem 0 .65rem;font-size:.9em">Quand cette version te convient, publie-la manuellement sur la version publique.</p>';
    const btn=document.createElement('button');
    btn.type='button'; btn.id='publishPublicBtn'; btn.textContent='Publier sur public';
    btn.onclick=()=>window.open('https://github.com/djeunit74/choix-fleches/actions/workflows/publish-public.yml','_blank','noopener');
    const help=document.createElement('p');
    help.style.cssText='margin:.5rem 0 0;font-size:.85em';
    help.textContent='GitHub s ouvre : clique sur Run workflow pour confirmer la publication.';
    block.append(btn,help); body.appendChild(block);
  }

  function installAuditNotes() {
    addDetails('[data-panel="spine"]','expertArrowAudit','A retenir',`<p>Le <strong>spine propose est un point de depart</strong>. Confirmez votre choix avec le tableau du fabricant et, si possible, par un essai au tir.</p><hr><h3>Bien prendre les mesures</h3><p><strong>Puissance a l allonge</strong> : utilisez un peson adapte au tir a l arc. Armez normalement jusqu a votre ancrage habituel et relevez la puissance indiquee. Faites idealement 2 ou 3 mesures dans les memes conditions.</p><p><strong>Longueur de fleche</strong> : mesurez de la gorge de l encoche jusqu a l extremite du tube, sans compter la pointe.</p><p><strong>En cas de doute</strong>, faites verifier ces mesures au club avant de commander ou de couper des tubes.</p>`,'#result');
    addDetails('[data-panel="arc-setup"]','expertBaseAudit','Priorites de reglage',`<p><strong>Fabricant d abord</strong> pour les limites de reglage. Mesurez ensuite la puissance reelle et validez les reglages au tir.</p>`,'#arcSetupResult');
    addDetails('[data-panel="arc-setup"]','tillerGuidedTest','Test guide du tiller',`
      <p><strong>But :</strong> chercher un arc stable et reproductible, pas atteindre un chiffre impose.</p>
      <p><strong>1. Mesurez et notez le tiller actuel.</strong> En classique, une plage positive de quelques millimetres est un repere courant. En barebow, World Archery conseille de garder le tiller statique aussi faible que possible et de verifier d abord les recommandations du fabricant.</p>
      <p><strong>2. Faites une serie de reference.</strong> Gardez la meme distance, les memes fleches et la meme technique. En barebow stringwalking, utilisez un crawl intermediaire pour le reglage.</p>
      <p><strong>3. Observez.</strong> Notez la stabilite de visee, les vibrations et surtout une eventuelle sensation de bascule de la poignee dans la main. Un comportement plus concentre et moins basculant est un indice utile.</p>
      <p><strong>4. Modifiez tres peu.</strong> Ne changez qu une variable a la fois et restez sous 2 mm par essai. Recommencez la meme serie et comparez.</p>
      <p><strong>5. Controlez le point d encochage apres chaque changement.</strong> Modifier le tiller deplace sa position relative au repose-fleche ; il doit donc etre recontrole avant de conclure.</p>
      <p><strong>6. Validez.</strong> Gardez le reglage qui donne le comportement le plus regulier sur plusieurs series. Si aucune amelioration nette n apparait, revenez au reglage de reference.</p>
      <p class="muted"><strong>Sources :</strong> World Archery, Coach's Manual Level 2, sections Recurve Bow Equipment Tuning et Barebow ; recommandations fabricant de votre poignee/branches.</p>`,'#arcSetupResult');
    addDetails('[data-panel="notebook"]','expertNotebookAudit','Conseil carnet',`<p>Pour rendre une comparaison exploitable, enregistrez toujours ensemble : arc/branches, corde, puissance mesuree, tube/spine, longueur, pointe, band, tiller, point d encochage, berger et conditions du test.</p>`);
    addDetails('[data-panel="sight"]','expertSightAudit','Conseil pour les reperes',`<p>Les reperes de viseur ou de crawl sont des <strong>mesures personnelles</strong>. En barebow, notez aussi la palette, la prise de corde et toute modification de materiel.</p>`);
  }
  function harmonizeIdentity() { document.title='Assistant Archer'; const h1=document.querySelector('.hero h1'); if(h1)h1.textContent='Assistant Archer'; const meta=document.querySelector('meta[name="theme-color"]'); if(meta&&!document.documentElement.dataset.theme)meta.setAttribute('content','#102b4e'); }
  setTimeout(() => { harmonizeIdentity(); installAuditNotes(); installPublishButton(); }, 250);
})();