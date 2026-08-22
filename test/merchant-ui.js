/* Assistant Archer TEST - accordéon robuste des offres marchands. */
(() => {
  'use strict';

  let scheduled = false;
  let disclosureSequence = 0;

  function disclosureLabel(block) {
    const offerCount = block.querySelectorAll('.merchant-deals li').length;
    const modelCount = block.querySelectorAll('.merchant-model').length;
    if (offerCount > 0) return `${offerCount} offre${offerCount > 1 ? 's' : ''}`;
    if (modelCount > 0) return `${modelCount} modele${modelCount > 1 ? 's' : ''}`;
    return 'details';
  }

  function setDisclosureState(block, open) {
    const details = block?.querySelector?.(':scope > .merchant-native-disclosure');
    if (details instanceof HTMLDetailsElement) details.open = Boolean(open);
  }

  function updateSummaryAccessibility(details, summary) {
    const open = details.open;
    summary.setAttribute('aria-expanded', open ? 'true' : 'false');
    details.dataset.open = open ? 'true' : 'false';
  }

  function enhanceMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (block.querySelector(':scope > .merchant-native-disclosure')) return;
    if (!block.childNodes.length) return;

    disclosureSequence += 1;
    const count = disclosureLabel(block);

    const details = document.createElement('details');
    details.className = 'merchant-native-disclosure merchant-disclosure';
    details.dataset.merchantReady = 'prealpha-v7';

    const summary = document.createElement('summary');
    summary.className = 'merchant-native-summary merchant-disclosure-summary';
    summary.style.setProperty('display', 'list-item', 'important');
    summary.style.setProperty('list-style', 'none', 'important');
    summary.innerHTML = `
      <span class="merchant-summary-row" style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;width:100%">
        <span class="merchant-native-label merchant-native-label-closed">Voir les offres marchands</span>
        <span class="merchant-native-label merchant-native-label-open">Masquer les offres marchands</span>
        <span class="merchant-disclosure-count">${count}</span>
        <span class="merchant-native-chevron" aria-hidden="true">▾</span>
      </span>
    `;

    const body = document.createElement('div');
    body.id = `merchant-native-body-${disclosureSequence}`;
    body.className = 'merchant-native-body merchant-disclosure-body';
    summary.setAttribute('aria-controls', body.id);

    [...block.childNodes].forEach(node => body.appendChild(node));
    details.append(summary, body);
    block.appendChild(details);

    summary.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      details.open = !details.open;
      updateSummaryAccessibility(details, summary);
    });

    details.addEventListener('toggle', () => updateSummaryAccessibility(details, summary));
    updateSummaryAccessibility(details, summary);
  }

  function compactAll(root = document) {
    if (root instanceof HTMLElement && root.matches('.merchant-block')) enhanceMerchantBlock(root);
    root.querySelectorAll?.('.merchant-block').forEach(enhanceMerchantBlock);
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
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = 'Version : Pré-alpha v7';

    const result = document.getElementById('result');
    if (!result) return;
    compactAll(result);
    new MutationObserver(scheduleCompact).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: compactAll,
    setDisclosureState,
    version: 'v62',
    release: 'Pre-alpha v7'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
