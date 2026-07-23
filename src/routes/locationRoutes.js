import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getToutesLesLocations,
  getLocationParId,
  creerLocation,
  modifierLocation,
  supprimerLocation,
  reserverLocation
} from '../controllers/locationController.js';

const router = express.Router();

router.get('/', getToutesLesLocations);
router.get('/:id', getLocationParId);
router.post('/', authMiddleware, creerLocation);
router.put('/:id', authMiddleware, modifierLocation);
router.delete('/:id', authMiddleware, supprimerLocation);
router.post('/reserver', authMiddleware, reserverLocation);

export default router;
