SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`employe`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`employe` ;

CREATE TABLE IF NOT EXISTS `mydb`.`employe` (
  `idemploye` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `prenom` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `mot_de_passe` VARCHAR(45) NOT NULL,
  `date_embauche` DATE NOT NULL,
  `poste` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idemploye`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`panier`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`panier` ;

CREATE TABLE IF NOT EXISTS `mydb`.`panier` (
  `idpanier` INT NOT NULL AUTO_INCREMENT,
  `dtae_creation` DATETIME NOT NULL,
  PRIMARY KEY (`idpanier`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`client`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`client` ;

CREATE TABLE IF NOT EXISTS `mydb`.`client` (
  `idclient` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `login` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `email` VARCHAR(65) NOT NULL,
  `telephone` VARCHAR(45) NOT NULL,
  `date_inscription` DATETIME NOT NULL,
  `panier_idpanier` INT NOT NULL,
  PRIMARY KEY (`idclient`),
  INDEX `fk_client_panier_idx` (`panier_idpanier` ASC),
  CONSTRAINT `fk_client_panier`
    FOREIGN KEY (`panier_idpanier`)
    REFERENCES `mydb`.`panier` (`idpanier`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`avis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`avis` ;

CREATE TABLE IF NOT EXISTS `mydb`.`avis` (
  `idavis` INT NOT NULL AUTO_INCREMENT,
  `note` VARCHAR(45) NOT NULL,
  `commentaire` VARCHAR(45) NOT NULL,
  `statut` VARCHAR(45) NOT NULL,
  `date_avis` DATETIME NOT NULL,
  `employe_idemploye` INT NOT NULL,
  `client_idclient` INT NOT NULL,
  PRIMARY KEY (`idavis`),
  INDEX `fk_avis_employe1_idx` (`employe_idemploye` ASC),
  INDEX `fk_avis_client1_idx` (`client_idclient` ASC),
  CONSTRAINT `fk_avis_employe1`
    FOREIGN KEY (`employe_idemploye`)
    REFERENCES `mydb`.`employe` (`idemploye`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_avis_client1`
    FOREIGN KEY (`client_idclient`)
    REFERENCES `mydb`.`client` (`idclient`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`adresse`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`adresse` ;

CREATE TABLE IF NOT EXISTS `mydb`.`adresse` (
  `idadresse` INT NOT NULL AUTO_INCREMENT,
  `rue` VARCHAR(65) NOT NULL,
  `ville` VARCHAR(45) NOT NULL,
  `code_postal` VARCHAR(45) NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idadresse`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`paiement`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`paiement` ;

CREATE TABLE IF NOT EXISTS `mydb`.`paiement` (
  `idpaiement` INT NOT NULL AUTO_INCREMENT,
  `montant` DECIMAL(10,2) NOT NULL,
  `methode` VARCHAR(45) NOT NULL,
  `statut` VARCHAR(45) NOT NULL,
  `date_paiement` DATE NOT NULL,
  PRIMARY KEY (`idpaiement`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`commande`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`commande` ;

CREATE TABLE IF NOT EXISTS `mydb`.`commande` (
  `idcommande` INT NOT NULL AUTO_INCREMENT,
  `date_commande` DATE NOT NULL,
  `date_livraison_souhaitee` DATE NOT NULL,
  `date_livraison_validee` DATE NOT NULL,
  `statut` VARCHAR(45) NOT NULL,
  `mode_reception` VARCHAR(45) NOT NULL,
  `prix_livraison` DECIMAL(10,2) NOT NULL,
  `montant_total` DECIMAL(10,2) NOT NULL,
  `client_idclient` INT NOT NULL,
  `adresse_idadresse` INT NOT NULL,
  `employe_idemploye` INT NOT NULL,
  `paiement_idpaiement` INT NOT NULL,
  PRIMARY KEY (`idcommande`),
  INDEX `fk_commande_client1_idx` (`client_idclient` ASC),
  INDEX `fk_commande_adresse1_idx` (`adresse_idadresse` ASC),
  INDEX `fk_commande_employe1_idx` (`employe_idemploye` ASC),
  INDEX `fk_commande_paiement1_idx` (`paiement_idpaiement` ASC),
  CONSTRAINT `fk_commande_client1`
    FOREIGN KEY (`client_idclient`)
    REFERENCES `mydb`.`client` (`idclient`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commande_adresse1`
    FOREIGN KEY (`adresse_idadresse`)
    REFERENCES `mydb`.`adresse` (`idadresse`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commande_employe1`
    FOREIGN KEY (`employe_idemploye`)
    REFERENCES `mydb`.`employe` (`idemploye`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commande_paiement1`
    FOREIGN KEY (`paiement_idpaiement`)
    REFERENCES `mydb`.`paiement` (`idpaiement`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`categorie`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`categorie` ;

CREATE TABLE IF NOT EXISTS `mydb`.`categorie` (
  `idcategorie` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `ordre_affichage` INT NOT NULL,
  PRIMARY KEY (`idcategorie`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`produit`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`produit` ;

CREATE TABLE IF NOT EXISTS `mydb`.`produit` (
  `idproduit` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `prix` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(45) NOT NULL,
  `disponible` TINYINT NOT NULL,
  `delai_commande_jours` INT NOT NULL,
  `categorie_idcategorie` INT NOT NULL,
  PRIMARY KEY (`idproduit`),
  INDEX `fk_produit_categorie1_idx` (`categorie_idcategorie` ASC),
  CONSTRAINT `fk_produit_categorie1`
    FOREIGN KEY (`categorie_idcategorie`)
    REFERENCES `mydb`.`categorie` (`idcategorie`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`ligne_commande`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ligne_commande` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ligne_commande` (
  `idligne_commande` INT NOT NULL AUTO_INCREMENT,
  `quantite` INT NOT NULL,
  `prix_unitaire` DECIMAL(10,2) NOT NULL,
  `commande_idcommande` INT NOT NULL,
  `produit_idproduit` INT NOT NULL,
  PRIMARY KEY (`idligne_commande`),
  INDEX `fk_ligne commande_commande1_idx` (`commande_idcommande` ASC),
  INDEX `fk_ligne_commande_produit1_idx` (`produit_idproduit` ASC),
  CONSTRAINT `fk_ligne commande_commande1`
    FOREIGN KEY (`commande_idcommande`)
    REFERENCES `mydb`.`commande` (`idcommande`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ligne_commande_produit1`
    FOREIGN KEY (`produit_idproduit`)
    REFERENCES `mydb`.`produit` (`idproduit`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`ligne_panier`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ligne_panier` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ligne_panier` (
  `idligne_panier` INT NOT NULL AUTO_INCREMENT,
  `quantite` INT NOT NULL,
  `panier_idpanier` INT NOT NULL,
  `produit_idproduit` INT NOT NULL,
  PRIMARY KEY (`idligne_panier`),
  INDEX `fk_ligne panier_panier1_idx` (`panier_idpanier` ASC),
  INDEX `fk_ligne panier_produit1_idx` (`produit_idproduit` ASC),
  CONSTRAINT `fk_ligne panier_panier1`
    FOREIGN KEY (`panier_idpanier`)
    REFERENCES `mydb`.`panier` (`idpanier`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ligne panier_produit1`
    FOREIGN KEY (`produit_idproduit`)
    REFERENCES `mydb`.`produit` (`idproduit`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`location`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`location` ;

CREATE TABLE IF NOT EXISTS `mydb`.`location` (
  `idlocation` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `prix_location` DECIMAL(10,2) NOT NULL,
  `caution` DECIMAL(10,2) NOT NULL,
  `quantite_stock` INT NOT NULL,
  `image` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idlocation`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`ligne_location_commande`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ligne_location_commande` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ligne_location_commande` (
  `idligne_location_commande` INT NOT NULL AUTO_INCREMENT,
  `quantite` INT NOT NULL,
  `duree_jours` INT NOT NULL,
  `prix_unitaire` DECIMAL(10,2) NOT NULL,
  `commande_idcommande` INT NOT NULL,
  `location_idlocation` INT NOT NULL,
  PRIMARY KEY (`idligne_location_commande`),
  INDEX `fk_ligne location commande_commande1_idx` (`commande_idcommande` ASC),
  INDEX `fk_ligne location commande_location1_idx` (`location_idlocation` ASC),
  CONSTRAINT `fk_ligne location commande_commande1`
    FOREIGN KEY (`commande_idcommande`)
    REFERENCES `mydb`.`commande` (`idcommande`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ligne location commande_location1`
    FOREIGN KEY (`location_idlocation`)
    REFERENCES `mydb`.`location` (`idlocation`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`ligne_location_panier`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ligne_location_panier` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ligne_location_panier` (
  `idligne_location_panier` INT NOT NULL AUTO_INCREMENT,
  `quantite` INT NOT NULL,
  `duree_jours` INT NOT NULL,
  `panier_idpanier` INT NOT NULL,
  `location_idlocation` INT NOT NULL,
  PRIMARY KEY (`idligne_location_panier`),
  INDEX `fk_ligne location panier_panier1_idx` (`panier_idpanier` ASC),
  INDEX `fk_ligne location panier_location1_idx` (`location_idlocation` ASC),
  CONSTRAINT `fk_ligne location panier_panier1`
    FOREIGN KEY (`panier_idpanier`)
    REFERENCES `mydb`.`panier` (`idpanier`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ligne location panier_location1`
    FOREIGN KEY (`location_idlocation`)
    REFERENCES `mydb`.`location` (`idlocation`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`administrateur`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`administrateur` ;

CREATE TABLE IF NOT EXISTS `mydb`.`administrateur` (
  `gere_comptes_emplyes` TINYINT NOT NULL,
  `idadministrateur` INT NOT NULL AUTO_INCREMENT,
  `employe_idemploye` INT NOT NULL,
  PRIMARY KEY (`idadministrateur`),
  INDEX `fk_administrateur_employe_idx` (`employe_idemploye` ASC),
  CONSTRAINT `fk_administrateur_employe`
    FOREIGN KEY (`employe_idemploye`)
    REFERENCES `mydb`.`employe` (`idemploye`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`allergen`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`allergen` ;

CREATE TABLE IF NOT EXISTS `mydb`.`allergen` (
  `idallergen` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(45) NOT NULL,
  `produit_idproduit` INT NOT NULL,
  PRIMARY KEY (`idallergen`),
  INDEX `fk_allergen_produit1_idx` (`produit_idproduit` ASC),
  CONSTRAINT `fk_allergen_produit1`
    FOREIGN KEY (`produit_idproduit`)
    REFERENCES `mydb`.`produit` (`idproduit`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`filtre_categorie`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`filtre_categorie` ;

CREATE TABLE IF NOT EXISTS `mydb`.`filtre_categorie` (
  `idfiltre_categorie` INT NOT NULL AUTO_INCREMENT,
  `prix_min` DECIMAL(10,2) NOT NULL,
  `prix_max` DECIMAL(10,2) NOT NULL,
  `theme` VARCHAR(45) NOT NULL,
  `regime` VARCHAR(45) NOT NULL,
  `nombre_personnes_min` INT NOT NULL,
  `categorie_idcategorie` INT NOT NULL,
  PRIMARY KEY (`idfiltre_categorie`),
  INDEX `fk_filtre categorie_categorie1_idx` (`categorie_idcategorie` ASC),
  CONSTRAINT `fk_filtre categorie_categorie1`
    FOREIGN KEY (`categorie_idcategorie`)
    REFERENCES `mydb`.`categorie` (`idcategorie`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;