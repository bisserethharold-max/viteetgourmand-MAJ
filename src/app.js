import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import dotenv from 'dotenv';
import Database from './config/Database.js';
import produitRoutes from './routes/produitRoutes.js';
import commandeRoutes from './routes/commandeRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import catalogueRoutes from './routes/catalogueRoutes.js';
import employeRoutes from './routes/employeRoutes.js';
import statistiquesRoutes from './routes/statistiquesRoutes.js';

// 1. Configuration des variables d'environnement
dotenv.config();

// 2. Création de l'application Express (Indispensable avant d'utiliser app.use)
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// 3. Middlewares de base
app.use(express.json());

// 4. Connexions et configuration de la base de données
Database.connect()
  .then(async () => {
    console.log("✅ Connecté avec succès à la base de données MySQL (Docker)");

    // A. ÉTAPE VITALE : Création de la table client d'abord
    try {
      await Database.query(`
        CREATE TABLE IF NOT EXISTS client (
          idclient INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'client'
        );
      `);
      console.log("📐 Table 'client' créée ou vérifiée avec succès !");

      // 🆕 SÉCURITÉ : On force l'ajout de la colonne 'role' si elle a été oubliée par le passé
      try {
        await Database.query("ALTER TABLE client ADD COLUMN role VARCHAR(20) DEFAULT 'client';");
        console.log("📐 Colonne 'role' ajoutée avec succès à la table client !");
      } catch (roleError) {
        // Si l'erreur dit que la colonne existe déjà, c'est parfait, on l'ignore
        console.log("ℹ️ Note : La colonne 'role' existe déjà.");
      }

    } catch (clientTableError) {
      console.error("🚨 Erreur création table client :", clientTableError.message);
    }

    // B. Ajustement de la colonne password (au cas où elle existait déjà mais trop petite)
    try {
      await Database.query("ALTER TABLE client MODIFY COLUMN password VARCHAR(255) NOT NULL;");
      console.log("📐 Colonne 'password' adjusted avec succès !");
    } catch (alterError) {
      console.log("ℹ️ Note : Ajustement password non requis ou déjà fait.");
    }

    // B-bis. Ajout des nouvelles colonnes du formulaire d'inscription enrichi
    const nouvellesColonnesClient = [
      { nom: 'prenom', definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
      { nom: 'telephone', definition: "VARCHAR(20) NOT NULL DEFAULT ''" },
      { nom: 'adresse', definition: "VARCHAR(255) NOT NULL DEFAULT ''" }
    ];
    for (const colonne of nouvellesColonnesClient) {
      try {
        await Database.query(`ALTER TABLE client ADD COLUMN ${colonne.nom} ${colonne.definition};`);
        console.log(`📐 Colonne '${colonne.nom}' ajoutée avec succès à la table client !`);
      } catch (colError) {
        console.log(`ℹ️ Note : La colonne '${colonne.nom}' existe déjà.`);
      }
    }

    // C. Création des tables commandes
    try {
      await Database.query(`
        CREATE TABLE IF NOT EXISTS commandes (
          idcommande INT AUTO_INCREMENT PRIMARY KEY,
          idclient INT NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          statut VARCHAR(50) DEFAULT 'En attente',
          date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS details_commande (
          iddetail INT AUTO_INCREMENT PRIMARY KEY,
          idcommande INT NOT NULL,
          idproduit INT NULL,
          idmenu INT NULL,
          quantite INT NOT NULL,
          prix_unitaire DECIMAL(10, 2) NOT NULL
        );
      `);
      console.log("📐 Tables 'commandes' et 'details_commande' prêtes !");

      // Ajustements pour les bases déjà existantes (avant l'ajout du support des menus)
      try {
        await Database.query("ALTER TABLE details_commande MODIFY COLUMN idproduit INT NULL;");
      } catch (e) { /* déjà fait */ }
      try {
        await Database.query("ALTER TABLE details_commande ADD COLUMN idmenu INT NULL;");
        console.log("📐 Colonne 'idmenu' ajoutée à details_commande !");
      } catch (e) {
        console.log("ℹ️ Note : La colonne 'idmenu' existe déjà.");
      }
    } catch (orderTableError) {
      console.error("🚨 Erreur création tables commandes :", orderTableError.message);
    }

    // D. Création et vérification de la table produits
    try {
      const sqlTableProduits = `
        CREATE TABLE IF NOT EXISTS produits (
          idproduit INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          description TEXT,
          prix DECIMAL(10, 2) NOT NULL,
          categorie VARCHAR(100) NOT NULL,
          image_url VARCHAR(255),
          disponible TINYINT(1) DEFAULT 1
        );
      `;
      await Database.query(sqlTableProduits);
      console.log("📐 Table 'produits' prête !");

      const sqlInsertTest = `
        INSERT INTO produits (idproduit, nom, description, prix, categorie, image_url, disponible)
        VALUES (1, 'Mini-Burgers Foie Gras', 'Plateau de 12 mini-burgers artisanaux au foie gras et confit d''oignons.', 24.90, 'Cocktail Salé', 'https://exemple.com/burgers.jpg', 1)
        ON DUPLICATE KEY UPDATE nom=nom;
      `;
      await Database.query(sqlInsertTest);
      console.log("🍔 Produit de test validé !");

    } catch (tableError) {
      console.error("🚨 Erreur lors de la configuration de la table produits :", tableError.message);
    }

    // E. Création des tables du module MENUS
    try {
      await Database.query(`
        CREATE TABLE IF NOT EXISTS menu (
          idmenu INT AUTO_INCREMENT PRIMARY KEY,
          titre VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          theme VARCHAR(45) NOT NULL,
          regime VARCHAR(45) NOT NULL,
          nombre_personnes_min INT NOT NULL,
          prix_base DECIMAL(10,2) NOT NULL,
          conditions TEXT,
          stock_disponible INT NOT NULL DEFAULT 0,
          actif TINYINT NOT NULL DEFAULT 1
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS menu_image (
          idimage INT AUTO_INCREMENT PRIMARY KEY,
          menu_idmenu INT NOT NULL,
          url VARCHAR(255) NOT NULL,
          FOREIGN KEY (menu_idmenu) REFERENCES menu(idmenu) ON DELETE CASCADE
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS plat (
          idplat INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(150) NOT NULL,
          type VARCHAR(45) NOT NULL
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS allergene (
          idallergene INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(45) NOT NULL UNIQUE
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS plat_allergene (
          plat_idplat INT NOT NULL,
          allergene_idallergene INT NOT NULL,
          PRIMARY KEY (plat_idplat, allergene_idallergene),
          FOREIGN KEY (plat_idplat) REFERENCES plat(idplat) ON DELETE CASCADE,
          FOREIGN KEY (allergene_idallergene) REFERENCES allergene(idallergene) ON DELETE CASCADE
        );
      `);

      await Database.query(`
        CREATE TABLE IF NOT EXISTS menu_plat (
          menu_idmenu INT NOT NULL,
          plat_idplat INT NOT NULL,
          PRIMARY KEY (menu_idmenu, plat_idplat),
          FOREIGN KEY (menu_idmenu) REFERENCES menu(idmenu) ON DELETE CASCADE,
          FOREIGN KEY (plat_idplat) REFERENCES plat(idplat) ON DELETE CASCADE
        );
      `);

      console.log("📐 Tables du module 'menus' prêtes (menu, menu_image, plat, allergene, plat_allergene, menu_plat) !");
    } catch (menuTableError) {
      console.error("🚨 Erreur lors de la configuration des tables menus :", menuTableError.message);
    }
  })
  .catch(err => {
    console.error("❌ Erreur de connexion générale :", err);
  });

// 5. Branchement ordonné de toutes les routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api/statistiques', statistiquesRoutes);

// 6. Route de secours (404)
app.use((req, res) => {
  res.status(404).json({ error: `La route ${req.originalUrl} n'existe pas.` });
});

// 7. Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error("💥 Erreur globale détectée :", err.stack);
  res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
});

// 8. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);
});

export default app;