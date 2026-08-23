/* Assistant Archer TEST - contrôleur de version visible, Pré-alpha v50.
   Compatibilité de chargement : ce fichier conserve son ancien nom pour ne pas
   modifier l'architecture de boot. Il ne contient aucune logique Easton.

   Règle : la version globale de l'application est pilotée ici uniquement.
   Les versions des modules restent des versions de composants et ne doivent pas
   devenir la version affichée à l'utilisateur. */
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v50';
  const LABEL = `Version : ${VERSION}`;

  function apply() {
    const release = document.getElementById('appReleaseStatic');
    if (!release) return null;
    if (release.textContent !== LABEL) release.textContent = LABEL;
    return release;
  }

  function loadRecommendationUi() {
    if (document.querySelector('script[data-recommendation-ui-v40]')) return;
    const script = document.createElement('script');
    script.src = 'recommendation-ui-v40.js?v=20260823-prealpha-v40';
    script.async = false;
    script.dataset.recommendationUiV40 = '1';
    document.head.appendChild(script);
  }

  function loadVaneSizing() {
    if (document.querySelector('script[data-vane-sizing-v44]')) return;
    const script = document.createElement('script');
    script.src = 'vane-sizing.js?v=20260823-prealpha-v44';
    script.async = false;
    script.dataset.vaneSizingV44 = '1';
    document.head.appendChild(script);
  }

  function install() {
    const release = apply();
    if (release) {
      new MutationObserver(() => apply()).observe(release, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
    loadRecommendationUi();
    loadVaneSizing();
    window.AssistantArcherRelease = Object.freeze({ version: VERSION, apply });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
