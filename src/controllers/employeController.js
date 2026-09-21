import Database from '../config/Database.js';
import bcrypt from 'bcryptjs';

export const getTousLesEmployes = async (req, res) => {
  try {
    const employes = await Database.query(
      "SELECT idclient, nom, prenom, email, telephone, role FROM client WHERE role IN ('employe', 'admin') ORDER BY role, nom"
    );
    res.status(200).json({ employes });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer les employés." });
  }
};

export const creerEmploye = async (req, res) => {
  const { nom, prenom, telephone, adresse, email, password } = req.body;
  if (!nom || !prenom || !telephone || !adresse || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }
  try {
    const existant = await Database.query("SELECT idclient FROM client WHERE email = ?;", [email]);
    if (existant.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà associé à un compte." });
    }
    const passwordHache = await bcrypt.hash(password, 10);
    const result = await Database.query(
      `INSERT INTO client (nom, prenom, telephone, adresse, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?, 'employe');`,
      [nom, prenom, telephone, adresse, email, passwordHache]
    );
    res.status(201).json({ idclient: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Impossible de créer le compte employé." });
  }
};

export const supprimerEmploye = async (req, res) => {
  try {
    const cible = await Database.query("SELECT role FROM client WHERE idclient = ?;", [req.params.id]);
    if (cible.length === 0) {
      return res.status(404).json({ error: "Compte introuvable." });
    }
    if (cible[0].role !== 'employe') {
      return res.status(403).json({ error: "Seuls les comptes employé peuvent être supprimés par cette action." });
    }
    await Database.query("DELETE FROM client WHERE idclient = ?;", [req.params.id]);
    res.status(200).json({ message: "Compte employé supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Impossible de supprimer le compte employé." });
  }
};
