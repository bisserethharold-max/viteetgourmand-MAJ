import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { enregistrerVisite, getStatsVisites } from '../controllers/trackingController.js';

const router = express.Router();

router.post('/visite', enregistrerVisite);
router.get('/stats', authMiddleware, getStatsVisites);

export default router;
