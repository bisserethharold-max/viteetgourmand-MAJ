CREATE TABLE IF NOT EXISTS client (
  idclient INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL DEFAULT '',
  adresse VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(20) DEFAULT 'utilisateur'
);

CREATE TABLE IF NOT EXISTS commandes (
  idcommande INT AUTO_INCREMENT PRIMARY KEY,
  idclient INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  statut VARCHAR(50) DEFAULT 'En attente',
  distance_km DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  frais_livraison DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reduction_appliquee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  mode_paiement VARCHAR(30) NOT NULL DEFAULT 'carte',
  adresse_livraison VARCHAR(255) NOT NULL DEFAULT '',
  ville_livraison VARCHAR(100) NOT NULL DEFAULT '',
  date_prestation DATE NULL,
  heure_livraison VARCHAR(10) NOT NULL DEFAULT '',
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idclient) REFERENCES client(idclient) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS produits (
  idproduit INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  disponible TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS details_commande (
  iddetail INT AUTO_INCREMENT PRIMARY KEY,
  idcommande INT NOT NULL,
  idproduit INT NULL,
  idmenu INT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (idcommande) REFERENCES commandes(idcommande) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS parametres (
  idparametre INT PRIMARY KEY DEFAULT 1,
  frais_base_livraison DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  tarif_par_km DECIMAL(10,2) NOT NULL DEFAULT 0.59,
  adresse_restaurant VARCHAR(255) NOT NULL DEFAULT 'Bordeaux, France',
  seuil_personnes_supplementaires INT NOT NULL DEFAULT 5,
  pourcentage_reduction_personnes DECIMAL(5,2) NOT NULL DEFAULT 10.00
);

INSERT INTO client (nom, prenom, email, password, role)
VALUES ('Admin', 'Harold', 'admin@viteetgourmand.fr', '$2a$10$X7E96MvO1vU7L.VvW.9b6O8gA4Y3z7M2W3v7x8y9z0123456789ab', 'admin')
ON DUPLICATE KEY UPDATE idclient=idclient;

INSERT INTO parametres (idparametre, frais_base_livraison, tarif_par_km, adresse_restaurant, seuil_personnes_supplementaires, pourcentage_reduction_personnes)
VALUES (1, 5.00, 0.59, 'Bordeaux, France', 5, 10.00)
ON DUPLICATE KEY UPDATE idparametre=idparametre;

INSERT INTO produits (idproduit, nom, description, prix, categorie, image_url, disponible)
VALUES (1, 'Mini-Burgers Foie Gras', 'Plateau de 12 mini-burgers artisanaux au foie gras et confit d''oignons.', 24.90, 'Cocktail Salé', 'https://exemple.com', 1)
ON DUPLICATE KEY UPDATE idproduit=idproduit;
