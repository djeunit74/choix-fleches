/* Assistant Archer TEST - contrôleur de version visible, Pré-alpha v36.
   Compatibilité de chargement : ce fichier conserve son ancien nom pour ne pas
   modifier le boot pendant le retour à la stabilité. Il ne contient plus aucune
   logique Easton.

   Règle : la version globale de l'application est pilotée ici uniquement.
   Les versions des modules restent des versions de composants et ne doivent pas
   devenir la version affichée à l'utilisateur. */
(() => {
  'use strict';

  const VERSION = 'Pré-alpha v36';
  const LABEL = `Version : ${VERSION}`;

  function apply() {
    const release = document.getElementById('appReleaseStatic');
    if (!release) return null;
    if (release.textContent !== LABEL) release.textContent = LABEL;
    return release;
  }

  function install() {
    const release = apply();
    if (release) {
      /* Observer strictement limité au libellé de version. Il empêche un ancien
         module de réécrire v28/v30/v31 sans observer le reste du DOM. */
      new MutationObserver(() => apply()).observe(release, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
    window.AssistantArcherRelease = Object.freeze({ version: VERSION, apply });
    window.AssistantArcherEastonModeDisabled = true;
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', install, { once: true })
    : install();
})();
