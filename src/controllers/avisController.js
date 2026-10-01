import Database from '../config/Database.js';

function estAutorise(req) {
  const role = req.user && req.user.role;
  return role === 'admin' || role === 'employe';
}

function echapperHtml(chaine) {
  if (typeof chaine !== 'string') return chaine;
  return chaine
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
    console.error("Erreur récupération avis :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les avis." });
  }
};

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
    console.error("Erreur récupération de tous les avis :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les avis." });
  }
};

export const creerAvis = async (req, res) => {
  if (!req.user || !req.user.idclient) {
    return res.status(401).json({ error: "Vous devez être connecté pour publier un avis." });
  }

  const idclient = req.user.idclient;
  const { note, commentaire } = req.body;

  const noteNum = Number(note);
  if (note === undefined || note === null || !Number.isInteger(noteNum) || noteNum < 1 || noteNum > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entier compris entre 1 et 5." });
  }

  const commentaireNettoye = (commentaire || '').trim();
  if (commentaireNettoye.length === 0) {
    return res.status(400).json({ error: "Le commentaire est obligatoire." });
  }

  const commentaireSecurise = echapperHtml(commentaireNettoye);

  try {
    const result = await Database.query(
      "INSERT INTO avis (idclient, note, commentaire, statut) VALUES (?, ?, ?, 'en_attente');",
      [idclient, noteNum, commentaireSecurise]
    );
    res.status(201).json({
      message: "Merci pour votre avis ! Il sera visible après validation par notre équipe.",
      idavis: result.insertId
    });
  } catch (error) {
    console.error("Erreur création avis :", error.message);
    res.status(500).json({ error: "Impossible d'enregistrer votre avis." });
  }
};

export const modifierStatutAvis = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }

  const { statut } = req.body;
  if (!['valide', 'refuse', 'en_attente'].includes(statut)) {
    return res.status(400).json({ error: "Statut invalide." });
  }

  try {
    const result = await Database.query("UPDATE avis SET statut = ? WHERE idavis = ?;", [statut, req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Avis non trouvé." });
    }

    res.status(200).json({ message: "Statut de l'avis mis à jour avec succès !" });
  } catch (error) {
    console.error("Erreur modification statut avis :", error.message);
    res.status(500).json({ error: "Impossible de modifier le statut de l'avis." });
  }
};

export const supprimerAvis = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }

  try {
    const result = await Database.query("DELETE FROM avis WHERE idavis = ?;", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Avis non trouvé." });
    }

    res.status(200).json({ message: "Avis supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur suppression avis :", error.message);
    res.status(500).json({ error: "Impossible de supprimer l'avis." });
  }
};