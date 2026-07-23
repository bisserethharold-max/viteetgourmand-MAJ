import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getParametres, modifierParametres } from '../controllers/parametresController.js';

const router = express.Router();

router.get('/', getParametres);
router.put('/', authMiddleware, modifierParametres);

export default router;
