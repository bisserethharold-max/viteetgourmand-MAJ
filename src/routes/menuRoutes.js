import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getTousLesMenus,
  getMenuParId,
  creerMenu,
  modifierMenu,
  supprimerMenu,
  getTousLesPlats,
  creerPlat,
  getTousLesAllergenes,
  creerAllergene
} from '../controllers/menuController.js';

const router = express.Router();

// visiteurs et clients
router.get('/', getTousLesMenus);
router.get('/:id', getMenuParId);

// administeurs et employés
router.post('/', authMiddleware, creerMenu);
router.put('/:id', authMiddleware, modifierMenu);
router.delete('/:id', authMiddleware, supprimerMenu);

router.get('/', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
