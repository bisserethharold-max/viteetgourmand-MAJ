# Vite et Gourmand — Application Traiteur

Application web (backend + frontend) pour un traiteur : catalogue de menus, commandes en ligne, espaces client / employé / administrateur.

## Stack technique

- **Backend** : Node.js, Express
- **Base de données relationnelle** : MySQL
- **Base de données NoSQL** : MongoDB
- **Emails** : Mailpit (simulateur d'envoi, environnement de développement)
- **Frontend** : HTML, Tailwind CSS, JavaScript vanilla
- **Conteneurisation** : Docker / Docker Compose

## Fonctionnalités principales

- Inscription / connexion sécurisées (mots de passe hachés avec bcrypt, JWT)
- Validation du mot de passe (10 caractères min., majuscule, minuscule, chiffre, caractère spécial)
- Email de bienvenue automatique à l'inscription
- Catalogue unifié de menus avec filtres dynamiques (prix, thème, régime, nombre de personnes minimum), sans rechargement de page
- Fiche détail d'un menu : galerie d'images, plats (entrée/plat/dessert), allergènes, conditions, stock
- Commande de menus, avec décrémentation automatique du stock
- Historique des commandes pour le client connecté
- 3 rôles :
  - **Utilisateur** : consulte les menus, commande, consulte son historique
  - **Employé** : gère les menus et les commandes
  - **Administrateur** : en plus de l'employé, gère les comptes employés, consulte le chiffre d'affaires, le suivi des ventes et du stock
- Accessibilité de base (labels associés, `aria-label`, `aria-live`, `role="dialog"` sur les modales, textes alternatifs descriptifs sur les images)
- Conditions générales de vente consultables (`cgv.html`)

## Installation et lancement

### Prérequis

- Docker et Docker Compose installés

### Étapes

1. Cloner le projet
2. Créer un fichier `.env` à la racine avec les variables suivantes :
   ```
   PORT=3001
   DB_HOST=mysql
   DB_PORT=3306
   DB_USER=traiteur_user
   DB_PASSWORD=*******************
   DB_NAME=mydb
   MONGO_URI=mongodb://mongo:27017
   MONGO_DB_NAME=vite_et_gourmand_stats
   JWT_SECRET=************
   MAIL_HOST=mailpit
   MAIL_PORT=1025
   ```
3. Lancer toute la stack :
   ```bash
   docker-compose up -d --build
   ```
4. Accéder au site :
   - **Frontend** : http://localhost:8080
   - **API backend** : http://localhost:3001/api
   - **Emails de test (Mailpit)** : http://localhost:8025

## Structure du projet

```
viteetgourmand MAJ/
├── .env
├── api.http                       # Requêtes de test API (extension REST Client)
├── test.http                      # Requêtes de test API
├── docker-compose.yml             # Orchestration MySQL + MongoDB + Mailpit + backend + frontend
├── Dockerfile                     # Image du backend Node.js
├── package.json
├── package-lock.json
├── README.md                      # Ce fichier
│
├── node_modules/                  # Dépendances (généré par npm install, non versionné)
│
├── src/                           # Backend
│   ├── app.js                     # Point d'entrée du serveur, création des tables au démarrage
│   ├── config/
│   │   ├── Database.js            # Connexion MySQL (pool de connexions)
│   │   └── MongoDatabase.js       # Connexion MongoDB
│   ├── controllers/
│   │   ├── authController.js      # Inscription / connexion
│   │   ├── commandeController.js  # Passage et gestion des commandes
│   │   ├── employeController.js   # Gestion des comptes employés (admin)
│   │   ├── menuController.js      # CRUD des menus, plats, allergènes
│   │   └── statistiquesController.js  # Chiffre d'affaires, ventes, stock (admin)
│   ├── middlewares/
│   │   └── authMiddleware.js      # Vérification du token JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── catalogueRoutes.js     # Plats / allergènes
│   │   ├── commandeRoutes.js
│   │   ├── employeRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── statistiquesRoutes.js
│   │   └── userRoutes.js
│   └── services/
│       └── emailService.js        # Envoi de l'email de bienvenue via Mailpit
│
└── vite-et-gourmand-front/        # Frontend
    ├── index.html                 # Page d'accueil (carte, connexion, panier)
    ├── menus.html                 # Catalogue public des menus avec filtres dynamiques
    ├── admin-menus.html           # Gestion des menus (employé/admin)
    ├── admin-commandes.html       # Gestion des commandes (employé/admin)
    ├── admin-dashboard.html       # Tableau de bord (admin uniquement)
    └── cgv.html                   # Conditions générales de vente
```

## Modèle de données (tables principales)

| Table | Rôle |
|---|---|
| `client` | Comptes utilisateurs (rôle : `utilisateur`, `employe`, `admin`) |
| `menu` | Catalogue de menus (titre, description, thème, régime, prix, stock...) |
| `menu_image` | Galerie d'images d'un menu |
| `plat` | Plats (entrée / plat / dessert), réutilisables entre plusieurs menus |
| `allergene` | Liste des allergènes |
| `plat_allergene` | Association plat ↔ allergènes (many-to-many) |
| `menu_plat` | Association menu ↔ plats (many-to-many) |
| `commandes` | Commandes passées |
| `details_commande` | Lignes de commande (référence un menu) |

## Comptes de test

Pour tester les espaces employé/admin, créer un compte via le formulaire d'inscription puis mettre à jour son rôle directement en base :

```sql
UPDATE client SET role = 'admin' WHERE email = 'votre_email@exemple.com';
```

Rôles possibles : `utilisateur`, `employe`, `admin`.

