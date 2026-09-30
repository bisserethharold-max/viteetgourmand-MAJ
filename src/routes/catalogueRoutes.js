import express from 'express';
import { verifierAuthentification } from '../middlewares/authMiddleware.js';
import {
  getTousLesPlats,
  creerPlat,
  getTousLesAllergenes,
  creerAllergene
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/plats', getTousLesPlats);
router.post('/plats', verifierAuthentification, creerPlat);

router.get('/allergenes', getTousLesAllergenes);
router.post('/allergenes', verifierAuthentification, creerAllergene);

export default router;
