# Assistant Archer — offres marchands

## Statut actuel

Le système d’offres marchands n’est **pas considéré comme fonctionnel** tant que le pipeline de données et l’affichage/matching n’ont pas été validés séparément.

État constaté lors de la migration :

- `deals.json` à la racine PUBLIC peut être actualisé alors que `test/deals.json` reste ancien ;
- l’application TEST peut donc afficher une date ancienne ou des offres obsolètes ;
- même avec un fichier de données valide, l’affichage peut échouer si le rapprochement modèle recommandé → `modelKey` → offre marchand est incorrect ;
- l’existence d’un workflow ou d’un script de mise à jour ne suffit pas à conclure que la mise à jour quotidienne fonctionne réellement.

Le diagnostic marchand doit rester distinct du moteur de recommandation des flèches.

## Principe absolu

Les marchands ne doivent **jamais** influencer la recommandation technique.

Ordre strict :

1. configuration archer ;
2. calcul technique ;
3. spine / plage ;
4. modèles réellement compatibles ;
5. explication « Pourquoi ce modèle » ;
6. seulement ensuite recherche d’offres marchands.

Une offre marchande ne doit jamais :

- changer le spine ;
- faire apparaître un modèle techniquement non compatible ;
- supprimer un modèle techniquement pertinent parce qu’aucun prix n’est disponible ;
- modifier le classement technique pour favoriser une offre.

Si la couche marchands tombe en panne, l’application doit continuer à fonctionner techniquement.

## Matching des offres

Une offre ne doit être affichée que si elle correspond de façon fiable à un modèle réellement présent dans le résultat technique.

Clés à privilégier :

- `manufacturer` ;
- `modelKey` ;
- `material` ;
- `bowTypes`.

Éviter un matching basé uniquement sur du texte libre ou des sous-chaînes fragiles.

Exemple : `X10` ne doit pas matcher `X10 Parallel Pro 4 mm` si ce n’est pas le modèle recommandé.

Les alias doivent être :

- centralisés ;
- explicites ;
- spécifiques avant génériques ;
- testés par marque.

## Conditionnement et prix

Pour chaque offre, afficher si possible :

- marchand ;
- modèle exact ;
- prix ;
- lien ;
- conditionnement.

Conditionnements utiles :

- prix à l’unité ;
- lot de 6 ;
- lot de 12 ;
- douzaine ;
- tube seul ;
- flèche complète ;
- conditionnement à vérifier.

Ne jamais comparer directement un prix à l’unité avec un prix pour plusieurs tubes comme s’il s’agissait du même produit.

Structure cible souhaitable :

- `packageType` ;
- `packageQuantity` ;
- `price` ;
- `currency` ;
- `pricePerUnit` lorsque calculable.

## Mise à jour des prix

Les scripts existants doivent être conservés tant que leur remplacement n’est pas validé :

- `scripts/sync-deals.mjs` ;
- `scripts/refresh-prices.mjs`.

Comportement attendu à vérifier :

### `sync-deals.mjs`

- récupère une source distante CSV ou JSON ;
- normalise les offres ;
- écrit actuellement `deals.json` à la racine.

### `refresh-prices.mjs`

- relit `deals.json` ;
- visite les pages marchands ;
- tente d’extraire les prix ;
- applique des garde-fous contre des variations aberrantes ;
- réécrit `deals.json` et les modèles CSV/TSV.

Avant toute correction, vérifier le workflow GitHub Actions complet et les chemins réellement écrits.

Ne pas contourner le problème en recopiant manuellement `deals.json` chaque jour.

## Source de vérité à viser

À terme, il ne doit exister qu’**une seule source de données marchands maintenue automatiquement**.

Architecture recommandée :

- données marchands centrales → mise à jour quotidienne → TEST et PUBLIC lisent la même source ;

ou :

- un unique `deals.json` partagé.

Éviter deux fichiers indépendants `deals.json` et `test/deals.json` qui peuvent diverger.

Toute migration vers une source unique doit être validée d’abord sur TEST sans casser PUBLIC.

## Validation d’une offre avant affichage

Vérifier au minimum :

- `brand` correspond ;
- `modelKey` correspond ;
- matériau cohérent ;
- type d’arc cohérent si l’offre le précise ;
- URL valide ;
- marchand valide ;
- prix présent ;
- modèle réellement proposé dans le résultat technique.

Une offre invalide ou obsolète ne doit jamais bloquer la recommandation technique.

Si aucune offre fiable n’existe, afficher simplement :

> Aucune offre marchande correspondante actuellement.

Ne jamais remplacer cette absence par une offre vaguement similaire.

## Couverture des marques

La logique marchands doit fonctionner pour toutes les marques réellement proposées par le moteur, notamment :

- Easton ;
- Victory ;
- Skylon ;
- Carbon Express ;
- autres marques uniquement si elles sont intégrées proprement au catalogue.

Ne pas spécialiser le système uniquement pour Easton.

## Contrôles de non-régression à ajouter

1. une recommandation X ne doit afficher que X ;
2. aucun modèle absent du résultat technique ne doit apparaître ;
3. pas de doublon d’offre ;
4. pas de doublon marchand/modèle identique ;
5. alias spécifiques testés avant les alias génériques ;
6. conditionnements testés ;
7. `deals.json` vide ;
8. `deals.json` ancien ;
9. offre avec URL cassée ;
10. test multi-marques.

Ajouter également un contrôle de fraîcheur : si `updatedAt` dépasse un seuil défini, l’application peut signaler :

> Données marchands non actualisées récemment.

Ce signal ne doit jamais bloquer le fonctionnement technique de l’application.

## Priorité de correction

Ne pas mélanger cette réparation avec celle du moteur de choix des flèches.

Ordre recommandé :

1. fiabiliser le moteur de recommandation ;
2. corriger les doublons de modèles ;
3. vérifier le matching `modelKey` ;
4. diagnostiquer le pipeline deals ;
5. centraliser la source deals ;
6. vérifier la mise à jour automatique ;
7. tester l’affichage TEST ;
8. seulement ensuite envisager PUBLIC.

PUBLIC ne doit jamais recevoir une modification du système marchand non validée sur TEST.

## Règle finale

Les offres marchands sont un **service annexe**.

Priorité du projet :

1. justesse technique ;
2. sources fabricant ;
3. modèles compatibles ;
4. explication ;
5. prix et marchands seulement ensuite.
