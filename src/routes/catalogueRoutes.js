import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getTousLesPlats,
  creerPlat,
  getTousLesAllergenes,
  creerAllergene
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/plats', getTousLesPlats);
router.post('/plats', authMiddleware, creerPlat);

router.get('/allergenes', getTousLesAllergenes);
router.post('/allergenes', authMiddleware, creerAllergene);

export default router;
