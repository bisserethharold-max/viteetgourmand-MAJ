import express from 'express';
import {
  getTousLesMenus,
  getMenuParId,
  creerMenu,
  modifierMenu,
  supprimerMenu
} from '../controllers/menuController.js';
import { verifierAuthentification, verifierRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getTousLesMenus);
router.get('/:id', getMenuParId);

router.post('/', verifierAuthentification, verifierRole(['admin', 'employe']), creerMenu);
router.put('/:id', verifierAuthentification, verifierRole(['admin', 'employe']), modifierMenu);
router.delete('/:id', verifierAuthentification, verifierRole(['admin']), supprimerMenu);

export default router;
