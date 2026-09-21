import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profil', authMiddleware, (req, res) => {
  res.json({
    message: "Bienvenue sur votre profil sécurisé !",
    utilisateur: req.user
  });
});

export default router;