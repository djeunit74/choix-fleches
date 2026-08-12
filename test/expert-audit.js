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

  const WA_MANUAL='https://extranet.worldarchery.sport/documents/index.php/Coaches/Accreditation/Coaching_Levels/Coaching_Manual_Level2.pdf';
  const WA_COACHING='https://www.worldarchery.sport/sport/education/coaching';
  const HOYT='https://hoyt.com/pages/target-recurve-safety-and-warnings';

  function setDetailsContent(id,title,html){
    const d=document.getElementById(id); if(!d) return;
    d.innerHTML=`<summary>${title}</summary>${html}`;
  }

  function renderArcSpecificGuides(){
    const style=document.getElementById('bowStyle')?.value || 'classique';
    const isBarebow=style==='barebow';

    if(!isBarebow){
      setDetailsContent('expertBaseAudit','1. Priorites de reglage — Classique',`
        <p><strong>Ordre conseille :</strong> montage correct, alignement mecanique des branches et de la corde, repose-fleche, puis band et tiller. Ensuite viennent le point d encochage, le centrage avec le berger et enfin la validation au tir.</p>
        <p>Si un probleme d alignement est visible, ne le compensez pas avec le berger : corrigez d abord la cause mecanique.</p>
        <p class="muted"><strong>Sources :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Coach's Manual Level 2</a> · <a href="${WA_COACHING}" target="_blank" rel="noopener noreferrer">World Archery — Coaching</a></p>`);

      setDetailsContent('alignmentGuidedCheck','2. Alignements et montage — Classique',`
        <p><strong>1. Branches.</strong> Verifiez qu elles sont correctement engagees dans la poignee. Si votre poignee possede un reglage lateral des branches, utilisez uniquement la procedure du fabricant.</p>
        <p><strong>2. Corde.</strong> Arc bande, regardez depuis l arriere dans l axe de la corde. Elle doit suivre un axe coherent avec les branches et la poignee.</p>
        <p><strong>3. Repose-fleche.</strong> Le tube doit etre correctement soutenu, sans contrainte excessive ni contact parasite visible.</p>
        <p><strong>4. Centrage initial.</strong> Avec un berger, partez d un centrage simple et coherent ; la pointe peut etre tres legerement decalee vers l exterieur comme point de depart. Le reglage final se valide au tir.</p>
        <p><strong>5. Ordre.</strong> Alignement mecanique d abord, berger ensuite. Une seule correction a la fois.</p>
        <p class="muted"><strong>Sources :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Recurve Bow Equipment Tuning</a> · <a href="${HOYT}" target="_blank" rel="noopener noreferrer">Hoyt — documentation recurve</a></p>`);

      setDetailsContent('tillerGuidedTest','3. Tiller : reglage et test — Classique',`
        <p><strong>But :</strong> obtenir un arc stable et reproductible, pas atteindre une valeur imposee.</p>
        <p><strong>1. Mesurez le tiller actuel.</strong> Une petite valeur positive constitue un point de depart courant en classique ; respectez en priorite les limites et recommandations du fabricant.</p>
        <p><strong>2. Tirez une serie de reference.</strong> Meme distance, memes fleches, meme technique.</p>
        <p><strong>3. Observez.</strong> Stabilite en visee, vibrations, bruit et eventuelle bascule de la poignee.</p>
        <p><strong>4. Ajustez tres peu.</strong> Une seule variable a la fois, par petites corrections inferieures a 2 mm, puis recommencez la meme serie.</p>
        <p><strong>5. Recontrolez le point d encochage</strong> apres toute modification du tiller.</p>
        <p><strong>6. Gardez le meilleur compromis</strong> sur plusieurs series, pas simplement la valeur la plus proche d un chiffre theorique.</p>
        <p class="muted"><strong>Source :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Coach's Manual Level 2, Recurve Bow Equipment Tuning</a></p>`);
    } else {
      setDetailsContent('expertBaseAudit','1. Priorites de reglage — Barebow',`
        <p><strong>Ordre conseille :</strong> montage et alignement mecanique, band, tiller de depart adapte au barebow, point d encochage, centrage/repose-fleche et berger, puis validation au tir.</p>
        <p>Le stringwalking modifie la charge appliquee aux branches : ne transposez pas automatiquement les valeurs de tiller du classique viseur au barebow.</p>
        <p class="muted"><strong>Sources :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Coach's Manual Level 2, Barebow</a> · <a href="${WA_COACHING}" target="_blank" rel="noopener noreferrer">World Archery — Coaching</a></p>`);

      setDetailsContent('alignmentGuidedCheck','2. Alignements et montage — Barebow',`
        <p><strong>1. Branches.</strong> Verifiez leur engagement correct dans la poignee et l alignement lateral selon la procedure du fabricant.</p>
        <p><strong>2. Corde.</strong> Arc bande, controlez visuellement qu elle suit un axe coherent avec les branches et la poignee.</p>
        <p><strong>3. Repose-fleche.</strong> Le tube doit etre soutenu proprement et quitter le repose-fleche sans contact parasite.</p>
        <p><strong>4. Centrage.</strong> Partez d un centrage mecanique coherent avec votre berger et votre diametre de tube, puis affinez au tir. Ne cherchez pas a masquer un mauvais alignement de branches avec le berger.</p>
        <p><strong>5. Barebow.</strong> Conservez la meme palette, la meme prise de corde et un crawl de reference pendant les comparaisons de reglage.</p>
        <p class="muted"><strong>Sources :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Coach's Manual Level 2, Barebow et Equipment Tuning</a> · <a href="${HOYT}" target="_blank" rel="noopener noreferrer">Hoyt — documentation recurve</a></p>`);

      setDetailsContent('tillerGuidedTest','3. Tiller : reglage et test — Barebow',`
        <p><strong>But :</strong> rechercher un comportement stable sur votre plage de crawls, pas reproduire le tiller d un arc classique avec viseur.</p>
        <p><strong>1. Partez d un tiller faible/proche de zero</strong> si cela reste compatible avec les recommandations de votre fabricant.</p>
        <p><strong>2. Choisissez un crawl de reference</strong>, de preference intermediaire, et gardez exactement la meme prise de corde pendant le test.</p>
        <p><strong>3. Faites plusieurs series</strong> et observez stabilite, bruit, vibrations et reaction de la poignee.</p>
        <p><strong>4. Corrigez tres peu</strong>, une seule variable a la fois, puis recommencez les memes series.</p>
        <p><strong>5. Recontrolez le point d encochage</strong> apres toute modification du tiller.</p>
        <p><strong>6. Verifiez ensuite plusieurs crawls.</strong> Le reglage retenu doit rester utilisable sur votre pratique reelle de stringwalking.</p>
        <p class="muted"><strong>Source :</strong> <a href="${WA_MANUAL}" target="_blank" rel="noopener noreferrer">World Archery — Coach's Manual Level 2, Barebow</a></p>`);
    }
  }

  function installAuditNotes() {
    addDetails('[data-panel="spine"]','expertArrowAudit','A retenir',`<p>Le <strong>spine propose est un point de depart</strong>. Confirmez votre choix avec le tableau du fabricant et, si possible, par un essai au tir.</p><hr><h3>Bien prendre les mesures</h3><p><strong>Puissance a l allonge</strong> : utilisez un peson adapte au tir a l arc. Armez normalement jusqu a votre ancrage habituel et relevez la puissance indiquee. Faites idealement 2 ou 3 mesures dans les memes conditions.</p><p><strong>Longueur de fleche</strong> : mesurez de la gorge de l encoche jusqu a l extremite du tube, sans compter la pointe.</p><p><strong>En cas de doute</strong>, faites verifier ces mesures au club avant de commander ou de couper des tubes.</p>`,'#result');

    addDetails('[data-panel="arc-setup"]','expertBaseAudit','1. Priorites de reglage','<p>Chargement des recommandations...</p>','#arcSetupResult');
    addDetails('[data-panel="arc-setup"]','alignmentGuidedCheck','2. Alignements et montage','<p>Chargement des recommandations...</p>','#expertBaseAudit');
    addDetails('[data-panel="arc-setup"]','tillerGuidedTest','3. Tiller : reglage et test','<p>Chargement des recommandations...</p>','#alignmentGuidedCheck');

    addDetails('[data-panel="notebook"]','expertNotebookAudit','Conseil carnet',`<p>Pour rendre une comparaison exploitable, enregistrez toujours ensemble : arc/branches, corde, puissance mesuree, tube/spine, longueur, pointe, band, tiller, point d encochage, berger et conditions du test.</p>`);
    addDetails('[data-panel="sight"]','expertSightAudit','Conseil pour les reperes',`<p>Les reperes de viseur ou de crawl sont des <strong>mesures personnelles</strong>. En barebow, notez aussi la palette, la prise de corde et toute modification de materiel.</p>`);

    renderArcSpecificGuides();
    const bowStyle=document.getElementById('bowStyle');
    if(bowStyle && !bowStyle.dataset.arcGuideBound){
      bowStyle.dataset.arcGuideBound='1';
      bowStyle.addEventListener('change',()=>setTimeout(renderArcSpecificGuides,0));
    }
  }

  function harmonizeIdentity() { document.title='Assistant Archer'; const h1=document.querySelector('.hero h1'); if(h1)h1.textContent='Assistant Archer'; const meta=document.querySelector('meta[name="theme-color"]'); if(meta&&!document.documentElement.dataset.theme)meta.setAttribute('content','#102b4e'); }
  setTimeout(() => { harmonizeIdentity(); installAuditNotes(); installPublishButton(); }, 250);
})();