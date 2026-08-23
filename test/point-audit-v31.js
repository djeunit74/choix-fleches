/* Assistant Archer TEST - audit pointes fabricant Easton/Victory/Skylon, Pré-alpha v31. */
(() => {
  'use strict';
  const VERSION = 'Pré-alpha v31';

  function decorate() {
    const panel = document.getElementById('arrowBuilderPanel');
    if (panel && /3\.\s*Pointe/i.test(panel.textContent || '') && !panel.querySelector('.point-audit-v31-note')) {
      const head = panel.querySelector('.arrow-builder-panel-head');
      if (head) {
        const note = document.createElement('p');
        note.className = 'point-audit-v31-note muted';
        note.style.cssText = 'margin:.15rem 0 .75rem;font-size:.78rem;line-height:1.4';
        note.textContent = 'Pointes vérifiées sur les catalogues fabricant Easton, Victory et Skylon. Seules les références compatibles avec le tube et le spine sélectionnés sont proposées.';
        head.insertAdjacentElement('afterend', note);
      }
    }
    const release = document.getElementById('appReleaseStatic');
    if (release) release.textContent = `Version : ${VERSION}`;
  }

  function install() {
    decorate();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; decorate(); });
    }).observe(document.body, { childList: true, subtree: true });
    window.AssistantArcherPointAudit = Object.freeze({ version: VERSION, refresh: decorate });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', install, { once: true }) : install();
})();
