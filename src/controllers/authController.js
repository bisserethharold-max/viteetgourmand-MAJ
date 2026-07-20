import Database from '../config/Database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// La clé vient maintenant du .env (voir instructions ci-dessous)
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  inscription: async (req, res) => {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ error: "Tous les champs (nom, email, mot de passe) sont obligatoires." });
    }

    try {
      // 1. Vérifier que l'email n'est pas déjà utilisé
      const existant = await Database.query("SELECT idclient FROM client WHERE email = ?;", [email]);
      if (existant && existant.length > 0) {
        return res.status(400).json({ error: "Cet email est déjà associé à un compte." });
      }

      // 2. Hachage du mot de passe (jamais stocké en clair)
      const passwordHache = await bcrypt.hash(password, 10);

      // 3. Insertion explicite (correspond exactement à la table créée dans app.js)
      const resultInsert = await Database.query(
        "INSERT INTO client (nom, email, password, role) VALUES (?, ?, ?, 'client');",
        [nom, email, passwordHache]
      );

      res.status(201).json({
        message: "Compte client créé avec succès !",
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

      // Comparaison sécurisée avec le hash bcrypt (jamais en clair)
      const motDePasseValide = await bcrypt.compare(password, client.password);
      if (!motDePasseValide) {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }

      const token = jwt.sign(
        {
          idclient: client.idclient,
          email: client.email,
          role: client.role || 'client'
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
          email: client.email,
          role: client.role || 'client'
        }
      });
    } catch (error) {
      console.error("🚨 Erreur Connexion :", error.message);
      res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });
    }
  }
};

export default authController;
