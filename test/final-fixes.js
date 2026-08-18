/* Audit logique TEST : garde-fous de coherence et affichage prudent. */
(() => {
  const VERSION = '2026.08.18-test.25';

  function installVersionAndUpdateControl() {
    const body = document.querySelector('.app-settings-body');
    if (!body) return;
    let version = document.getElementById('appVersionInfo');
    if (!version) {
      version = document.createElement('p');
      version.id = 'appVersionInfo';
      version.style.cssText = 'margin:.6rem 0;font-size:.9em;font-weight:700;opacity:.75';
      body.appendChild(version);
    }
    version.textContent = 'Version : ' + VERSION;

    if (document.getElementById('appUpdateBtn')) return;
    const block = document.createElement('div');
    block.className = 'app-update-setting';
    block.style.cssText = 'margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.12)';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'appUpdateBtn';
    button.textContent = "Mettre a jour l'application";
    const status = document.createElement('p');
    status.id = 'appUpdateStatus';
    status.style.cssText = 'margin:.5rem 0 0;font-size:.9em';
    status.textContent = 'Charge la derniere version sans effacer vos reglages enregistres.';
    button.addEventListener('click', async () => {
      button.disabled = true;
      status.textContent = 'Recherche de la derniere version...';
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration('./');
          if (registration) {
            await registration.update();
            if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
        if (window.caches) {
          const keys = await caches.keys();
          await Promise.all(keys.filter(k => k.startsWith('choix-fleches-')).map(k => caches.delete(k)));
        }
        const url = new URL(window.location.href);
        url.searchParams.set('update', Date.now().toString());
        window.location.replace(url.toString());
      } catch (error) {
        console.warn('Mise a jour impossible', error);
        status.textContent = 'Mise a jour impossible pour le moment. Verifiez la connexion puis recommencez.';
        button.disabled = false;
      }
    });
    block.append(button, status);
    body.appendChild(block);
  }

  function frenchTechnicalTerms(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!node.nodeValue || !/(crawl|stringwalk)/i.test(node.nodeValue)) continue;
      node.nodeValue = node.nodeValue
        .replace(/plusieurs crawls/gi, 'plusieurs decalages des doigts sous l encoche')
        .replace(/crawl intermediaire/gi, 'decalage intermediaire des doigts sous l encoche')
        .replace(/crawl courte/gi, 'decalage court des doigts sous l encoche')
        .replace(/crawl longue/gi, 'decalage long des doigts sous l encoche')
        .replace(/crawls/gi, 'decalages des doigts sous l encoche')
        .replace(/crawl/gi, 'decalage des doigts sous l encoche')
        .replace(/prise de corde\s*\/\s*stringwalk/gi, 'decalage des doigts sous l encoche')
        .replace(/stringwalking/gi, 'deplacement des doigts sur la corde')
        .replace(/stringwalk/gi, 'deplacement des doigts sur la corde');
    }
  }

  function cleanEastonDisplay() {
    const result = document.getElementById('result');
    if (!result || !/Recommandation\s+Easton/i.test(result.textContent || '')) return;

    const walker = document.createTreeWalker(result, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const text = (node.nodeValue || '').trim();
      const match = text.match(/^(\d+)\s+base\s+(\d+)\s*[-–]\s*(\d+)\s*\/\s*eq\.\s*(\d+)$/i);
      if (!match) continue;
      const a = Number(match[2]);
      const b = Number(match[3]);
      const equivalent = Number(match[4]);
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      const box = document.createElement('span');
      box.className = 'easton-clear-recommendation';
      box.style.cssText = 'display:block';
      box.innerHTML = `<span style="display:block;font-size:.58em;font-weight:700;line-height:1.3">Plage fabricant : ${min}-${max}</span><span style="display:block;margin-top:.18em">Spine de depart indicatif : ${equivalent}</span>`;
      node.parentNode.replaceChild(box, node);
      break;
    }

    // Easton fournit une plage de selection. Ne pas fabriquer une paire "souple/rigide" hors de cette plage.
    [...result.querySelectorAll('p,li,div')].forEach(el => {
      const text = el.textContent || '';
      if (/^\s*Alternatives spine\s*:/i.test(text)) el.remove();
      if (/cote plus souple de la plage Easton est privilegie/i.test(text)) el.remove();
    });

    // Un nombre intermediaire calcule n'est pas forcement une taille commercialisee par le modele.
    result.querySelectorAll('li').forEach(li => {
      if (!/spine conseille\s+\d+/i.test(li.textContent || '')) return;
      li.innerHTML = li.innerHTML.replace(/\s*\|\s*spine conseille\s+\d+/i, ' | spine a choisir parmi les tailles reellement disponibles dans la plage fabricant');
    });

    // Tant que la taille exacte du modele n'est pas verifiee, ne pas annoncer une confiance "Elevee".
    result.querySelectorAll('p').forEach(p => {
      if (/Niveau de confiance\s*:\s*Elevee/i.test(p.textContent || '')) {
        p.innerHTML = '<strong>Niveau de confiance</strong> : Moyenne';
      }
    });

    if (!result.querySelector('.easton-audit-note')) {
      const note = document.createElement('p');
      note.className = 'easton-audit-note';
      note.innerHTML = '<strong>Lecture :</strong> la plage vient du selecteur Easton. Le spine exact doit ensuite correspondre a une taille reellement proposee par le modele choisi ; aucune valeur intermediaire n est inventee.';
      const firstList = result.querySelector('ul');
      if (firstList) firstList.insertAdjacentElement('beforebegin', note); else result.appendChild(note);
    }
  }

  function materialModeGuard() {
    const result = document.getElementById('result');
    const material = document.getElementById('shaftMaterial')?.value;
    if (!result || material !== 'all') return;
    if (result.querySelector('.material-mode-note')) return;
    const note = document.createElement('p');
    note.className = 'material-mode-note';
    note.innerHTML = '<strong>Materiaux = Tous :</strong> carbone et aluminium ne sont pas classes comme un unique vainqueur universel. Le choix depend notamment de l usage salle/exterieur et du modele vise.';
    result.insertAdjacentElement('afterbegin', note);
  }

  function updateGuidedLabels() {
    const guide = document.getElementById('aaNeedsGuide');
    if (!guide) return;
    const notebook = guide.querySelector('[data-go="notebook"]');
    const sight = guide.querySelector('[data-go="sight"]');
    if (notebook) notebook.textContent = 'Enregistrer / retrouver mes reglages';
    if (sight) sight.textContent = 'Enregistrer / consulter mes reperes';
  }

  let scheduled = false;
  function scheduleAudit() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      frenchTechnicalTerms(document.body);
      cleanEastonDisplay();
      materialModeGuard();
      updateGuidedLabels();
      installVersionAndUpdateControl();
    });
  }

  function init() {
    document.documentElement.dataset.testFixVersion = VERSION;
    scheduleAudit();
    new MutationObserver(scheduleAudit).observe(document.body, { childList: true, subtree: true, characterData: true });
    document.getElementById('spine-form')?.addEventListener('submit', () => {
      setTimeout(scheduleAudit, 0);
      setTimeout(scheduleAudit, 120);
      setTimeout(scheduleAudit, 450);
    }, true);
    document.getElementById('preferredBrand')?.addEventListener('change', () => setTimeout(scheduleAudit, 0));
    document.getElementById('shaftMaterial')?.addEventListener('change', () => setTimeout(scheduleAudit, 0));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
