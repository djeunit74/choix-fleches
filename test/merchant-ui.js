/* Assistant Archer TEST - offres marchands toujours visibles. */
(() => {
  'use strict';

  function revealMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;

    block.classList.remove('is-collapsed');
    delete block.dataset.open;

    const disclosure = block.querySelector(':scope > .merchant-disclosure');
    if (disclosure) {
      const body = disclosure.querySelector(':scope > .merchant-disclosure-body');
      if (body) {
        [...body.childNodes].forEach(node => block.insertBefore(node, disclosure));
      }
      disclosure.remove();
    }

    block.querySelectorAll(':scope > .merchant-intro, :scope > .merchant-shops').forEach(element => {
      element.hidden = false;
      element.style.removeProperty('display');
    });
  }

  function revealAll(root = document) {
    if (root instanceof HTMLElement && root.matches('.merchant-block')) revealMerchantBlock(root);
    root.querySelectorAll?.('.merchant-block').forEach(revealMerchantBlock);
  }

  function install() {
    revealAll();
    const result = document.getElementById('result');
    if (!result) return;
    new MutationObserver(() => revealAll(result)).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: revealAll,
    mode: 'always-visible',
    release: 'Pre-alpha v9'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
