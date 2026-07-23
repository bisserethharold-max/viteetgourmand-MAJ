import Database from '../config/Database.js';

function estAutorise(req) {
  const role = req.user && req.user.role;
  return role === 'admin' || role === 'employe';
}

// =========================================================
// GET /api/avis — avis VALIDÉS uniquement (public, page d'accueil)
// =========================================================
export const getAvisValides = async (req, res) => {
  try {
    const avis = await Database.query(
      `SELECT a.idavis, a.note, a.commentaire, a.date_avis, c.nom, c.prenom
       FROM avis a
       JOIN client c ON c.idclient = a.idclient
       WHERE a.statut = 'valide'
       ORDER BY a.date_avis DESC
       LIMIT 20;`
    );
    res.status(200).json({ avis });
  } catch (error) {
    console.error("🚨 Erreur récupération avis :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les avis." });
  }
};

// =========================================================
// GET /api/avis/tous — TOUS les avis, quel que soit le statut (admin/employé)
// =========================================================
export const getTousLesAvis = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  try {
    const avis = await Database.query(
      `SELECT a.idavis, a.note, a.commentaire, a.statut, a.date_avis, c.nom, c.prenom, c.email
       FROM avis a
       JOIN client c ON c.idclient = a.idclient
       ORDER BY a.date_avis DESC;`
    );
    res.status(200).json({ avis });
  } catch (error) {
    console.error("🚨 Erreur récupération de tous les avis :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les avis." });
  }
};

// =========================================================
// POST /api/avis — un client connecté dépose un avis (statut : en_attente par défaut)
// =========================================================
export const creerAvis = async (req, res) => {
  const idclient = req.user.idclient;
  const { note, commentaire } = req.body;

  if (!note || !commentaire) {
    return res.status(400).json({ error: "La note et le commentaire sont obligatoires." });
  }
  if (note < 1 || note > 5) {
    return res.status(400).json({ error: "La note doit être comprise entre 1 et 5." });
  }

  try {
    const result = await Database.query(
      "INSERT INTO avis (idclient, note, commentaire, statut) VALUES (?, ?, ?, 'en_attente');",
      [idclient, note, commentaire]
    );
    res.status(201).json({
      message: "Merci pour votre avis ! Il sera visible après validation par notre équipe.",
      idavis: result.insertId
    });
  } catch (error) {
    console.error("🚨 Erreur création avis :", error.message);
    res.status(500).json({ error: "Impossible d'enregistrer votre avis." });
  }
};

// =========================================================
// PUT /api/avis/:id/statut — valider ou refuser un avis (admin/employé)
// Corps attendu : { statut: "valide" | "refuse" }
// =========================================================
export const modifierStatutAvis = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  const { statut } = req.body;
  if (!['valide', 'refuse', 'en_attente'].includes(statut)) {
    return res.status(400).json({ error: "Statut invalide." });
  }
  try {
    await Database.query("UPDATE avis SET statut = ? WHERE idavis = ?;", [statut, req.params.id]);
    res.status(200).json({ message: "Statut de l'avis mis à jour avec succès !" });
  } catch (error) {
    console.error("🚨 Erreur modification statut avis :", error.message);
    res.status(500).json({ error: "Impossible de modifier le statut de l'avis." });
  }
};

// =========================================================
// DELETE /api/avis/:id — supprimer un avis (admin/employé)
// =========================================================
export const supprimerAvis = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  try {
    await Database.query("DELETE FROM avis WHERE idavis = ?;", [req.params.id]);
    res.status(200).json({ message: "Avis supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Impossible de supprimer l'avis." });
  }
};
