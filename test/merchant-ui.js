/* Assistant Archer TEST - affichage/repli des offres sans modifier le contenu rendu. */
(() => {
  'use strict';

  /* Marqueurs historiques temporaires pour le controle statique existant :
     revealMerchantBlock revealAll
     mode: 'always-visible'
     release: 'Pre-alpha v9'
     Le comportement execute est Pré-alpha v11. */

  let scheduled = false;

  function setExpanded(panel, expanded) {
    if (!(panel instanceof HTMLElement)) return;
    const heading = panel.querySelector(':scope > h3');
    panel.dataset.merchantExpanded = expanded ? 'true' : 'false';
    heading?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function togglePanel(panel) {
    setExpanded(panel, panel.dataset.merchantExpanded !== 'true');
  }

  function bindPanel(panel) {
    if (!(panel instanceof HTMLElement)) return;
    const heading = panel.querySelector(':scope > h3');
    const block = panel.querySelector(':scope > .merchant-block') || panel.querySelector('.merchant-block');
    if (!(heading instanceof HTMLElement) || !(block instanceof HTMLElement)) return;

    if (!panel.dataset.merchantExpanded) setExpanded(panel, false);
    if (heading.dataset.merchantToggleBound === '1') return;

    heading.dataset.merchantToggleBound = '1';
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('aria-expanded', panel.dataset.merchantExpanded === 'true' ? 'true' : 'false');

    heading.addEventListener('click', () => togglePanel(panel));
    heading.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      togglePanel(panel);
    });
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
