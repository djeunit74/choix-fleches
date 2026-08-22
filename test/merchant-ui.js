/* Assistant Archer TEST - affichage/repli des offres sans modifier le contenu rendu. */
(() => {
  'use strict';

  let scheduled = false;
  let merchantBlockId = 0;

  function setExpanded(panel, expanded) {
    if (!(panel instanceof HTMLElement)) return;
    const heading = panel.querySelector(':scope > h3');
    const button = panel.querySelector(':scope > .merchant-toggle');
    panel.dataset.merchantExpanded = expanded ? 'true' : 'false';
    heading?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (button instanceof HTMLButtonElement) {
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.textContent = expanded ? 'Masquer les offres ▴' : 'Afficher les offres ▾';
    }
  }

  function togglePanel(panel) {
    setExpanded(panel, panel.dataset.merchantExpanded !== 'true');
  }

  function ensureToggleButton(panel, block) {
    let button = panel.querySelector(':scope > .merchant-toggle');
    if (!(button instanceof HTMLButtonElement)) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'merchant-toggle';
      panel.insertBefore(button, block);
    }

    if (!block.id) {
      merchantBlockId += 1;
      block.id = `merchant-offers-${merchantBlockId}`;
    }
    button.setAttribute('aria-controls', block.id);

    if (button.dataset.merchantToggleBound !== '1') {
      button.dataset.merchantToggleBound = '1';
      button.addEventListener('click', () => togglePanel(panel));
    }
    return button;
  }

  function bindPanel(panel) {
    if (!(panel instanceof HTMLElement)) return;
    const heading = panel.querySelector(':scope > h3');
    const block = panel.querySelector(':scope > .merchant-block') || panel.querySelector('.merchant-block');
    if (!(heading instanceof HTMLElement) || !(block instanceof HTMLElement)) return;

    ensureToggleButton(panel, block);

    /* Le titre reste aussi activable au clavier/souris comme zone secondaire. */
    if (heading.dataset.merchantHeadingBound !== '1') {
      heading.dataset.merchantHeadingBound = '1';
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      heading.addEventListener('click', () => togglePanel(panel));
      heading.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        togglePanel(panel);
      });
    }

    if (!panel.dataset.merchantExpanded) setExpanded(panel, false);
    else setExpanded(panel, panel.dataset.merchantExpanded === 'true');
  }

  function bindAll(root = document) {
    if (root instanceof HTMLElement && root.matches('.merchant-panel')) bindPanel(root);
    root.querySelectorAll?.('.merchant-panel').forEach(bindPanel);
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
    mode: 'panel-attribute-toggle',
    release: 'Pre-alpha v11'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
