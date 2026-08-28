/* Assistant Archer TEST - affichage/repli des offres sans modifier le contenu rendu. */
(() => {
  'use strict';

  let scheduled = false;
  let merchantBlockId = 0;

  function directMerchantBlock(host) {
    return [...host.children].find(child => child instanceof HTMLElement && child.classList.contains('merchant-block')) || null;
  }

  function setExpanded(host, expanded) {
    if (!(host instanceof HTMLElement)) return;
    const button = [...host.children].find(child => child instanceof HTMLButtonElement && child.classList.contains('merchant-toggle'));
    host.dataset.merchantExpanded = expanded ? 'true' : 'false';
    if (button instanceof HTMLButtonElement) {
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.textContent = expanded ? 'Masquer les offres ▴' : 'Afficher les offres ▾';
    }
  }

  function toggleHost(host) {
    setExpanded(host, host.dataset.merchantExpanded !== 'true');
  }

  function ensureToggleButton(host, block) {
    let button = [...host.children].find(child => child instanceof HTMLButtonElement && child.classList.contains('merchant-toggle'));
    if (!(button instanceof HTMLButtonElement)) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'merchant-toggle';
      host.insertBefore(button, block);
    }

    if (!block.id) {
      merchantBlockId += 1;
      block.id = `merchant-offers-${merchantBlockId}`;
    }
    button.setAttribute('aria-controls', block.id);

    if (button.dataset.merchantToggleBound !== '1') {
      button.dataset.merchantToggleBound = '1';
      button.addEventListener('click', () => toggleHost(host));
    }
    return button;
  }

  function bindHost(host) {
    if (!(host instanceof HTMLElement)) return;
    const block = directMerchantBlock(host);
    if (!(block instanceof HTMLElement)) return;

    host.classList.add('merchant-offers-host');
    ensureToggleButton(host, block);

    if (!host.dataset.merchantExpanded) setExpanded(host, false);
    else setExpanded(host, host.dataset.merchantExpanded === 'true');
  }

  function bindAll(root = document) {
    const scope = root instanceof Document || root instanceof HTMLElement ? root : document;

    if (scope instanceof HTMLElement && (scope.matches('.merchant-panel') || scope.matches('.mini-card'))) {
      bindHost(scope);
    }

    scope.querySelectorAll?.('.merchant-panel, .mini-card').forEach(bindHost);
  }

  function scheduleBind() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      bindAll(document.getElementById('result') || document);
    });
  }

  function install() {
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = 'Version : Pré-alpha v11';

    bindAll();
    const result = document.getElementById('result');
    if (!result) return;
    new MutationObserver(scheduleBind).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: bindAll,
    mode: 'host-sibling-toggle',
    release: 'Pre-alpha v11'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
