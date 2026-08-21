/* Assistant Archer TEST - accordéon natif des offres marchands. */
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

  /* Compatibilite de l API historique. Le composant v5 n utilise plus cette fonction
     pour son fonctionnement normal : <details> gere lui-meme l ouverture. */
  function setDisclosureState(block, open) {
    const details = block?.querySelector?.(':scope > .merchant-native-disclosure');
    if (details instanceof HTMLDetailsElement) details.open = Boolean(open);
  }

  function installLegacyFallback(details, block) {
    if ('open' in details) return;
    const summary = details.querySelector('.merchant-disclosure-summary');
    const body = details.querySelector('.merchant-disclosure-body');
    if (!summary || !body) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'merchant-disclosure-summary';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', body.id);
    button.textContent = 'Voir les offres marchands';
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      body.hidden = open;
    });
    summary.replaceWith(button);
    body.hidden = true;
    block.classList.add('merchant-disclosure');
  }

  function enhanceMerchantBlock(block) {
    if (!(block instanceof HTMLElement)) return;
    if (block.querySelector(':scope > .merchant-native-disclosure')) return;
    if (!block.childNodes.length) return;

    disclosureSequence += 1;
    const count = disclosureLabel(block);

    const details = document.createElement('details');
    details.className = 'merchant-native-disclosure merchant-disclosure';
    /* Pas d attribut open : les offres sont réellement repliees par defaut. */

    const summary = document.createElement('summary');
    summary.className = 'merchant-native-summary merchant-disclosure-summary';
    summary.innerHTML = `
      <span class="merchant-native-label merchant-native-label-closed">Voir les offres marchands</span>
      <span class="merchant-native-label merchant-native-label-open">Masquer les offres marchands</span>
      <span class="merchant-disclosure-count">${count}</span>
    `;

    const body = document.createElement('div');
    body.id = `merchant-native-body-${disclosureSequence}`;
    body.className = 'merchant-native-body merchant-disclosure-body';
    summary.setAttribute('aria-controls', body.id);

    [...block.childNodes].forEach(node => body.appendChild(node));
    details.append(summary, body);
    block.appendChild(details);

    installLegacyFallback(details, block);
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
    if (release) release.textContent = 'Version : Pré-alpha v5';

    const result = document.getElementById('result');
    if (!result) return;
    compactAll(result);
    new MutationObserver(scheduleCompact).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: compactAll,
    setDisclosureState,
    version: 'v62',
    release: 'Pre-alpha v5'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
