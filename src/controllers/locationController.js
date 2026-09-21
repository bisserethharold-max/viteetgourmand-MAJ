import Database from '../config/Database.js';

function estAutorise(req) {
  const role = req.user && req.user.role;
  return role === 'admin' || role === 'employe';
}

export const getToutesLesLocations = async (req, res) => {
  try {
    const locations = await Database.query(
      "SELECT * FROM location WHERE actif = 1 ORDER BY idlocation DESC;"
    );
    res.status(200).json({ nombre: locations.length, locations });
  } catch (error) {
    console.error("Erreur récupération locations :", error.message);
    res.status(500).json({ error: "Impossible de récupérer le matériel disponible." });
  }
};


export const getLocationParId = async (req, res) => {
  try {
    const rows = await Database.query("SELECT * FROM location WHERE idlocation = ?;", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Matériel introuvable." });
    res.status(200).json({ location: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer ce matériel." });
  }
};


export const creerLocation = async (req, res) => {
  if (!estAutorise(req)) return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  const { titre, description, image_url, prix_location, caution, conditions_recuperation, conditions_remise, stock_disponible } = req.body;
  if (!titre || !description || !prix_location || caution === undefined) {
    return res.status(400).json({ error: "Titre, description, prix et caution sont obligatoires." });
  }
  try {
    const result = await Database.query(
      `INSERT INTO location (titre, description, image_url, prix_location, caution, conditions_recuperation, conditions_remise, stock_disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [titre, description, image_url || null, prix_location, caution, conditions_recuperation || null, conditions_remise || null, stock_disponible || 0]
    );
    res.status(201).json({ message: "Matériel ajouté avec succès !", idlocation: result.insertId });
  } catch (error) {
    console.error("Erreur création location :", error.message);
    res.status(500).json({ error: "Impossible d'ajouter ce matériel." });
  }
};

export const modifierLocation = async (req, res) => {
  if (!estAutorise(req)) return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  const { titre, description, image_url, prix_location, caution, conditions_recuperation, conditions_remise, stock_disponible } = req.body;
  try {
    await Database.query(
      `UPDATE location SET titre=?, description=?, image_url=?, prix_location=?, caution=?,
       conditions_recuperation=?, conditions_remise=?, stock_disponible=? WHERE idlocation=?;`,
      [titre, description, image_url || null, prix_location, caution, conditions_recuperation || null, conditions_remise || null, stock_disponible || 0, req.params.id]
    );
    res.status(200).json({ message: "Matériel mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Impossible de modifier ce matériel." });
  }
};

export const supprimerLocation = async (req, res) => {
  if (!estAutorise(req)) return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  try {
    await Database.query("DELETE FROM location WHERE idlocation = ?;", [req.params.id]);
    res.status(200).json({ message: "Matériel supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Impossible de supprimer ce matériel." });
  }
};


export const reserverLocation = async (req, res) => {
  const { idlocation, quantite, date_pret, date_retour } = req.body;
  const idclient = req.user.idclient;

  if (!idlocation || !quantite || !date_pret || !date_retour) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires (matériel, quantité, dates)." });
  }
  if (new Date(date_retour) <= new Date(date_pret)) {
    return res.status(400).json({ error: "La date de retour doit être après la date de prêt." });
  }

  try {
    const rows = await Database.query("SELECT * FROM location WHERE idlocation = ?;", [idlocation]);
    if (rows.length === 0) return res.status(404).json({ error: "Matériel introuvable." });
    const materiel = rows[0];

    if (materiel.stock_disponible < quantite) {
      return res.status(400).json({ error: "Stock insuffisant pour cette quantité." });
    }

    const nbJours = Math.max(1, Math.ceil((new Date(date_retour) - new Date(date_pret)) / (1000 * 60 * 60 * 24)));
    const cautionTotale = Number(materiel.caution) * quantite;
    const total = Number(materiel.prix_location) * quantite * nbJours;

    const resultCommande = await Database.query(
      "INSERT INTO commandes (idclient, total, statut, mode_paiement) VALUES (?, ?, 'En attente', 'carte');",
      [idclient, total]
    );
    const idcommande = resultCommande.insertId;

    await Database.query(
      `INSERT INTO location_commande (idcommande, idlocation, quantite, date_pret, date_retour, caution_appliquee, prix_unitaire)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [idcommande, idlocation, quantite, date_pret, date_retour, cautionTotale, materiel.prix_location]
    );

    await Database.query(
      "UPDATE location SET stock_disponible = GREATEST(stock_disponible - ?, 0) WHERE idlocation = ?;",
      [quantite, idlocation]
    );

    res.status(201).json({
      message: "Réservation enregistrée avec succès !",
      idcommande,
      total,
      caution: cautionTotale,
      nombre_jours: nbJours
    });
  } catch (error) {
    console.error("Erreur réservation location :", error.message);
    res.status(500).json({ error: "Impossible d'enregistrer la réservation." });
  }
};
