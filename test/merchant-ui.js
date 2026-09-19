/* Assistant Archer TEST - repli des offres sans reconstruire leur contenu. */
(() => {
  'use strict';

  const PANEL_SELECTOR = '.merchant-panel';
  const BLOCK_SELECTOR = ':scope > .merchant-block';
  const TITLE_SELECTOR = ':scope > h3';
  let scheduled = false;
  let merchantBlockId = 0;
  let expandedState = false;

  function setExpanded(panel, expanded) {
    const title = panel.querySelector(TITLE_SELECTOR);
    expandedState = expanded;
    panel.dataset.merchantExpanded = expanded ? 'true' : 'false';
    title?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function bindPanel(panel) {
    if (!(panel instanceof HTMLElement)) return;

    const block = panel.querySelector(BLOCK_SELECTOR);
    const title = panel.querySelector(TITLE_SELECTOR);
    if (!(block instanceof HTMLElement) || !(title instanceof HTMLHeadingElement)) return;

    if (!block.id) {
      merchantBlockId += 1;
      block.id = `merchant-offers-${merchantBlockId}`;
    }

    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-controls', block.id);

    setExpanded(panel, expandedState);
  }

  function merchantPanelFromEvent(event, result) {
    const target = event.target;
    if (!(target instanceof Element)) return null;
    const title = target.closest(`${PANEL_SELECTOR} > h3`);
    if (!(title instanceof HTMLHeadingElement) || !result.contains(title)) return null;
    return title.parentElement instanceof HTMLElement ? title.parentElement : null;
  }

  function toggleFromEvent(event, result) {
    const panel = merchantPanelFromEvent(event, result);
    if (!panel) return;
    setExpanded(panel, panel.dataset.merchantExpanded !== 'true');
  }

  function bindAll(root = document) {
    if (root instanceof HTMLElement && root.matches(PANEL_SELECTOR)) bindPanel(root);
    root.querySelectorAll?.(PANEL_SELECTOR).forEach(bindPanel);
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
    bindAll();
    const result = document.getElementById('result');
    if (!result) return;

    result.addEventListener('click', event => toggleFromEvent(event, result), { capture: true });
    result.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const panel = merchantPanelFromEvent(event, result);
      if (!panel) return;
      event.preventDefault();
      setExpanded(panel, panel.dataset.merchantExpanded !== 'true');
    }, { capture: true });
    new MutationObserver(scheduleBind).observe(result, { childList: true, subtree: true });
  }

  window.AssistantArcherMerchantUi = Object.freeze({
    refresh: bindAll,
    mode: 'panel-attribute-toggle',
    release: 'Pre-alpha v12'
  });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
