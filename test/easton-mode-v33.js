/* Ancien mode Easton v33 désactivé pour performance.
   Charge le mode unifié v35 sans MutationObserver global. */
(() => {
  'use strict';
  if (typeof document === 'undefined' || document.querySelector('script[data-easton-mode-v35]')) return;
  const script = document.createElement('script');
  script.src = 'easton-mode-v35.js?v=20260823-prealpha-v35-performance';
  script.async = false;
  script.setAttribute('data-easton-mode-v35', '1');
  document.head.appendChild(script);
})();
