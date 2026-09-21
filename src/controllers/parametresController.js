import Database from '../config/Database.js';

function estAdmin(req) {
  return req.user && req.user.role === 'admin';
}


export const getParametres = async (req, res) => {
  try {
    const rows = await Database.query("SELECT * FROM parametres WHERE idparametre = 1;");
    res.status(200).json({ parametres: rows[0] });
  } catch (error) {
    console.error("Erreur récupération paramètres :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les paramètres." });
  }
};


export const modifierParametres = async (req, res) => {
  if (!estAdmin(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur." });
  }
  const {
    frais_base_livraison, tarif_par_km, adresse_restaurant,
    seuil_personnes_supplementaires, pourcentage_reduction_personnes
  } = req.body;
  try {
    await Database.query(
      `UPDATE parametres SET
         frais_base_livraison = ?,
         tarif_par_km = ?,
         adresse_restaurant = ?,
         seuil_personnes_supplementaires = ?,
         pourcentage_reduction_personnes = ?
       WHERE idparametre = 1;`,
      [frais_base_livraison, tarif_par_km, adresse_restaurant, seuil_personnes_supplementaires, pourcentage_reduction_personnes]
    );
    res.status(200).json({ message: "Paramètres mis à jour avec succès !" });
  } catch (error) {
    console.error("Erreur modification paramètres :", error.message);
    res.status(500).json({ error: "Impossible de modifier les paramètres." });
  }
};


export async function calculerFraisLivraison(distanceKm, ville) {
  const villeNormalisee = (ville || '').trim().toLowerCase();
  if (villeNormalisee === 'bordeaux') {
    return 0;
  }
  const rows = await Database.query("SELECT * FROM parametres WHERE idparametre = 1;");
  const p = rows[0];
  return Number(p.frais_base_livraison) + Number(p.tarif_par_km) * Number(distanceKm || 0);
}

export async function calculerPourcentageReductionMenu(nombrePersonnesMinMenu, nombrePersonnesCommandees) {
  const rows = await Database.query("SELECT * FROM parametres WHERE idparametre = 1;");
  const p = rows[0];
  const seuil = Number(p.seuil_personnes_supplementaires);
  const pourcentage = Number(p.pourcentage_reduction_personnes);

  if (nombrePersonnesCommandees >= nombrePersonnesMinMenu + seuil) {
    return pourcentage;
  }
  return 0;
}
