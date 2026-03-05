# Choix de Fleches

Application web statique pour estimer une configuration de fleche exploitable en club.

## Ce que fait la V2

- travaille uniquement en `lbs` et `pouces`
- separe `recurve` et `compound`
- ajoute `interieur / exterieur / polyvalent`
- ajoute `carbone / alu / alu-carbone`
- ajoute une priorite de selection (`club`, `polyvalence`, `performance`, `competition`)
- produit une recommandation de `spine`, `construction`, `diametre` et `modeles`
- conserve une comparaison par marque quand `Marque preferee = Toutes`
- utilise le tableau integre Skylon quand `Skylon` est choisi

## Lancer

1. Ouvrir [index.html](c:/Users/User/app choix des fleches/index.html) dans un navigateur.
2. Renseigner les parametres.
3. Cliquer sur `Calculer`.

## Publication

Le projet reste compatible avec GitHub Pages et Netlify.

Fichiers statiques deja presents :
- [index.html](c:/Users/User/app choix des fleches/index.html)
- [app.js](c:/Users/User/app choix des fleches/app.js)
- [styles.css](c:/Users/User/app choix des fleches/styles.css)
- [404.html](c:/Users/User/app choix des fleches/404.html)
- [manifest.webmanifest](c:/Users/User/app choix des fleches/manifest.webmanifest)
- [sw.js](c:/Users/User/app choix des fleches/sw.js)

## Limites

- la recommandation reste un point de depart, pas un remplacement du tableau officiel fabricant
- les references alu salle doivent etre confirmees avec le tableau dedie du fabricant
- validation au tir obligatoire : bareshaft, groupements, vol de fleche, tuning
- les bons plans affiches sont indicatifs et a verifier manuellement
