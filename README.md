# Choix de Fleches (V2)

Mini application web pour estimer un spine de depart.

## Lancer

1. Ouvrir `index.html` dans un navigateur.
2. Renseigner les parametres d'arc et de fleche.
3. Cliquer sur `Calculer`.

## Publication web app publique

L'application est maintenant prete pour un hebergement statique public (PWA incluse).

### Option 1: GitHub Pages

1. Creer un repository GitHub et pousser ce dossier.
2. Dans `Settings > Pages`: Source `Deploy from a branch`.
3. Choisir la branche (`main`) et le dossier racine (`/root`).
4. Ouvrir l'URL publique fournie par GitHub Pages.

Fichiers deja fournis:
- `manifest.webmanifest`
- `sw.js`
- `404.html`
- `.nojekyll`

### Option 2: Netlify

1. Creer un nouveau site Netlify depuis le repository Git.
2. Build command: vide (aucun build).
3. Publish directory: `.` (racine).
4. Deployer.

Fichier deja fourni:
- `netlify.toml`

## Ce que fait l'app

- Propose un spine principal.
- Donne deux options voisines (plus souple / plus rigide).
- Affiche un niveau d'alerte selon la charge dynamique.
- Adapte le tableau de reference selon la marque preferee.
- En mode `Generique + Toutes`, affiche une comparaison spine par marque.
- Ajoute un mode Skylon (groupe A1..A13) base sur votre capture du tableau.
- Affiche la vitesse compound uniquement si `Type d'arc = Compound` et `Marque preferee = Skylon`.
- Priorise la recommandation Skylon (groupe) quand la marque Skylon est choisie.
- Affiche un niveau de confiance sur la recommandation (Faible / Moyenne / Elevee).
- Permet de filtrer par marque preferee (ou toutes les marques).
- Permet de filtrer les suggestions par budget (Eco / Intermediaire / Premium).
- Gere les unites imperiales (`lbs/pouces`) et metriques (`kg/cm`).
- Sauvegarde les 5 derniers calculs localement.
- Propose des modeles de tubes par spine (base locale editable dans `app.js`).
- Permet d'importer un tableau fabricant en CSV/JSON et de le memoriser localement.
- Affiche des liens utiles d'achat (filtres par marque et budget, sans garantie de prix/stock).

## Mode Skylon

- Selectionner `Marque preferee = Skylon`.
- Pour compound, renseigner `Vitesse arc compound`.
- L'app calcule un groupe Skylon (`A1` a `A13`, ou zone `Y`) selon puissance + longueur.

## Limites

- Le resultat est indicatif, pas un remplacement du tableau fabricant.
- Toujours valider au tir et ajuster selon votre tuning.
- Le filtre budget est indicatif (gamme produit), pas un prix temps reel.
- Les liens d'achat doivent etre verifies manuellement avant achat.

## Import de tableau

### CSV

Format attendu:

```csv
brand,spine,model
easton,500,Inspire
easton,500,Vector
victory,400,VAP Sport|VForce
carbon,340,Hunter XT
```

- Delimiteur accepte: `,` ou `;`
- Plusieurs modeles sur une ligne: separateur `|`

### JSON

Objet imbrique:

```json
{
  "easton": { "500": ["Inspire", "Vector"] },
  "victory": { "400": ["VAP Sport", "VForce"] }
}
```

Ou tableau d'objets:

```json
[
  { "brand": "easton", "spine": "500", "model": "Inspire|Vector" },
  { "brand": "victory", "spine": "400", "models": ["VAP Sport", "VForce"] }
]
```
