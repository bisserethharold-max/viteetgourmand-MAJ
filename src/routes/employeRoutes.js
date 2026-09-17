import express from 'express';
import { getTousLesEmployes, creerEmploye, supprimerEmploye } from '../controllers/employeController.js';
import { verifierAuthentification, verifierRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifierAuthentification, verifierRole(['admin']), getTousLesEmployes);
router.post('/', verifierAuthentification, verifierRole(['admin']), creerEmploye);
router.delete('/:id', verifierAuthentification, verifierRole(['admin']), supprimerEmploye);

export default router;
