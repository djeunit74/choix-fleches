/* Assistant Archer TEST - presentation compacte des offres marchands. */
(() => {
  'use strict';

  let scheduled = false;
  let disclosureSequence = 0;
  const openMerchantKeys = new Set();

  const directChild = (parent, className) => [...parent.children].find(child => child.classList?.contains(className)) || null;

  function disclosureLabel(block) {
    const offerCount = block.querySelectorAll('.merchant-deals li').length;
    const modelCount = block.querySelectorAll('.merchant-model').length;
    if (offerCount > 0) return `${offerCount} offre${offerCount > 1 ? 's' : ''}`;
    if (modelCount > 0) return `${modelCount} modele${modelCount > 1 ? 's' : ''}`;
    return 'details';
  }

  function merchantKey(block) {
    const text = String(block.textContent || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 800) || `merchant-${disclosureSequence + 1}`;
  }

  function setDisclosureState(wrapper, open) {
    const button = directChild(wrapper, 'merchant-disclosure-summary');
    const body = directChild(wrapper, 'merchant-disclosure-body');
    if (!button || !body) return;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    wrapper.dataset.open = open ? 'true' : 'false';
    wrapper.classList.toggle('is-open', open);
    body.hidden = !open;
    body.style.display = open ? '' : 'none';
  }

  function compactMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (directChild(block, 'merchant-disclosure')) return;
    if (!block.childNodes.length) return;

    const key = merchantKey(block);
    disclosureSequence += 1;

    const wrapper = document.createElement('section');
    wrapper.className = 'merchant-disclosure';
    wrapper.dataset.merchantKey = key;

    const bodyId = `merchant-disclosure-body-${disclosureSequence}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'merchant-disclosure-summary';
    button.setAttribute('aria-controls', bodyId);
    button.innerHTML = `<span>Voir les offres marchands</span><span class="merchant-disclosure-count">${disclosureLabel(block)}</span>`;

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'merchant-disclosure-body';
    [...block.childNodes].forEach(node => body.appendChild(node));

    wrapper.append(button, body);
    block.appendChild(wrapper);
    setDisclosureState(wrapper, openMerchantKeys.has(key));
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

  function handleMerchantToggle(event, result) {
    const rawTarget = event.target;
    const target = rawTarget instanceof Element ? rawTarget.closest('.merchant-disclosure-summary') : null;
    if (!target || !result.contains(target)) return;

    const wrapper = target.closest('.merchant-disclosure');
    if (!wrapper) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const nextOpen = target.getAttribute('aria-expanded') !== 'true';
    const key = wrapper.dataset.merchantKey || '';
    if (key) {
      if (nextOpen) openMerchantKeys.add(key);
      else openMerchantKeys.delete(key);
    }
    setDisclosureState(wrapper, nextOpen);
  }

  function install() {
    const result = document.getElementById('result');
    if (!result) return;

    compactAll(result);

    // Delegation en capture : le bouton reste fonctionnel meme si le contenu marchand
    // est remplace dynamiquement entre deux rendus de recommandation.
    result.addEventListener('click', event => handleMerchantToggle(event, result), true);

    new MutationObserver(scheduleCompact).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: compactAll,
    setDisclosureState,
    version: 'v62',
    release: 'Pre-alpha v2'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
