import Database from '../config/Database.js';
import { calculerPourcentageReductionMenu, calculerFraisLivraison } from './parametresController.js';
import { loggerCommande } from './trackingController.js';

export const passerCommande = async (req, res) => {
  try {
    const idclient = req.user.idclient;
    const {
      produits = [], menus = [], distance_km = 0, mode_paiement = 'carte', paiement,
      adresse_livraison = '', ville_livraison = '', date_prestation = null, heure_livraison = ''
    } = req.body;

    if (produits.length === 0 && menus.length === 0) {
      return res.status(400).json({ error: "Le panier est vide." });
    }

      if (mode_paiement === 'carte') {
      if (!paiement || !paiement.numero_carte || !paiement.nom_titulaire || !paiement.expiration) {
        return res.status(400).json({ error: "Informations de carte bancaire incomplètes." });
      }
      const numeroNettoye = String(paiement.numero_carte).replace(/\s/g, '');
      if (!/^\d{16}$/.test(numeroNettoye) || !/^\d{2}\/\d{2}$/.test(paiement.expiration)) {
        return res.status(400).json({ error: "Informations bancaires invalides." });
      }
    }


    const sousTotalProduits = produits.reduce((sum, p) => sum + p.prix_unitaire * p.quantite, 0);
    let sousTotalMenus = 0;
    let montantReductionTotal = 0;
    const detailReductions = [];

    for (const menu of menus) {
      const ligneTotal = menu.prix_unitaire * menu.quantite;
      sousTotalMenus += ligneTotal;

      const rows = await Database.query("SELECT nombre_personnes_min, titre FROM menu WHERE idmenu = ?;", [menu.idmenu]);
      if (rows.length === 0) continue;
      const menuMinPersonnes = rows[0].nombre_personnes_min;
      const nombrePersonnesCommandees = menu.nombre_personnes || menuMinPersonnes;

      const pourcentage = await calculerPourcentageReductionMenu(menuMinPersonnes, nombrePersonnesCommandees);
      const montantReductionLigne = ligneTotal * (pourcentage / 100);
      montantReductionTotal += montantReductionLigne;

      if (pourcentage > 0) {
        detailReductions.push({
          menu: rows[0].titre,
          pourcentage_reduction: pourcentage,
          montant_reduction: montantReductionLigne
        });
      }
    }

    const sousTotal = sousTotalProduits + sousTotalMenus;
    const fraisLivraison = await calculerFraisLivraison(distance_km, ville_livraison);
    const total = sousTotal - montantReductionTotal + fraisLivraison;

    const resultCommande = await Database.query(
      `INSERT INTO commandes (idclient, total, statut, distance_km, frais_livraison, reduction_appliquee, mode_paiement, adresse_livraison, ville_livraison, date_prestation, heure_livraison)
       VALUES (?, ?, 'En attente', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idclient, total, distance_km, fraisLivraison, montantReductionTotal, mode_paiement, adresse_livraison, ville_livraison, date_prestation, heure_livraison]
    );
    const idcommande = resultCommande.insertId;

    for (const produit of produits) {
      await Database.query(
        "INSERT INTO details_commande (idcommande, idproduit, idmenu, quantite, prix_unitaire) VALUES (?, ?, NULL, ?, ?)",
        [idcommande, produit.idproduit, produit.quantite, produit.prix_unitaire]
      );
    }

    for (const menu of menus) {
      await Database.query(
        "INSERT INTO details_commande (idcommande, idproduit, idmenu, quantite, prix_unitaire) VALUES (?, NULL, ?, ?, ?)",
        [idcommande, menu.idmenu, menu.quantite, menu.prix_unitaire]
      );
      await Database.query(
        "UPDATE menu SET stock_disponible = GREATEST(stock_disponible - ?, 0) WHERE idmenu = ?",
        [menu.quantite, menu.idmenu]
      );
    }

    loggerCommande({
      idcommande,
      idclient,
      total,
      mode_paiement
    });

    return res.status(201).json({ idcommande, total });
  } catch (error) {
    return res.status(500).json({ error: "Impossible de valider la commande." });
  }
};

export const getMesCommandes = async (req, res) => {
  try {
    const idclient = req.user.idclient;
    const commandes = await Database.query(
      "SELECT idcommande, total, statut, distance_km, frais_livraison, reduction_appliquee, mode_paiement, adresse_livraison, ville_livraison, date_prestation, heure_livraison, date_commande FROM commandes WHERE idclient = ? ORDER BY date_commande DESC",
      [idclient]
    );

    for (const c of commandes) {
      c.details = await Database.query(
        `SELECT dc.iddetail, dc.quantite, dc.prix_unitaire, p.nom AS nom_produit, m.titre AS nom_menu
         FROM details_commande dc
         LEFT JOIN produits p ON p.idproduit = dc.idproduit
         LEFT JOIN menu m ON m.idmenu = dc.idmenu
         WHERE dc.idcommande = ?`,
        [c.idcommande]
      );
    }

    res.status(200).json({ commandes });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer vos commandes." });
  }
};

export const getToutesLesCommandes = async (req, res) => {
  try {
    const commandes = await Database.query(
      `SELECT c.idcommande, c.total, c.statut, c.date_commande, cl.nom AS client_nom, cl.prenom AS client_prenom, cl.email AS client_email
       FROM commandes c
       JOIN client cl ON cl.idclient = c.idclient
       ORDER BY c.date_commande DESC`
    );

    for (const c of commandes) {
      c.details = await Database.query(
        `SELECT dc.iddetail, dc.quantite, dc.prix_unitaire, p.nom AS nom_produit, m.titre AS nom_menu
         FROM details_commande dc
         LEFT JOIN produits p ON p.idproduit = dc.idproduit
         LEFT JOIN menu m ON m.idmenu = dc.idmenu
         WHERE dc.idcommande = ?`,
        [c.idcommande]
      );
    }

    res.status(200).json({ commandes });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer les commandes." });
  }
};

export const modifierStatutCommande = async (req, res) => {
  const { statut } = req.body;
  if (!statut) return res.status(400).json({ error: "Le nouveau statut est obligatoire." });

  try {
    await Database.query("UPDATE commandes SET statut = ? WHERE idcommande = ?", [statut, req.params.id]);
    res.status(200).json({ message: "Statut mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Impossible de modifier le statut." });
  }
};
