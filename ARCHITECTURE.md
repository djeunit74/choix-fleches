# Assistant Archer — architecture

## Principes

L'application reste une aide indicative. Les tableaux et documentations des fabricants sont prioritaires ; la validation au tir et l'accompagnement d'un entraineur restent recommandes.

## Chargement TEST

Ordre unique dans `test/index.html` :

1. `app-config.js` — version/canal et principes globaux, sans logique metier.
2. `app.js` — moteur historique : calcul, catalogues de secours, stockage local, carnet, reperes, reglage arc et rendu de base.
3. `app-enhancements.js` — seule couche d'integration : garde-fous issus des audits, explication des modeles, references Easton complementaires et alignement des offres marchands.
4. `refactor-smoke.js` — controle non destructif des fonctions/DOM essentiels.

`app-enhancements.js` charge une seule fois les modules specialises :

- `barebow-guidance.js` — presentation et logique specifique arc nu ;
- `ui-refactor.js` — guidage « Que voulez-vous faire ? » et reglage dynamique ;
- `expert-audit.js` — fiches techniques/sources et bouton de publication TEST ;
- `onboarding.js` — tutoriel/PWA ;
- `avalon-addon.js` est charge par le module expert pour conserver l'integration Avalon.

## Donnees

- `test/catalog.json` est la source de donnees catalogue chargee par l'application.
- Les constantes `DEFAULT_CATALOG`/metadonnees presentes dans `app.js` sont conservees uniquement comme **secours hors ligne** : elles ne doivent pas devenir une seconde base a maintenir manuellement.
- `test/deals.json` contient les offres marchands ; sa mise a jour reste independante du moteur de recommandation.

## Regles de maintenance

- Ne plus creer de fichier du type `*-fixes.js` pour corriger un autre correctif.
- Une correction de logique va dans le moteur ou dans `app-enhancements.js` selon sa responsabilite.
- Une donnee fabricant va dans la source catalogue appropriee, avec sa source documentee.
- Les offres marchands ne doivent jamais determiner le choix technique ; elles sont filtrees apres recommandation.
- Le vocabulaire affiche aux archers est francais ; les termes anglais peuvent apparaitre uniquement comme reference secondaire si necessaire.
- Toute publication vers PUBLIC reste manuelle et ne doit intervenir qu'apres validation de TEST.

## Verification

La CI `.github/workflows/refactor-check.yml` controle la syntaxe JavaScript, la presence des fonctions essentielles, la validite des JSON et l'absence des anciennes couches `audit-fixes.js` / `final-fixes.js` dans le chargement.
