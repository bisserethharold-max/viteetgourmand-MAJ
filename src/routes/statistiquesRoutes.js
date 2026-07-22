import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getStatistiques } from '../controllers/statistiquesController.js';

const router = express.Router();

router.get('/', authMiddleware, getStatistiques);

export default router;
