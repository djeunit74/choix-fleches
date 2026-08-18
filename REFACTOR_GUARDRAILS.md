# Assistant Archer — garde-fous du refactor

Ce refactor a un objectif unique : simplifier le code sans retirer de fonctionnalite ni modifier silencieusement la logique metier.

## Principes non negociables

- La version publique n'est jamais modifiee directement pendant le refactor.
- Toute evolution est validee sur TEST avant publication.
- Une seule source de verite doit porter les donnees fabricants et modeles.
- Les tableaux et documentations fabricants restent prioritaires pour les plages de spine, materiaux et usages.
- Les recommandations restent indicatives : elles doivent expliquer pourquoi un modele est retenu et inviter a confirmer au tir / avec un entraineur lorsque necessaire.
- Chaque type d'arc garde ses specificites. Ne pas injecter de logique barebow dans le classique ni l'inverse.
- Employer les termes francais dans l'interface ; lorsqu'un terme anglais fabricant ou reglementaire est utile, le presenter comme precision et non comme terme principal.
- Les offres marchands ne doivent jamais piloter la recommandation technique. Elles sont affichees apres la recommandation et uniquement lorsqu'elles correspondent aux marques/modeles retenus.
- Les prix et offres marchands restent une couche separee, actualisable sans modifier les donnees techniques fabricants.
- Les sources (FFTA/World Archery/fabricants/Avalon lorsqu'elle est pertinente) restent visibles et regroupees dans la zone Sources.

## Fonctionnalites a conserver

1. Choix des fleches : marque, materiau, puissance reelle, longueur, discipline/contexte et recommandation de spine.
2. Liste de modeles compatibles multi-marques avec explication « Pourquoi ce modele ».
3. Distinction explicite des constructions, notamment carbone et aluminium/carbone hybride lorsqu'un fabricant les decrit ainsi.
4. Offres marchands coherentes avec les modeles proposes, avec indication du conditionnement lorsque detectable.
5. Mise a jour quotidienne des donnees marchands.
6. Reglage de l'arc classique avec ses mesures, ordre de reglage et validation au tir.
7. Reglage arc nu/barebow avec sa logique specifique et vocabulaire francais (prise de corde variable / ecart sous l'encoche).
8. Carnet : enregistrer et retrouver les reglages.
9. Reperes : enregistrer et consulter les reperes de viseur ou les reperes adaptes au type d'arc.
10. Historique des calculs.
11. Themes et parametres de l'application.
12. Affichage fiable du numero de version.
13. Bouton de publication TEST -> PUBLIC uniquement dans TEST ; aucun bouton de mise a jour forcee dans PUBLIC.
14. Sources et avertissements pedagogiques.
15. Add-on / references Avalon conservees et integrees avec les autres sources, sans recommandation aberrante de spine 2000.

## Architecture cible

- `data/` : catalogue fabricants normalise, sans logique d'interface ni prix marchands.
- moteur de recommandation : fonctions pures qui prennent la configuration et renvoient spine + modeles + raisons + sources.
- couche marchands : rapproche les `modelKey` recommandes avec `deals.json`, sans influencer le moteur technique.
- interface : rend les resultats et gere les formulaires ; elle ne redefinit pas les donnees fabricants.
- correctifs temporaires : a absorber progressivement puis supprimer uniquement apres verification de non-regression.

## Regle de migration

Ne jamais supprimer une ancienne fonction simplement parce qu'elle semble dupliquee. D'abord identifier qui l'appelle, reproduire son comportement dans la nouvelle couche, tester les cas classique/barebow et les quatre marques principales, puis seulement retirer le doublon.
