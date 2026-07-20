import Database from '../config/Database.js';

export const getTousLesProduits = async (req, res) => {
  try {
    // On récupère tous les produits disponibles en base de données
    const produits = await Database.query("SELECT * FROM produits WHERE disponible = 1");
    
    return res.status(200).json({
      message: "Carte récupérée avec succès !",
      nombre: produits.length,
      produits: produits
    });
  } catch (error) {
    console.error("💥 Erreur récupération produits :", error.message);
    return res.status(500).json({ error: "Impossible de récupérer la carte du restaurant." });
  }
};