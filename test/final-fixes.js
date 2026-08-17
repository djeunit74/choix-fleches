/* Correctifs finaux TEST : mise a jour PWA, terminologie francaise et affichage Easton prudent. */
(() => {
  const VERSION = '20260817-final1';

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
    status.textContent = 'Recherche et charge la derniere version sans effacer vos reglages enregistres.';

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
      if (!node.nodeValue || !/crawl/i.test(node.nodeValue)) continue;
      node.nodeValue = node.nodeValue
        .replace(/plusieurs crawls/gi, 'plusieurs decalages des doigts sous l encoche')
        .replace(/crawl intermediaire/gi, 'decalage intermediaire des doigts sous l encoche')
        .replace(/crawl courte/gi, 'decalage court des doigts sous l encoche')
        .replace(/crawl longue/gi, 'decalage long des doigts sous l encoche')
        .replace(/crawls/gi, 'decalages des doigts sous l encoche')
        .replace(/crawl/gi, 'decalage des doigts sous l encoche');
    }
  }

  function cleanEastonAlternatives() {
    const result = document.getElementById('result');
    if (!result) return;
    const preferred = document.getElementById('preferredBrand')?.value;
    const isEaston = preferred === 'easton' || /Recommandation\s+Easton/i.test(result.textContent || '');
    if (!isEaston) return;

    result.querySelectorAll('p').forEach(p => {
      if (/Alternatives spine\s*:/i.test(p.textContent || '')) {
        p.innerHTML = '<strong>Lecture Easton :</strong> utilisez la plage fabricant affichee ci-dessus. Plus le nombre de spine est petit, plus le tube est rigide. Les alternatives automatiques hors de cette plage ne sont pas affichees.';
      }
    });
  }

  function installObservers() {
    const observer = new MutationObserver(mutations => {
      let needsTerms = false;
      let needsEaston = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          needsTerms = true;
          needsEaston = true;
          break;
        }
      }
      if (needsTerms) frenchTechnicalTerms(document.body);
      if (needsEaston) cleanEastonAlternatives();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    document.documentElement.dataset.testFixVersion = VERSION;
    installUpdateControl();
    frenchTechnicalTerms(document.body);
    cleanEastonAlternatives();
    installObservers();
    document.getElementById('preferredBrand')?.addEventListener('change', () => setTimeout(cleanEastonAlternatives, 0));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
