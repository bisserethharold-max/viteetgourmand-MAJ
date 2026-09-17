import express from 'express';
import {
  passerCommande,
  getMesCommandes,
  getToutesLesCommandes,
  modifierStatutCommande
} from '../controllers/commandeController.js';
import { verifierAuthentification, verifierRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifierAuthentification, passerCommande);
router.get('/', verifierAuthentification, getMesCommandes);
router.get('/toutes', verifierAuthentification, verifierRole(['admin', 'employe']), getToutesLesCommandes);
router.put('/:id/statut', verifierAuthentification, verifierRole(['admin', 'employe']), modifierStatutCommande);

export default router;
