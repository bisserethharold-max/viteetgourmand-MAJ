import Database from '../config/Database.js';

function estAutorise(req) {
  const role = req.user && req.user.role;
  return role === 'admin' || role === 'employe';
}

// =========================================================
// POST /api/commandes — passer commande (produits ET/OU menus)
// Structure attendue : { total, produits: [{idproduit, quantite, prix_unitaire}], menus: [{idmenu, quantite, prix_unitaire}] }
// =========================================================
export const passerCommande = async (req, res) => {
  try {
    const idclient = req.user.idclient;
    const { total, produits = [], menus = [] } = req.body;

    if (!total || (produits.length === 0 && menus.length === 0)) {
      return res.status(400).json({ error: "Le panier est vide ou les données sont incomplètes." });
    }

    const resultCommande = await Database.query(
      "INSERT INTO commandes (idclient, total, statut) VALUES (?, ?, 'En attente')",
      [idclient, total]
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
      // On décrémente le stock disponible du menu commandé
      await Database.query(
        "UPDATE menu SET stock_disponible = GREATEST(stock_disponible - ?, 0) WHERE idmenu = ?",
        [menu.quantite, menu.idmenu]
      );
    }

    return res.status(201).json({
      message: "Commande enregistrée avec succès !",
      idcommande,
      statut: "En attente"
    });
  } catch (error) {
    console.error("💥 Erreur lors de la commande :", error.message);
    return res.status(500).json({ error: "Impossible de valider la commande." });
  }
};

// =========================================================
// GET /api/commandes — historique des commandes DU CLIENT CONNECTÉ
// =========================================================
export const getMesCommandes = async (req, res) => {
  try {
    const idclient = req.user.idclient;
    const commandes = await Database.query(
      "SELECT * FROM commandes WHERE idclient = ? ORDER BY date_commande DESC",
      [idclient]
    );

    for (const c of commandes) {
      c.details = await Database.query(
        `SELECT dc.iddetail, dc.quantite, dc.prix_unitaire,
                p.nom AS nom_produit, m.titre AS nom_menu
         FROM details_commande dc
         LEFT JOIN produits p ON p.idproduit = dc.idproduit
         LEFT JOIN menu m ON m.idmenu = dc.idmenu
         WHERE dc.idcommande = ?`,
        [c.idcommande]
      );
    }

    res.status(200).json({ commandes });
  } catch (error) {
    console.error("💥 Erreur récupération commandes :", error.message);
    res.status(500).json({ error: "Impossible de récupérer vos commandes." });
  }
};

// =========================================================
// GET /api/commandes/toutes — TOUTES les commandes (admin / employé)
// =========================================================
export const getToutesLesCommandes = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  try {
    const commandes = await Database.query(
      `SELECT c.*, cl.nom AS client_nom, cl.prenom AS client_prenom, cl.email AS client_email
       FROM commandes c
       JOIN client cl ON cl.idclient = c.idclient
       ORDER BY c.date_commande DESC`
    );

    for (const c of commandes) {
      c.details = await Database.query(
        `SELECT dc.iddetail, dc.quantite, dc.prix_unitaire,
                p.nom AS nom_produit, m.titre AS nom_menu
         FROM details_commande dc
         LEFT JOIN produits p ON p.idproduit = dc.idproduit
         LEFT JOIN menu m ON m.idmenu = dc.idmenu
         WHERE dc.idcommande = ?`,
        [c.idcommande]
      );
    }

    res.status(200).json({ commandes });
  } catch (error) {
    console.error("💥 Erreur récupération de toutes les commandes :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les commandes." });
  }
};

// =========================================================
// PUT /api/commandes/:id/statut — modifier le statut d'une commande (admin / employé)
// Corps attendu : { statut: "En attente" | "Confirmée" | "En préparation" | "Livrée" | "Annulée" }
// =========================================================
export const modifierStatutCommande = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  const { statut } = req.body;
  if (!statut) return res.status(400).json({ error: "Le nouveau statut est obligatoire." });

  try {
    await Database.query("UPDATE commandes SET statut = ? WHERE idcommande = ?", [statut, req.params.id]);
    res.status(200).json({ message: "Statut mis à jour avec succès !" });
  } catch (error) {
    console.error("💥 Erreur modification statut :", error.message);
    res.status(500).json({ error: "Impossible de modifier le statut." });
  }
};
