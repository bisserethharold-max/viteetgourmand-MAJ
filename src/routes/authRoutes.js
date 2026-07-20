import express from 'express';
import authController from '../controllers/authController.js'; 

const router = express.Router();

// Ligne 7 : On utilise bien la méthode de la classe exportée par défaut
router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);

export default router;