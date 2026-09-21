import express from 'express';
import { verifierAuthentification, verifierRole } from '../middlewares/authMiddleware.js';
import { getParametres, modifierParametres } from '../controllers/parametresController.js';

const router = express.Router();

router.get('/', getParametres);
router.put('/', verifierAuthentification, verifierRole('admin'), modifierParametres);

export default router;
