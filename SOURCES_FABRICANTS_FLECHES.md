# Sources fabricant flèches — règles de préservation

Ce document est une règle de projet. Il doit être lu avant toute modification du catalogue de flèches, des données fabricant ou de la logique qui associe un modèle à un spine.

## Principe général

Ne jamais reconstruire les données de flèches de mémoire.

Avant toute modification du catalogue ou du moteur :

1. vérifier les sources officielles fabricant déjà présentes dans le dépôt ;
2. vérifier si elles sont toujours actuelles ;
3. utiliser une page produit ou un tableau fabricant officiel lorsque disponible ;
4. conserver la source associée à chaque donnée importante.

## Easton

Sources officielles à conserver et à revérifier :

- Target Arrow Shaft Selector ;
- guides/catalogues Target Easton ;
- page X10 ;
- page A/C/E ;
- X10 Parallel Pro 4 mm ;
- X10 Parallel Pro 3,2 mm ;
- Avance / Avance Sport ;
- SuperDrive Micro ;
- Vector / Vector Ready To Shoot ;
- gammes aluminium utiles : X7, X23, RX7, XX75 Platinum Plus.

Règles spécifiques :

- ne jamais inventer un spine intermédiaire absent de la gamme fabricant ;
- distinguer le spine ou la plage issue du tableau de sélection des spines réellement fabriqués pour le modèle.

## Victory

Sources officielles à conserver et à revérifier :

- Victory Arrow Guide / spine selector ;
- pages produit des gammes proposées, notamment VAP, VXT et autres modèles réellement présents dans le catalogue.

## Skylon

Sources officielles à conserver et à revérifier :

- catalogue / tableaux Skylon en vigueur ;
- pages ou fiches des modèles proposés : Radius, Brixxon, Preminens/Premiens, Performa, Precium, Paragon, Edge, etc.

Ne pas conserver un ancien catalogue comme vérité si un catalogue plus récent existe.

## Carbon Express

Sources officielles à conserver et à revérifier :

- Recurve Series Arrow Selection Chart ;
- pages/fiches des modèles réellement proposés : Predator II, Maxima Red, Nano-Pro, Medallion, Nano SST, etc.

Vérifier qu’un modèle est encore commercialisé ou documenté avant de le recommander.

## Avalon

Avalon reste une source/add-on complémentaire.

Ne jamais lui donner priorité sur un tableau du fabricant réel du tube.

## Traçabilité attendue

Chaque modèle du catalogue devrait à terme pouvoir porter :

- `manufacturer`
- `model`
- `material`
- `availableSpines`
- `bowTypes`
- `disciplines`
- `sourceUrl` ou `sourceId`
- `sourceDate` / date de vérification
- `notes` éventuelles

Si une donnée n’a plus de source officielle vérifiable, ne pas l’inventer et la signaler pour révision.

## Migration et refactoring

Lors d’une migration ou d’un refactoring, les URLs et références fabricant présentes dans le dépôt sont des données à préserver. Elles ne doivent pas être supprimées comme du texte accessoire.

Toute évolution du catalogue doit préserver la distinction entre :

- données techniques fabricant ;
- logique de recommandation ;
- affichage ;
- offres marchands.

Les offres marchands ne doivent jamais piloter le choix technique d’un spine ou d’un modèle.
