import Database from '../config/Database.js';

export const passerCommande = async (req, res) => {
  try {
    // 1. Récupérer l'ID du client injecté par le middleware de sécurité
    const idclient = req.user.idclient;
    
    // 2. Récupérer le panier envoyé par le Front (ou Thunder Client)
    // Structure attendue pour le panier : { total: 49.80, produits: [ { idproduit: 1, quantite: 2, prix_unitaire: 24.90 } ] }
    const { total, produits } = req.body;

    if (!total || !produits || produits.length === 0) {
      return res.status(400).json({ error: "Le panier est vide ou les données sont incomplètes." });
    }

    // 3. Insertion dans la table principale 'commandes'
    const resultCommande = await Database.query(
      "INSERT INTO commandes (idclient, total, statut) VALUES (?, ?, 'En attente')",
      [idclient, total]
    );

    // Récupérer l'ID de la commande tout juste générée pour lier les détails
    const idcommande = resultCommande.insertId;

    // 4. Insertion de chaque produit du panier dans 'details_commande'
    for (const produit of produits) {
      await Database.query(
        "INSERT INTO details_commande (idcommande, idproduit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
        [idcommande, produit.idproduit, produit.quantite, produit.prix_unitaire]
      );
    }

    return res.status(201).json({
      message: "Commande enregistrée avec succès !",
      idcommande: idcommande,
      statut: "En attente"
    });

  } catch (error) {
    console.error("💥 Erreur lors de la commande :", error.message);
    return res.status(500).json({ error: "Impossible de valider la commande." });
  }
};