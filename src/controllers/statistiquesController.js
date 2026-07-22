import Database from '../config/Database.js';

function estAdmin(req) {
  return req.user && req.user.role === 'admin';
}

// =========================================================
// GET /api/statistiques — vue d'ensemble ventes / CA / stock (admin uniquement)
// =========================================================
export const getStatistiques = async (req, res) => {
  if (!estAdmin(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur." });
  }

  try {
    const [caGlobal] = await Database.query(
      "SELECT COALESCE(SUM(total), 0) AS chiffre_affaires, COUNT(*) AS nombre_commandes FROM commandes;"
    );

    const caParStatut = await Database.query(
      "SELECT statut, COUNT(*) AS nombre, COALESCE(SUM(total), 0) AS montant FROM commandes GROUP BY statut;"
    );

    const ventesParJour = await Database.query(
      `SELECT DATE(date_commande) AS jour, COUNT(*) AS nombre, COALESCE(SUM(total), 0) AS montant
       FROM commandes
       GROUP BY DATE(date_commande)
       ORDER BY jour DESC
       LIMIT 14;`
    );

    const stockMenus = await Database.query(
      "SELECT idmenu, titre, stock_disponible FROM menu ORDER BY stock_disponible ASC;"
    );

    const stockProduits = await Database.query(
      "SELECT idproduit, nom, disponible FROM produits ORDER BY nom ASC;"
    );

    res.status(200).json({
      chiffre_affaires: Number(caGlobal.chiffre_affaires),
      nombre_commandes: caGlobal.nombre_commandes,
      par_statut: caParStatut,
      ventes_14_jours: ventesParJour,
      stock_menus: stockMenus,
      stock_produits: stockProduits
    });
  } catch (error) {
    console.error("🚨 Erreur récupération statistiques :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les statistiques." });
  }
};
