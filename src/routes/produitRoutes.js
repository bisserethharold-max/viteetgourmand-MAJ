import express from 'express';
import { getTousLesProduits } from '../controllers/produitController.js';

const router = express.Router();

// Cette route est PUBLIQUE : pas besoin de token pour voir le menu !
router.get('/', getTousLesProduits);

export default router;