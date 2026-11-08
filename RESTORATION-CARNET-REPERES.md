# Retour au modèle historique du carnet et des repères

À la demande de l’utilisateur, les deux panneaux sont repris depuis le modèle archivé du dépôt au commit 0980098 : carnet en blocs Démarrage rapide, Fiche, Matériel, Réglage, Flèches et Notes ; réglette viseur et palette arc nu, curseurs par distance et choix d’écriture gauche/droite. La présentation historique est appliquée dans ces panneaux.

Les clés et le format de stockage des fiches et repères sont inchangés. Aucune migration ni suppression de données personnelles n’est effectuée. Les fonctions de chargement, d’enregistrement et de sélection classique/arc nu utilisent les contrôles d’origine. Les outils de pointe et les calculs vérifiés restent disponibles.

Un nouveau curseur apparaît à une position neutre marquée « à placer », indépendante de la distance, et n’est pas enregistré tant que l’utilisateur ne l’a pas déplacé. Les mesures déjà enregistrées sont reprises telles quelles. Les repères non numériques sont conservés dans les fiches ; la réglette affiche les repères numériques en centimètres.

Validation : syntaxe JavaScript, parité racine/test et 22 tests réussis. Essais en navigateur : enregistrement puis rechargement d’une fiche ; ajout, déplacement clavier et rechargement d’un repère viseur ; choix d’écriture à droite ; changement vers la palette arc nu ; déplacement à la souris et conservation du repère après rechargement. Les essais utilisent uniquement des fiches de démonstration locales.
