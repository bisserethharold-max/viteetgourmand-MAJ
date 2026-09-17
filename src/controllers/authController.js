import Database from '../config/Database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { envoyerEmailBienvenue } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}\$/;
const FAKE_HASH = "\$2a\$10\$X7E96MvO1vU7L.VvW.9b6O8gA4Y3z7M2W3v7x8y9z0123456789ab";

const authController = {
  inscription: async (req, res) => {
    const { nom, prenom, telephone, adresse, email, password } = req.body;

    if (!nom || !prenom || !telephone || !adresse || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    if (!REGEX_MOT_DE_PASSE.test(password)) {
      return res.status(400).json({ error: "Le mot de passe ne respecte pas les critères de robustesse." });
    }

    try {
      const existant = await Database.query("SELECT idclient FROM client WHERE email = ?;", [email]);
      if (existant && existant.length > 0) {
        return res.status(400).json({ error: "Cet email est déjà associé à un compte." });
      }

      const passwordHache = await bcrypt.hash(password, 10);

      const resultInsert = await Database.query(
        `INSERT INTO client (nom, prenom, telephone, adresse, email, password, role)
         VALUES (?, ?, ?, ?, ?, ?, 'utilisateur');`,
        [nom, prenom, telephone, adresse, email, passwordHache]
      );

      envoyerEmailBienvenue(email, prenom, nom);

      res.status(201).json({ idclient: resultInsert.insertId });
    } catch (error) {
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
      const client = rows && rows.length > 0 ? rows[0] : null;

      const hashToCompare = client ? client.password : FAKE_HASH;
      const motDePasseValide = await bcrypt.compare(password, hashToCompare);

      if (!client || !motDePasseValide) {
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

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        client: {
          idclient: client.idclient,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          role: client.role || 'utilisateur'
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });
    }
  },

  deconnexion: async (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: "Déconnexion réussie." });
  }
};

export default authController;
