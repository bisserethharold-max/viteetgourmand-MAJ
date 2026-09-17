import express from 'express';
import authController from '../controllers/authController.js'; 

const router = express.Router();

router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);
router.post('/deconnexion', authController.deconnexion);

export default router;
