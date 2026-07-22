import Database from '../config/Database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { envoyerEmailBienvenue } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Mot de passe : 10 caractères minimum, au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const authController = {
  inscription: async (req, res) => {
    const { nom, prenom, telephone, adresse, email, password } = req.body;

    // 1. Vérification que tous les champs obligatoires sont présents
    if (!nom || !prenom || !telephone || !adresse || !email || !password) {
      return res.status(400).json({
        error: "Tous les champs sont obligatoires (nom, prénom, numéro de GSM, adresse, email, mot de passe)."
      });
    }

    // 2. Vérification de la robustesse du mot de passe
    if (!REGEX_MOT_DE_PASSE.test(password)) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      });
    }

    try {
      // 3. Vérifier que l'email n'est pas déjà utilisé
      const existant = await Database.query("SELECT idclient FROM client WHERE email = ?;", [email]);
      if (existant && existant.length > 0) {
        return res.status(400).json({ error: "Cet email est déjà associé à un compte." });
      }

      // 4. Hachage du mot de passe
      const passwordHache = await bcrypt.hash(password, 10);

      // 5. Création du compte avec le rôle par défaut 'utilisateur'
      const resultInsert = await Database.query(
        `INSERT INTO client (nom, prenom, telephone, adresse, email, password, role)
         VALUES (?, ?, ?, ?, ?, ?, 'utilisateur');`,
        [nom, prenom, telephone, adresse, email, passwordHache]
      );

      // 6. Envoi automatique de l'email de bienvenue (non-bloquant si ça échoue)
      envoyerEmailBienvenue(email, prenom, nom);

      res.status(201).json({
        message: "Compte créé avec succès ! Un email de bienvenue vous a été envoyé.",
        idclient: resultInsert.insertId
      });
    } catch (error) {
      console.error("🚨 Erreur Inscription :", error.message);
      res.status(500).json({ error: "Une erreur est survenue lors de l'inscription." });
    }
  },

  connexion: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "L'email et le mot de passe sont obligatoires." });
    }

    try {
      const rows = await Database.query("SELECT * FROM client WHERE email = ?;", [email]);

      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }

      const client = rows[0];

      const motDePasseValide = await bcrypt.compare(password, client.password);
      if (!motDePasseValide) {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }

      const token = jwt.sign(
        {
          idclient: client.idclient,
          email: client.email,
          role: client.role || 'utilisateur'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Connexion réussie !",
        token,
        client: {
          idclient: client.idclient,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          role: client.role || 'utilisateur'
        }
      });
    } catch (error) {
      console.error("🚨 Erreur Connexion :", error.message);
      res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });
    }
  }
};

export default authController;
