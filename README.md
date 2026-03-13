# Choix de Fleches

Application web statique pour estimer une configuration de fleche exploitable en club.

V3 : le catalogue technique est desormais pilote par [catalog.json](c:/Users/User/app choix des fleches/catalog.json) avec une fiche directe par modele propose dans l'app.

## Ce que fait l'app

- travaille uniquement en `lbs` et `pouces`
- cible un usage `recurve` uniquement
- propose deux profils de tir : `recurve exterieur` et `recurve salle`
- travaille avec `carbone` ou `alu`
- produit une recommandation de `spine`, `construction`, `diametre` et `modeles`
- affiche aussi le `positionnement serie` et une `plage de pointe` par modele
- recharge le `catalogue technique` depuis [catalog.json](c:/Users/User/app choix des fleches/catalog.json) avec fallback local si le JSON n'est pas disponible
- travaille avec des fiches `modele par modele` : serie, masse, tolerance, composants, orientation d'usage
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
- [catalog.json](c:/Users/User/app choix des fleches/catalog.json)
- [deals.json](c:/Users/User/app choix des fleches/deals.json)
- [deals-config.json](c:/Users/User/app choix des fleches/deals-config.json)

## V3 data-driven

Le moteur charge maintenant deux sources distinctes :

- [catalog.json](c:/Users/User/app choix des fleches/catalog.json) pour les references techniques par marque, spine, modele et metadonnees
- [deals.json](c:/Users/User/app choix des fleches/deals.json) pour les offres marchands

Effet concret :

- la logique de recommandation est moins dependante du code
- l'enrichissement du catalogue peut se faire modele par modele sans reecrire le moteur
- les erreurs de melange de marques ou d'environnements sont plus faciles a auditer
- le resultat peut distinguer plus finement `club`, `performance`, `competition` et le type d'usage reel

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
- l'application reste indicative et doit etre confirmee par un entraineur ou un referent materiel
- les references alu salle doivent etre confirmees avec le tableau dedie du fabricant
- les bons plans affiches sont indicatifs et a verifier manuellement

Tableaux officiels utiles :
- Skylon : https://skylonarchery.com/
- Easton : https://eastonarchery.com/selector/
- Victory : https://victoryarchery.com/arrow-guide/
- Victory fitting charts : https://victoryarchery.com/fitting-charts/
- Carbon Express : https://www.feradyne.com/brands/carbon-express/arrow-charts/
