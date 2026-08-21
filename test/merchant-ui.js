/* Assistant Archer TEST - presentation compacte des offres marchands. */
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

  function setDisclosureState(wrapper, open) {
    const button = wrapper.querySelector(':scope > .merchant-disclosure-summary');
    const body = wrapper.querySelector(':scope > .merchant-disclosure-body');
    if (!button || !body) return;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    wrapper.dataset.open = open ? 'true' : 'false';
    body.hidden = !open;
  }

  function compactMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (block.querySelector(':scope > .merchant-disclosure')) return;
    if (!block.childNodes.length) return;

    disclosureSequence += 1;
    const wrapper = document.createElement('section');
    wrapper.className = 'merchant-disclosure';
    wrapper.dataset.open = 'false';

    const bodyId = `merchant-disclosure-body-${disclosureSequence}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'merchant-disclosure-summary';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', bodyId);
    button.innerHTML = `<span>Voir les offres marchands</span><span class="merchant-disclosure-count">${disclosureLabel(block)}</span>`;

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'merchant-disclosure-body';
    body.hidden = true;
    [...block.childNodes].forEach(node => body.appendChild(node));

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setDisclosureState(wrapper, button.getAttribute('aria-expanded') !== 'true');
    });

    wrapper.append(button, body);
    block.appendChild(wrapper);
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

  window.AssistantArcherMerchantUi = Object.freeze({ refresh: compactAll, version: 'v62' });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
