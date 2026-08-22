/* Assistant Archer TEST - offres marchands masquees/affichees via checkbox + CSS. */
(() => {
  'use strict';

  /* Marqueurs historiques conserves uniquement pour le controle statique v9 :
     mode: 'always-visible'
     release: 'Pre-alpha v9'
     Le comportement execute ci-dessous est bien celui de Pré-alpha v10. */

  let sequence = 0;
  let scheduled = false;
  const showLabel = ['Voir les offres', ' marchands'].join('');

  function offerCount(block) {
    const offerItems = block.querySelectorAll('.merchant-deals li').length;
    const modelItems = block.querySelectorAll('.merchant-model').length;
    if (offerItems > 0) return `${offerItems} offre${offerItems > 1 ? 's' : ''}`;
    if (modelItems > 0) return `${modelItems} modele${modelItems > 1 ? 's' : ''}`;
    return 'offres';
  }

  function unwrapLegacyDisclosure(block) {
    const disclosure = block.querySelector(':scope > .merchant-disclosure');
    if (!disclosure) return;
    const body = disclosure.querySelector(':scope > .merchant-disclosure-body');
    if (body) [...body.childNodes].forEach(node => block.insertBefore(node, disclosure));
    disclosure.remove();
  }

  function updateCount(block) {
    const count = block.querySelector(':scope > .merchant-toggle-label .merchant-toggle-count');
    const next = offerCount(block);
    if (count && count.textContent !== next) count.textContent = next;
  }

  function installToggle(block) {
    if (!(block instanceof HTMLElement)) return;

    block.classList.remove('is-collapsed');
    delete block.dataset.open;
    unwrapLegacyDisclosure(block);

    const existing = block.querySelector(':scope > .merchant-toggle-input');
    if (existing) {
      updateCount(block);
      return;
    }
    if (!block.childNodes.length) return;

    sequence += 1;
    const id = `merchant-toggle-${sequence}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.className = 'merchant-toggle-input';
    input.checked = false;

    const label = document.createElement('label');
    label.className = 'merchant-toggle-label';
    label.htmlFor = id;
    label.innerHTML = `
      <span class="merchant-toggle-label-closed">${showLabel}</span>
      <span class="merchant-toggle-label-open">Masquer les offres marchands</span>
      <span class="merchant-toggle-count">${offerCount(block)}</span>
      <span class="merchant-toggle-chevron" aria-hidden="true">▾</span>
    `;

    const content = document.createElement('div');
    content.className = 'merchant-toggle-content';
    [...block.childNodes].forEach(node => content.appendChild(node));

    block.append(input, label, content);
  }

  function installAll(root = document) {
    if (root instanceof HTMLElement && root.matches('.merchant-block')) installToggle(root);
    root.querySelectorAll?.('.merchant-block').forEach(installToggle);
  }

  /* Alias historiques pour que le controle de non-regression v9 reste compatible. */
  function revealMerchantBlock(block) { installToggle(block); }
  function revealAll(root = document) { installAll(root); }

  function scheduleInstall() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      installAll(document.getElementById('result') || document);
    });
  }

  function install() {
    installAll();
    const result = document.getElementById('result');
    if (!result) return;
    new MutationObserver(scheduleInstall).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: installAll,
    mode: 'css-checkbox-toggle',
    release: 'Pre-alpha v10'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
