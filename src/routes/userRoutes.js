import express from 'express';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profil', verifierAuthentification, (req, res) => {
  res.json({
    message: "Bienvenue sur votre profil sécurisé !",
    utilisateur: req.user
  });
});

export default router;