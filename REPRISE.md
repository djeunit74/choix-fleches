# Reprise d’Assistant Archer — 8 novembre 2026

## Projet retrouvé

Assistant Archer est le dépôt https://github.com/djeunit74/choix-fleches et le site https://djeunit74.github.io/choix-fleches/. Le titre figure dans index.html et le manifeste. Il ne s’agit pas d’ArcLive.

Deux copies locales antérieures ont été retrouvées : `C:/Users/User/app choix des fleches` (ancienne version au commit f212c09) et le travail du 21 octobre dans Documents/Codex. La conversation « Reprendre lapp Assistant Archer » ne contient qu’une demande de reprise ; les décisions techniques ont été retrouvées dans « Améliorer l’app Choix flèches ».

La reprise part de main au commit 66c0e63bbdede9b5d6d55e29a8d5534252cbf910. Depuis la base du 21 octobre (03c01f4), seules les données marchandes et leurs modèles CSV/TSV ont changé. Ces mises à jour sont conservées.

## Décisions retrouvées

- L’utilisateur avait demandé d’améliorer la pertinence de l’application et de vérifier toutes les informations.
- La PR nº 4, ouverte et non fusionnée au moment de la reprise, apportait une première clarification des mesures et l’export du carnet. Elle ne contient pas l’audit approfondi resté interrompu localement.
- L’audit du 21 octobre documente des erreurs de transcription et des recommandations sans preuve suffisante. Le présent travail reprend ces corrections, sans présenter l’audit historique comme une nouvelle certification des catalogues actuels.
- Les fiches et repères existants restent personnels et sont conservés. Leurs clés de stockage sont inchangées. Une copie locale de test utilise une autre origine que le site public : ses données ne sont pas automatiquement transférées.

## Améliorations de cette branche

- Lectures explicites des tableaux Easton, Victory et Skylon ; longueur Skylon cut-to-cut séparée ; refus des cases absentes et limites ambiguës. Rapport, provenance et inventaire joints.
- Les anciens classements, estimations de masses, compatibilités et offres marchandes ne sont plus chargés comme conseils automatiques. Carbon Express renvoie au document source sans normaliser ses codes ambigus.
- Tiller signé et band mesuré, sans cible universelle ; FOC depuis les mesures de la flèche terminée.
- Export JSON du carnet, des repères, de l’historique et du brouillon arc nu.
- Aucun repère de viseur ou de prise de corde inventé depuis la distance.
- Correction complémentaire : champs de mesure accessibles en arc nu ; suppression des anciens conseils de matériau après changement de sélection ; formulaire simplifié ; résultat invalidé à chaque modification, y compris pendant le chargement des références.
- Les fichiers chargés ont un nouvel identifiant de version pour éviter de réutiliser les scripts du précédent audit depuis le cache.
- Les anciennes vérifications fondées sur des libellés de version sont archivées dans l’historique Git. Le contrôle actif vérifie le moteur audité et la parité entre la racine et test/.

## Validation effectuée

- Neuf tests du moteur réussis : corrections Easton, conditions de masse/branches, bornes Victory, convention Skylon, blocage Carbon Express, géométrie FOC, exclusion des extensions historiques, parité racine/test, dimensions et provenance des tableaux.
- Syntaxe des sept sources JavaScript actives et du contrôle marchand vérifiée ; `git diff --check` sans erreur.
- Essais dans le navigateur : blocage sans confirmation, Easton 30 lb / 28 pouces / 100 grains = plage 800–700 ; retrait du résultat après changement de puissance ; FOC 72 / 43,2 = 10 % ; tiller 218 − 222 = −4 mm ; band 22,6 cm ; champs visibles en arc nu puis classique ; ancien conseil de matériau absent après changement.
- Fiche enregistrée et retrouvée après rechargement ; repère personnel à 25 m enregistré et retrouvé ; distance ajoutée sans repère prérempli ; export JSON téléchargé et relu (format assistant-archer-backup-v1).
- Les données de démonstration créées pendant ces essais restent sur localhost, pas sur le site public.

## Priorités suivantes et limites

1. Relire et intégrer cette proposition avant publication. La PR nº 4 reste ouverte ; cette branche en reprend et complète le contenu.
2. Réactiver progressivement modèles et composants avec une preuve primaire pour chaque variante et chaque propriété. Les documents contrôlés datent du 21 octobre ; aucune nouvelle vérification commerciale n’est revendiquée.
3. Ajouter la restauration des sauvegardes avec aperçu et protection des données existantes. L’export est disponible ; l’import n’est pas encore implémenté.
4. Réexaminer le fonctionnement hors connexion sur mobile : le service worker actuel ne conserve que le document HTML, pas tous les fichiers nécessaires. Le fonctionnement complet hors connexion n’est pas garanti par cette proposition.

La modification du contrôle marchand préserve les prix historiques et marque prix et stocks non vérifiés. Ce contrôle réseau n’a pas été relancé pendant la reprise.
