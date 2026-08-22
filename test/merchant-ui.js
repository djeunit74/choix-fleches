/* Assistant Archer TEST - presentation compacte des offres marchands. */
(() => {
  'use strict';

  let scheduled = false;

  function disclosureLabel(block) {
    const offerCount = block.querySelectorAll('.merchant-deals li').length;
    const modelCount = block.querySelectorAll('.merchant-model').length;
    if (offerCount > 0) return `${offerCount} offre${offerCount > 1 ? 's' : ''}`;
    if (modelCount > 0) return `${modelCount} modele${modelCount > 1 ? 's' : ''}`;
    return 'details';
  }

  function compactMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (block.querySelector(':scope > .merchant-disclosure')) return;
    if (!block.childNodes.length) return;

    const details = document.createElement('details');
    details.className = 'merchant-disclosure';

    const summary = document.createElement('summary');
    summary.className = 'merchant-disclosure-summary';
    summary.innerHTML = `<span>Voir les offres marchands</span><span class="merchant-disclosure-count">${disclosureLabel(block)}</span>`;

    const body = document.createElement('div');
    body.className = 'merchant-disclosure-body';
    [...block.childNodes].forEach(node => body.appendChild(node));

    details.append(summary, body);
    block.appendChild(details);
  }

  function compactAll(root = document) {
    if (root instanceof HTMLElement && root.matches('.merchant-block')) compactMerchantBlock(root);
    root.querySelectorAll?.('.merchant-block').forEach(compactMerchantBlock);
  }

  function scheduleCompact() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      compactAll();
    });
  }

  function install() {
    compactAll();
    const result = document.getElementById('result');
    if (!result) return;
    new MutationObserver(scheduleCompact).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: compactAll,
    version: 'v58',
    release: 'Pre-alpha v8'
  });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
