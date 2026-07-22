import express from 'express';
import {
  passerCommande,
  getMesCommandes,
  getToutesLesCommandes,
  modifierStatutCommande
} from '../controllers/commandeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔒 Toutes les routes commandes nécessitent d'être connecté
router.post('/', authMiddleware, passerCommande);
router.get('/', authMiddleware, getMesCommandes);
router.get('/toutes', authMiddleware, getToutesLesCommandes);
router.put('/:id/statut', authMiddleware, modifierStatutCommande);

export default router;
