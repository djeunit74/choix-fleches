/* Assistant Archer TEST - presentation robuste des offres marchands. */
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
    const button = block.querySelector(':scope > .merchant-disclosure-summary');
    if (!button) return;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    block.dataset.open = open ? 'true' : 'false';
    block.classList.toggle('is-collapsed', !open);
    const label = button.querySelector('.merchant-disclosure-label');
    if (label) label.textContent = open ? 'Masquer les offres marchands' : 'Voir les offres marchands';
  }

  function enhanceMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (block.querySelector(':scope > .merchant-disclosure-summary')) return;

    disclosureSequence += 1;
    block.classList.add('merchant-disclosure');

    const controlled = block.querySelector(':scope > .merchant-shops') || block.querySelector(':scope > .merchant-intro');
    if (controlled && !controlled.id) controlled.id = `merchant-offers-${disclosureSequence}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'merchant-disclosure-summary';
    button.setAttribute('aria-expanded', 'false');
    if (controlled?.id) button.setAttribute('aria-controls', controlled.id);
    button.innerHTML = `<span class="merchant-disclosure-label">Voir les offres marchands</span><span class="merchant-disclosure-count">${disclosureLabel(block)}</span>`;

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const open = button.getAttribute('aria-expanded') === 'true';
      setDisclosureState(block, !open);
    });

    /* Le contenu marchand reste dans son bloc d origine : aucun deplacement de noeud.
       On le replie seulement par classe CSS, ce qui conserve le rendu valide de la v3. */
    block.prepend(button);
    setDisclosureState(block, false);
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
    const result = document.getElementById('result');
    if (!result) return;
    compactAll(result);
    // MutationObserver ne deplace aucun noeud : il ajoute seulement le controle
    // aux nouveaux blocs marchands produits par un nouveau calcul.
    new MutationObserver(scheduleCompact).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: compactAll,
    setDisclosureState,
    version: 'v62',
    release: 'Pre-alpha v4'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
