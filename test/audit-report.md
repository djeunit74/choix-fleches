# Audit factuel d’Assistant Archer

Date : 21 octobre 2026. Proposition de mise à jour, non déployée.

## Résultat

L’application d’origine ne peut pas être certifiée exacte dans son ensemble. L’audit confirme des erreurs de transcription et des règles présentées avec une précision que leurs sources ne justifient pas. La version proposée n’utilise pour les conseils automatiques que le jeu de tableaux explicitement contrôlé. Les données historiques restent dans le dépôt et dans les carnets ; leur retrait du moteur ne signifie pas qu’elles sont toutes fausses.

## Périmètre et traçabilité

- 18 fichiers JSON historiques inventoriés, 817 objets contenant des champs scalaires, 8 438 champs scalaires. Ces nombres comptent aussi les métadonnées et les doublons entre versions ; ce ne sont pas 8 438 caractéristiques indépendantes.
- 129 URL distinctes présentes dans ces données contrôlées : 121 ont répondu avec un statut HTTP de succès ; 8 n’ont pas pu être récupérées. Ni un HTTP 200 ni la présence d’une URL ne certifient un prix, un stock ou une caractéristique technique.
- Les 16 fichiers techniques présents à la fois à la racine et dans test/ sont identiques ; deals.json et deals-config.json n’ont pas de copie identique dans test/. Les nouvelles sources actives sont synchronisées entre les deux versions.
- Inventaire détaillé : [audit-inventory.json](audit-inventory.json). Chaque objet historique est classé « non certifié » et exclu des conseils automatiques. L’inventaire est un contrôle de couverture et de provenance, pas une validation technique de chaque valeur.
- Les scripts historiques ont été examinés pour identifier les chemins de recommandation, les estimations et les chargements successifs. Ils ne sont plus chargés par la page auditée. Leurs anciens drapeaux « manufacturerVerified », « noInventedWeight » ou « allCurrentFamiliesRegistered » ne sont pas des preuves.

## Tableaux vérifiés

| Source primaire | Contrôle | Traitement dans l’application |
| --- | --- | --- |
| [Easton PN 301055-A](https://eastonarchery.com/wp-content/uploads/2023/08/301055-A-Arrow-Shaft-Selection-Target.pdf) | 168 cases carbone et 144 aluminium, extraction par coordonnées du PDF et revue visuelle | Plage ou codes de tailles publiés ; longueur selon le creux d’encoche, correction branches et masse avant explicites ; aucune conversion des codes aluminium en spine carbone |
| [Victory Recurve Spine Chart](https://victoryarchery.com/wp-content/uploads/2025/03/Recurve-Spine-2024-768x427.png), depuis [Arrow Guide](https://victoryarchery.com/arrow-guide/) | 216 cases, deux bandes de masse avant, contrôle visuel | Refus des bandes non couvertes, des limites ambiguës et d’un arrondi de longueur non documenté ; convention de longueur à confirmer dans la documentation fabricant |
| [Skylon Target / Field / 3D](https://www.skylonarchery.com/images/chart/chart%20target.pdf) | 110 cases recurve et groupes associés, contrôle visuel | Longueur cut-to-cut distincte ; tailles R et lignes sans distinction R/C citées comme telles ; pas de disponibilité actuelle ni de compatibilité de composants déduite |
| [Carbon Express Recurve Series](https://thecarbonexpress.com/wp-content/uploads/2024/11/recurve-series-arrow-selection-chart.pdf) | Comparaison visuelle avec la transcription locale | Lecture automatique suspendue : erreurs locales multiples et ambiguïté NPX7500 dans la source ; le PDF reste accessible sans normalisation des codes |

Total : 638 cases de grille vérifiées pour Easton, Victory et Skylon, cases vides comprises. Les documents ont été récupérés le 21 octobre 2026. Leurs millésimes sont ceux des documents, pas une garantie de gamme commerciale 2026. Les empreintes des PDF et la méthode de contrôle sont dans [verified-charts.json](verified-charts.json).

## Erreurs confirmées

### Easton : cinq cases locales corrigées dans le nouveau jeu actif

| Puissance de la ligne recurve | Longueur | Tableau | Ancienne valeur | Valeur du PDF |
| --- | --- | --- | --- | --- |
| 63–67 lb | 34 pouces | Carbone | 200–150 | 250–200 |
| 21–26 lb | 31 pouces | Aluminium | 1916 / 2016 / 2013 / RX7-21 | 1914 / 1916 / 2013 / RX7-21 |
| 36–39 lb | 31 pouces | Aluminium | 2214 / 2213 / 2312 / RX7-23 | 2114 / 2213 / RX7-23 |
| 48–52 lb | 31 pouces | Aluminium | 2512 / 2613 / 2712 | 2314 / 2413 / 2315 |
| 53–57 lb | 26 pouces | Aluminium | 2114 / 2213 / RX7-23 | 2114 / 2016 / RX7-22 |

La ligne « <20 » n’inclut plus 20 lb. Les valeurs situées dans un intervalle que le tableau ne couvre pas ne sont pas arrondies arbitrairement. La règle publiée d’arrondi des longueurs Easton est appliquée après contrôle des bornes ; aucune longueur hors tableau n’est ramenée à une borne.

### Skylon

Le formulaire réutilisait une longueur mesurée depuis le creux d’encoche alors que le tableau indique cut-to-cut. Il existe désormais un champ séparé. Le groupe A3 Radius était transcrit 850/800 ; la source indique 750/700. Les entrées Edge des groupes A3/A4/A5 et Maverick A8/A10 ont été rétablies dans le jeu actif. Aucune règle d’arrondi absente du document n’est inventée.

### Victory

Les limites 14, 16, 18 et 22 lb peuvent appartenir à deux lignes du tableau publié. L’ancien premier-résultat-trouvé pouvait choisir silencieusement une des lignes. La version auditée refuse une réponse unique lorsque les cases diffèrent. Elle refuse aussi l’intervalle de masse avant 126–149 grains et les valeurs hors des deux bandes publiées.

### Carbon Express

La transcription locale comporte notamment NSST/MPR manquants ou erronés à 35–39 lb / 32 pouces, 40–45 lb / 31–32 pouces et plusieurs lignes supérieures. Le code NPX7500 apparaît aussi dans le document lui-même : il ne doit pas être converti de mémoire en un autre code. L’ancienne correspondance générique, y compris son repli sur 500, n’est plus utilisée. La table « light » n’est pas validée par ce document Recurve Series et n’est plus proposée automatiquement.

## Réglages classique et arc nu

Les règles universelles de band, les cibles de tiller, les cibles de détalonnage et l’estimation « ±2 lb par pouce » ne sont pas certifiées pour le matériel de l’utilisateur. Elles sont retirées des résultats actifs. Le [manuel Hoyt consulté](https://s3.hoyt.com/uploads/2019/2e2ba7387588b16f87b809ac21cac68f8c6529c5.pdf) comporte des consignes propres aux arcs concernés ; il ne permet pas de prescrire les mêmes valeurs à tous les modèles. La [présentation World Archery de l’arc nu](https://www.worldarchery.sport/sport/equipment/barebow) ne justifie pas un tiller universel.

Le seul résultat numérique de réglage est la différence entre les deux mesures de tiller, avec son signe. Le band affiché est la mesure saisie. La notice du modèle exact reste nécessaire pour modifier les vis. Aucun exemple numérique n’est présenté comme une mesure personnelle et l’allonge n’est plus remplie depuis la longueur de flèche.

## FOC, masses et composants

La formule et les origines de mesure ont été vérifiées sur le [calculateur Easton](https://eastonarchery.com/foc-calculator/). Le calcul utilise une flèche complète, une longueur du creux d’encoche à la fin du tube sans pointe, et la distance depuis le même creux au point d’équilibre.

Les seuils prétendument universels salle/extérieur ne sont plus utilisés. Les GPI, diamètres, masses de plumes, colle, adhésifs, pins, encoches, pointes et compatibilités des catalogues historiques ne sont pas certifiés par cet audit. En particulier, les moyennes de fixation et les composants arrière de substitution ne sont pas des mesures du montage de l’utilisateur. Le constructeur automatique et ses estimations de FOC sont suspendus ; le FOC depuis les mesures personnelles reste disponible.

## Modèles, classement et marchands

Le catalogue contient 100 entrées de modèles locales ; les listes de tailles et de matériaux ne sont pas toutes accompagnées d’une preuve primaire précise pour chaque champ. Les pages produit consultées incluent [Avance](https://eastonarchery.com/arrows_/avance-avance-sport/), [VAP](https://victoryarchery.com/arrows-target/vap/) et [VXT](https://victoryarchery.com/arrows-target/vxt/). Elles ne certifient pas les autres fiches, ni toutes les variantes de ces familles. Les recommandations de modèles issues de scores et de valeurs de repli sont donc suspendues.

Les 43 offres marchandes restent des données historiques non certifiées pour le prix, le conditionnement et le stock de la variante recherchée. Le contrôle précédent cherchait des nombres dans toute la page et choisissait un prix proche de l’ancien : ce procédé peut prendre un autre produit, une autre variante ou un prix sans rapport. Il marquait aussi « available » une page HTTP 200 sans preuve de stock. Le script proposé conserve les prix historiques, contrôle seulement l’accès à la page et marque prix et stock comme non vérifiés. Les offres ne sont plus affichées comme conseils dans l’interface auditée.

## Carnet et repères

Les données personnelles existantes sont conservées et exportables. Les anciennes fiches ne sont pas rétroactivement certifiées. Les valeurs de viseur proposées depuis la distance ont été supprimées : les repères sont saisis par l’utilisateur, sans échelle physique universelle ni prédiction balistique. Les champs et l’enregistrement ont été contrôlés en navigateur.

## Validation et limites

- Tests du nouveau moteur : corrections connues, limites de tableaux, masse avant, conditions de branches, convention Skylon, FOC, exclusion des extensions historiques et égalité racine/test.
- Contrôles en navigateur : blocage sans mesures, lecture Easton à 30 lb / 28 pouces / 100 grains, FOC, tiller signé, changement classique/arc nu, carnet et repères.
- Les anciens tests qui exigeaient des libellés de versions incompatibles entre eux ne certifiaient pas les données ; le contrôle continu actif vérifie désormais le moteur audité. Les scripts historiques restent consultables.
- Il n’existe pas de certification générale « tout est vrai ». Les cases explicitement contrôlées peuvent servir de références sous leurs conditions. Les propriétés non démontrées sont bloquées dans les conseils automatiques. Réactiver les fiches, composants et marchands exige une preuve primaire par champ ou variante.
