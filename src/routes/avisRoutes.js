import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getAvisValides,
  getTousLesAvis,
  creerAvis,
  modifierStatutAvis,
  supprimerAvis
} from '../controllers/avisController.js';

const router = express.Router();

router.get('/', getAvisValides);
router.get('/tous', authMiddleware, getTousLesAvis);
router.post('/', authMiddleware, creerAvis);
router.put('/:id/statut', authMiddleware, modifierStatutAvis);
router.delete('/:id', authMiddleware, supprimerAvis);

export default router;
