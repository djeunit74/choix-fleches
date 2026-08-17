# Assistant Archer — architecture de la version TEST

Ce fichier sert de reference avant toute modification de `test/`.

## Regle principale

Une fonctionnalite ne doit avoir qu'un seul module responsable. Ne pas ajouter de nouveau script correctif si la fonction peut etre corrigee dans son module proprietaire.

## Ordre de chargement

1. `app.js` — moteur principal de l'application : donnees, calculs, formulaires, rendu des resultats, carnet et reperes.
2. `audit-fixes.js` — point d'entree unique des ajustements de compatibilite, presentation compacte du conseil de pointe, fallback marchand et chargeur des modules TEST.
3. `barebow-guidance.js` — mise en page, textes et synchronisation des mesures specifiques barebow. Le formulaire de reglage de base reste commun au classique.
4. `ui-refactor.js` — navigation simplifiee et assistant de reglage dynamique.
5. `expert-audit.js` — contenus pedagogiques, sources, notes d'audit et bouton de publication TEST.
6. `onboarding.js` — tutoriel de premiere utilisation, presentation du bouton Reglages et gestion des mises a jour PWA.

Les modules 3 a 6 sont charges uniquement depuis `audit-fixes.js`. Aucun de ces modules ne doit charger un autre module.

## Proprietaires fonctionnels

### Choix des fleches
- Calculs de spine et tableaux fabricants : `app.js`
- Presentation compacte du conseil de pointe : `audit-fixes.js` temporairement, a reintegrer ensuite dans `app.js`
- Offres marchands : rendu principal dans `app.js`, fallback compatible centralise temporairement dans `audit-fixes.js`
- Contenus pedagogiques et sources : `expert-audit.js`

Le fallback marchand ne doit intervenir que si aucune offre exacte n'est trouvee pour les modeles recommandes. Il conserve les filtres marque, matiere, type d'arc et profil de tir.

### Reglage de base
- Calculs de band, tiller et puissance estimee : `app.js` + ajustements historiques centralises dans `audit-fixes.js`
- Affichage commun, textes barebow et synchronisation des mesures visibles : `barebow-guidance.js`
- Conseils, alignements, ordre des reglages et sources : `expert-audit.js`

Le barebow ne doit jamais avoir un deuxieme formulaire de saisie parallele. Les champs de base sont communs ; seule l'interpretation change.

### Reglage dynamique
- Assistant fut nu / contacts : `ui-refactor.js`

### Repere palette / viseur
- Donnees et rendu des reperes : `app.js`
- Libelles et presentation classique/barebow : `barebow-guidance.js`
- Navigation : `ui-refactor.js`
- Conseils : `expert-audit.js`

En barebow, l'onglet doit afficher `Repere palette`. En classique, il doit afficher `Reperes`.

### Carnet
- Stockage et rendu : `app.js`
- Clarification du pre-remplissage : `ui-refactor.js`

### Parametres / premiere utilisation / PWA
- Installation de base et identite d'interface : `audit-fixes.js`
- Presentation du bouton Reglages, mini tutoriel et mise a jour : `onboarding.js`
- Bouton de publication TEST : `expert-audit.js`
- Identite de l'application installee : `manifest.webmanifest`
- Cache courant de la version TEST : `choix-fleches-v17` dans `sw.js`

`expert-audit.js` ne doit plus modifier le style du bouton Parametres/Reglages ni l'identite principale : ces responsabilites appartiennent respectivement a `onboarding.js` et `audit-fixes.js`/`manifest.webmanifest`.

## Regles avant modification

Avant chaque changement :

1. Identifier le module proprietaire dans ce document.
2. Rechercher si une autre fonction modifie le meme element ou la meme variable.
3. Modifier le module proprietaire plutot que creer une surcharge supplementaire.
4. Verifier le comportement en classique ET en barebow si la zone est partagee.
5. Verifier que les champs d'exemple restent des placeholders et ne sont pas interpretes comme des mesures utilisateur.
6. Ne pas annoncer une correction terminee avant d'avoir verifie le fichier effectivement charge par `/test/`.

## Fichiers historiques supprimes

- `barebow-layout.js` : integre dans `barebow-guidance.js`.
- `point-guidance.js` : absorbe dans `audit-fixes.js`; aucun module ne doit plus tenter de le charger.
- `merchant-fix.js` : fallback absorbe dans `audit-fixes.js`.
- `arc-empty-state.js` : doublon ancien de l'etat vide, supprime.
- fichier accidentel `c` : supprime.

## Etat de consolidation

La phase de nettoyage structurel de `/test/` est consideree terminee pour cette version. Ne pas entreprendre de nouvelle refonte avant publication : les prochaines modifications doivent etre fonctionnelles et ciblees. Les deux blocs encore centralises temporairement dans `audit-fixes.js` — conseil de pointe et fallback marchand — peuvent etre reintegres plus tard dans `app.js`, mais uniquement dans une phase dediee et testee separement.
