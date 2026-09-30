SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS mydb DEFAULT CHARACTER SET utf8mb4;
USE mydb;

DROP TABLE IF EXISTS client;
CREATE TABLE client (
  idclient INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  adresse VARCHAR(255) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'utilisateur'
);

DROP TABLE IF EXISTS avis;
CREATE TABLE avis (
  idavis INT AUTO_INCREMENT PRIMARY KEY,
  idclient INT NOT NULL,
  note INT NOT NULL,
  commentaire VARCHAR(500) NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  date_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idclient) REFERENCES client(idclient) ON DELETE CASCADE
);

DROP TABLE IF EXISTS produits;
CREATE TABLE produits (
  idproduit INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  disponible TINYINT(1) NOT NULL DEFAULT 1
);

DROP TABLE IF EXISTS menu;
CREATE TABLE menu (
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

DROP TABLE IF EXISTS menu_image;
CREATE TABLE menu_image (
  idimage INT AUTO_INCREMENT PRIMARY KEY,
  menu_idmenu INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  FOREIGN KEY (menu_idmenu) REFERENCES menu(idmenu) ON DELETE CASCADE
);

DROP TABLE IF EXISTS plat;
CREATE TABLE plat (
  idplat INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  type VARCHAR(45) NOT NULL
);

DROP TABLE IF EXISTS allergene;
CREATE TABLE allergene (
  idallergene INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(45) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS plat_allergene;
CREATE TABLE plat_allergene (
  plat_idplat INT NOT NULL,
  allergene_idallergene INT NOT NULL,
  PRIMARY KEY (plat_idplat, allergene_idallergene),
  FOREIGN KEY (plat_idplat) REFERENCES plat(idplat) ON DELETE CASCADE,
  FOREIGN KEY (allergene_idallergene) REFERENCES allergene(idallergene) ON DELETE CASCADE
);

DROP TABLE IF EXISTS menu_plat;
CREATE TABLE menu_plat (
  menu_idmenu INT NOT NULL,
  plat_idplat INT NOT NULL,
  PRIMARY KEY (menu_idmenu, plat_idplat),
  FOREIGN KEY (menu_idmenu) REFERENCES menu(idmenu) ON DELETE CASCADE,
  FOREIGN KEY (plat_idplat) REFERENCES plat(idplat) ON DELETE CASCADE
);

DROP TABLE IF EXISTS commandes;
CREATE TABLE commandes (
  idcommande INT AUTO_INCREMENT PRIMARY KEY,
  idclient INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'En attente',
  distance_km DECIMAL(10,2) DEFAULT 0,
  frais_livraison DECIMAL(10,2) DEFAULT 0,
  reduction_appliquee DECIMAL(10,2) DEFAULT 0,
  mode_paiement VARCHAR(20) NOT NULL DEFAULT 'carte',
  adresse_livraison VARCHAR(255),
  ville_livraison VARCHAR(100),
  date_prestation DATE NULL,
  heure_livraison VARCHAR(10),
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idclient) REFERENCES client(idclient) ON DELETE CASCADE
);

DROP TABLE IF EXISTS details_commande;
CREATE TABLE details_commande (
  iddetail INT AUTO_INCREMENT PRIMARY KEY,
  idcommande INT NOT NULL,
  idproduit INT NULL,
  idmenu INT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idcommande) REFERENCES commandes(idcommande) ON DELETE CASCADE,
  FOREIGN KEY (idproduit) REFERENCES produits(idproduit) ON DELETE SET NULL,
  FOREIGN KEY (idmenu) REFERENCES menu(idmenu) ON DELETE SET NULL
);

DROP TABLE IF EXISTS location;
CREATE TABLE location (
  idlocation INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255),
  prix_location DECIMAL(10,2) NOT NULL,
  caution DECIMAL(10,2) NOT NULL,
  conditions_recuperation TEXT,
  conditions_remise TEXT,
  stock_disponible INT NOT NULL DEFAULT 0,
  actif TINYINT NOT NULL DEFAULT 1
);

DROP TABLE IF EXISTS location_commande;
CREATE TABLE location_commande (
  idlocation_commande INT AUTO_INCREMENT PRIMARY KEY,
  idcommande INT NOT NULL,
  idlocation INT NOT NULL,
  quantite INT NOT NULL,
  date_pret DATE NOT NULL,
  date_retour DATE NOT NULL,
  caution_appliquee DECIMAL(10,2) NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idcommande) REFERENCES commandes(idcommande) ON DELETE CASCADE,
  FOREIGN KEY (idlocation) REFERENCES location(idlocation) ON DELETE CASCADE
);

DROP TABLE IF EXISTS parametres;
CREATE TABLE parametres (
  idparametre INT PRIMARY KEY,
  frais_base_livraison DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  tarif_par_km DECIMAL(10,2) NOT NULL DEFAULT 0.59,
  adresse_restaurant VARCHAR(255) NOT NULL DEFAULT 'Bordeaux',
  seuil_personnes_supplementaires INT NOT NULL DEFAULT 5,
  pourcentage_reduction_personnes INT NOT NULL DEFAULT 10
);

INSERT INTO parametres (idparametre, frais_base_livraison, tarif_par_km, adresse_restaurant, seuil_personnes_supplementaires, pourcentage_reduction_personnes)
VALUES (1, 5.00, 0.59, 'Bordeaux', 5, 10);

SET FOREIGN_KEY_CHECKS = 1;