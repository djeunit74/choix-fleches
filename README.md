# Choix de Fleches

Application web statique pour estimer une configuration de fleche exploitable en club.

## Ce que fait l'app

- travaille uniquement en `lbs` et `pouces`
- cible un usage `recurve` uniquement
- propose deux profils de tir : `recurve exterieur` et `recurve salle`
- travaille avec `carbone` ou `alu`
- produit une recommandation de `spine`, `construction`, `diametre` et `modeles`
- affiche aussi le `positionnement serie` et une `plage de pointe` par modele
- recharge les `offres marchands` a chaque calcul depuis [deals.json](c:/Users/User/app choix des fleches/deals.json)
- peut lire une source distante via [deals-config.json](c:/Users/User/app choix des fleches/deals-config.json)
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
- [deals.json](c:/Users/User/app choix des fleches/deals.json)
- [deals-config.json](c:/Users/User/app choix des fleches/deals-config.json)

## Mise a jour distante des prix

Pour mettre a jour les offres meme si ton PC est eteint, l'app peut lire une source distante :

1. heberger un JSON public avec le schema :
```json
{
  "updatedAt": "2026-03-12T19:00:00+01:00",
  "source": "remote-json",
  "deals": [
    {
      "brand": "skylon",
      "material": "carbon",
      "bowTypes": ["recurve"],
      "tier": "eco",
      "title": "Skylon Brixxon carbone 4,2 lot de 12 tubes",
      "price": "67,50 EUR",
      "url": "https://...",
      "shop": "erhart-sports.com"
    }
  ]
}
```
2. ou publier un CSV avec colonnes :
`brand,material,bowTypes,tier,title,price,url,shop`
3. renseigner l'URL dans [deals-config.json](c:/Users/User/app choix des fleches/deals-config.json)

Exemple CSV :
```csv
brand,material,bowTypes,tier,title,price,url,shop
skylon,carbon,recurve|compound,eco,Skylon Brixxon carbone 4,2 lot de 12 tubes,67,50 EUR,https://www.erhart-sports.com/tubes-nus/skylon-tubes-brixxon-carbone-42-lot-de-12-tubes,erhart-sports.com
```

Recommendation pragmatique :
- `Google Sheet publie en CSV` si plusieurs personnes du club doivent mettre a jour
- `JSON public` si tu veux une structure plus stricte

Important :
- ne donne pas l'ecriture a tout Internet si tu veux garder des donnees fiables
- reserve l'edition a quelques responsables du club

## Limites

- la recommandation reste un point de depart, pas un remplacement du tableau officiel fabricant
- les references alu salle doivent etre confirmees avec le tableau dedie du fabricant
- validation au tir obligatoire : groupements et vol de fleche
- les bons plans affiches sont indicatifs et a verifier manuellement
