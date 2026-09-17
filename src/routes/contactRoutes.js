import express from 'express';
import { envoyerContact } from '../controllers/contactController.js';

const router = express.Router();
router.post('/', envoyerContact);

export default router;