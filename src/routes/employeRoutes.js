import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getTousLesEmployes, creerEmploye, supprimerEmploye } from '../controllers/employeController.js';

const router = express.Router();

router.get('/', authMiddleware, getTousLesEmployes);
router.post('/', authMiddleware, creerEmploye);
router.delete('/:id', authMiddleware, supprimerEmploye);

export default router;
