# Assistant Fleches et Reglages

Aide au choix des fleches et aux reglages de base de l'arc classique.

Une application simple pour aider les archers debutants a choisir des fleches coherentes et regler un arc plus facilement.

Reference pedagogique utile :
- FFTA, `Les fleches` : https://www.ffta.fr/pratiquer/le-materiel/les-fleches

V3 : le catalogue technique est desormais pilote par [catalog.json](c:/Users/User/app choix des fleches/catalog.json) avec une fiche directe par modele propose dans l'app.

## Ce que fait l'app

- travaille uniquement en `lbs` et `pouces`
- cible un usage `recurve` uniquement
- propose deux profils de tir : `recurve exterieur` et `recurve salle`
- travaille avec `carbone` ou `alu`
- produit une recommandation de `spine`, `construction`, `diametre` et `modeles`
- calcule aussi un `poids de pointe conseille` avec des options plausibles selon le tube retenu
- integre un module `reglage de l'arc classique` avec repères de `band`, `tiller`, `point d'encochage` et checklist de base
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

## Mise a jour quotidienne automatique

Le projet contient maintenant :

- [scripts/sync-deals.mjs](c:/Users/User/app choix des fleches/scripts/sync-deals.mjs)
- [.github/workflows/update-deals.yml](c:/Users/User/app choix des fleches/.github/workflows/update-deals.yml)

Ce systeme fait :

1. lit une source distante `JSON` ou `CSV`
2. regenere [deals.json](c:/Users/User/app choix des fleches/deals.json)
3. commit et push automatiquement la mise a jour une fois par jour

Pour l'activer :

1. mets l'URL distante dans `deals-config.json`
2. ou, mieux, ajoute un secret GitHub :
   - `DEALS_REMOTE_JSON_URL`
   - ou `DEALS_REMOTE_CSV_URL`
3. laisse le workflow GitHub Actions tourner chaque jour

Recommendation la plus simple :

- un `Google Sheet` publie en CSV
- l'URL CSV stockee dans le secret `DEALS_REMOTE_CSV_URL`

Avantage :

- les prix peuvent etre mis a jour quotidiennement
- ton PC peut rester eteint
- l'app publique continue de lire [deals.json](c:/Users/User/app choix des fleches/deals.json), donc pas de dependance directe au navigateur de l'utilisateur

## Reglage de l'arc

L'app comporte aussi un module de reglage de l'arc classique.

Il donne des repères pratiques pour :
- le `band`
- le `tiller`
- le `point d'encochage`
- le `repose-fleche`
- l'ordre logique des controles

Base documentaire utilisee :
- fascicule FFTA `Je regle mon arc classique`
- FFTA, `Demarche federale d'enseignement` : https://www.ffta.fr/pratiquer/progressez/la-demarche-federale-denseignement
- FFTA, PDF direct `Je regle mon arc classique` : https://www.ffta.fr/sites/default/files/imported-documents-files/7_arcclassique.pdf

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
- Carbon Express : https://thecarbonexpress.com/wp-content/uploads/2024/11/recurve-series-arrow-selection-chart.pdf
