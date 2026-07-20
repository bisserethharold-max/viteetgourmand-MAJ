# Corrections apportées

## Fichiers modifiés
- `controllers/authController.js` : mots de passe hachés avec bcrypt (inscription + connexion), suppression du système fragile de "devinette de colonnes" (SHOW COLUMNS), insertion explicite correspondant au schéma réel de la table `client`.
- `middlewares/authMiddleware.js` : la clé JWT_SECRET vient maintenant de `.env` au lieu d'être codée en dur.

## Fichiers supprimés (code mort, jamais appelés nulle part)
- `models/Client.js` : référencait des colonnes (`login`, `panier_idpanier`, `telephone`) et une table `panier` qui n'existent pas dans le schéma réellement utilisé par `app.js`. Aurait planté si jamais appelé.
- `models/produits.js` : contenait un bug de destructuring (`const [rows] = await db.query(...)`) et n'était jamais importé ailleurs.

Si tu veux réintroduire une couche "models" proprement (recommandé après le rendu, pas avant si le temps manque), il faudra les réécrire pour qu'elles correspondent au schéma simplifié actuellement utilisé (`client`, `commandes`, `details_commande`, `produits`).

## Fichiers inchangés (déjà corrects)
- `controllers/produitController.js`
- `controllers/commandeController.js`
- `routes/*.js`
- `config/Database.js`, `config/MongoDatabase.js`
- `app.js`

## ⚠️ Action requise de ta part : ajouter la clé JWT dans ton `.env`

Ajoute cette ligne dans ton fichier `.env` (remplace par une vraie valeur secrète, longue et aléatoire) :

```
JWT_SECRET=change_moi_par_une_longue_chaine_aleatoire_et_secrete
```

Sans ça, `authController.js` et `authMiddleware.js` planteront (JWT_SECRET sera `undefined`).
