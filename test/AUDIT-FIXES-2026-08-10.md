# Correctifs audit du 10/08/2026

Correctifs appliques :

- blocage des longueurs hors tableaux fabricant au lieu de les rabattre sur la derniere colonne ;
- vrai mode multi-materiaux pour l'option `Tous` ;
- tiller classique coherent : +6 mm pour 66/68 pouces, +4 mm pour 70/72 pouces ;
- orientation barebow calculee sur une cible de tiller a 0 mm ;
- re-rendu initial apres chargement des correctifs.

Validation : syntaxe JavaScript controlee avec `node --check`.
