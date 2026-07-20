import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route protégée : seul un utilisateur connecté peut y accéder
router.get('/profil', authMiddleware, (req, res) => {
  res.json({
    message: "Bienvenue sur votre profil sécurisé !",
    utilisateur: req.user // Contient l'id, l'email et le role extraits du token
  });
});

export default router;