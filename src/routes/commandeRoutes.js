import express from 'express';
import { passerCommande } from '../controllers/commandeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔒 Route SÉCURISÉE : Le middleware va vérifier le token AVANT de donner l'accès au contrôleur
router.post('/', authMiddleware, passerCommande);

export default router;