/* Correctifs finaux TEST : mise a jour PWA, terminologie francaise et affichage Easton prudent. */
(() => {
  const VERSION = '20260817-final3';

  function installUpdateControl() {
    const body = document.querySelector('.app-settings-body');
    if (!body || document.getElementById('appUpdateBtn')) return;
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
        status.textContent = 'Mise a jour chargee. Reouverture...';
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
    if (!result) return;
    const preferred = document.getElementById('preferredBrand')?.value;
    const isEaston = preferred === 'easton' || /Recommandation\s+Easton/i.test(result.textContent || '');
    if (!isEaston) return;

    const value = result.querySelector('.result-value');
    if (value) {
      const text = value.textContent.trim();
      const match = text.match(/^(\d+)\s+base\s+(\d+)\s*[-–]\s*(\d+)\s*\/\s*eq\.\s*(\d+)/i);
      if (match) {
        const a = Number(match[2]);
        const b = Number(match[3]);
        const equivalent = Number(match[4]);
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        value.innerHTML = `<span style="display:block;font-size:.48em;font-weight:700;line-height:1.25">Plage fabricant : ${min}-${max}</span><span style="display:block">Spine de depart conseille : ${equivalent}</span>`;
      }
    }

    result.querySelectorAll('p').forEach(p => {
      if (/Alternatives spine\s*:/i.test(p.textContent || '')) p.remove();
    });
  }

  function updateGuidedLabels() {
    const guide = document.getElementById('aaNeedsGuide');
    if (!guide) return;
    const notebook = guide.querySelector('[data-go="notebook"]');
    const sight = guide.querySelector('[data-go="sight"]');
    if (notebook) notebook.textContent = 'Enregistrer / retrouver mes reglages';
    if (sight) sight.textContent = 'Enregistrer / consulter mes reperes';
  }

  function installObservers() {
    const observer = new MutationObserver(() => {
      frenchTechnicalTerms(document.body);
      cleanEastonDisplay();
      updateGuidedLabels();
      installUpdateControl();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    document.documentElement.dataset.testFixVersion = VERSION;
    installUpdateControl();
    frenchTechnicalTerms(document.body);
    cleanEastonDisplay();
    updateGuidedLabels();
    installObservers();
    document.getElementById('preferredBrand')?.addEventListener('change', () => setTimeout(cleanEastonDisplay, 0));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
