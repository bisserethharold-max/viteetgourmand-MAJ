import Database from '../config/Database.js';

function estAutorise(req) {
  const role = req.user && req.user.role;
  return role === 'admin' || role === 'employe';
}

export const getTousLesMenus = async (req, res) => {
  try {
    const { prix_max, prix_min, theme, regime, personnes_min } = req.query;

    let sql = "SELECT * FROM menu WHERE actif = 1";
    const params = [];

    if (prix_max) {
      sql += " AND prix_base <= ?";
      params.push(prix_max);
    }
    if (prix_min) {
      sql += " AND prix_base >= ?";
      params.push(prix_min);
    }
    if (theme) {
      sql += " AND theme = ?";
      params.push(theme);
    }
    if (regime) {
      sql += " AND regime = ?";
      params.push(regime);
    }
    if (personnes_min) {
      sql += " AND nombre_personnes_min >= ?";
      params.push(personnes_min);
    }

    sql += " ORDER BY idmenu DESC";

    const menus = await Database.query(sql, params);

  
    for (const m of menus) {
      const images = await Database.query(
        "SELECT url FROM menu_image WHERE menu_idmenu = ? LIMIT 1",
        [m.idmenu]
      );
      m.image_apercu = images.length > 0 ? images[0].url : null;
    }

    res.status(200).json({ nombre: menus.length, menus });
  } catch (error) {
    console.error("Erreur récupération menus :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les menus." });
  }
};

export const getMenuParId = async (req, res) => {
  try {
    const { id } = req.params;

    const menus = await Database.query("SELECT * FROM menu WHERE idmenu = ?", [id]);
    if (menus.length === 0) {
      return res.status(404).json({ error: "Menu introuvable." });
    }
    const menu = menus[0];

    menu.images = await Database.query(
      "SELECT idimage, url FROM menu_image WHERE menu_idmenu = ?",
      [id]
    );

    const plats = await Database.query(
      `SELECT p.idplat, p.nom, p.type
       FROM plat p
       JOIN menu_plat mp ON mp.plat_idplat = p.idplat
       WHERE mp.menu_idmenu = ?`,
      [id]
    );

    for (const plat of plats) {
      plat.allergenes = await Database.query(
        `SELECT a.idallergene, a.nom
         FROM allergene a
         JOIN plat_allergene pa ON pa.allergene_idallergene = a.idallergene
         WHERE pa.plat_idplat = ?`,
        [plat.idplat]
      );
    }
    menu.plats = plats;

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Erreur récupération détail menu :", error.message);
    res.status(500).json({ error: "Impossible de récupérer le détail du menu." });
  }
};


export const creerMenu = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }

  const {
    titre, description, theme, regime,
    nombre_personnes_min, prix_base, conditions,
    stock_disponible, images = [], plats_ids = []
  } = req.body;

  if (!titre || !description || !theme || !regime || !nombre_personnes_min || !prix_base) {
    return res.status(400).json({ error: "Champs obligatoires manquants (titre, description, theme, regime, nombre_personnes_min, prix_base)." });
  }

  try {
    const result = await Database.query(
      `INSERT INTO menu (titre, description, theme, regime, nombre_personnes_min, prix_base, conditions, stock_disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [titre, description, theme, regime, nombre_personnes_min, prix_base, conditions || null, stock_disponible || 0]
    );
    const idmenu = result.insertId;

    for (const url of images) {
      await Database.query("INSERT INTO menu_image (menu_idmenu, url) VALUES (?, ?);", [idmenu, url]);
    }
    for (const idplat of plats_ids) {
      await Database.query("INSERT INTO menu_plat (menu_idmenu, plat_idplat) VALUES (?, ?);", [idmenu, idplat]);
    }

    res.status(201).json({ message: "Menu créé avec succès !", idmenu });
  } catch (error) {
    console.error("Erreur création menu :", error.message);
    res.status(500).json({ error: "Impossible de créer le menu." });
  }
};


export const modifierMenu = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }

  const { id } = req.params;
  const {
    titre, description, theme, regime,
    nombre_personnes_min, prix_base, conditions,
    stock_disponible, images, plats_ids
  } = req.body;

  try {
    await Database.query(
      `UPDATE menu SET titre=?, description=?, theme=?, regime=?, nombre_personnes_min=?,
       prix_base=?, conditions=?, stock_disponible=? WHERE idmenu=?;`,
      [titre, description, theme, regime, nombre_personnes_min, prix_base, conditions || null, stock_disponible || 0, id]
    );

    if (Array.isArray(images)) {
      await Database.query("DELETE FROM menu_image WHERE menu_idmenu = ?;", [id]);
      for (const url of images) {
        await Database.query("INSERT INTO menu_image (menu_idmenu, url) VALUES (?, ?);", [id, url]);
      }
    }

    if (Array.isArray(plats_ids)) {
      await Database.query("DELETE FROM menu_plat WHERE menu_idmenu = ?;", [id]);
      for (const idplat of plats_ids) {
        await Database.query("INSERT INTO menu_plat (menu_idmenu, plat_idplat) VALUES (?, ?);", [id, idplat]);
      }
    }

    res.status(200).json({ message: "Menu mis à jour avec succès !" });
  } catch (error) {
    console.error("Erreur modification menu :", error.message);
    res.status(500).json({ error: "Impossible de modifier le menu." });
  }
};


export const supprimerMenu = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  try {
    await Database.query("DELETE FROM menu WHERE idmenu = ?;", [req.params.id]);
    res.status(200).json({ message: "Menu supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur suppression menu :", error.message);
    res.status(500).json({ error: "Impossible de supprimer le menu." });
  }
};

export const getTousLesPlats = async (req, res) => {
  try {
    const plats = await Database.query("SELECT * FROM plat ORDER BY nom ASC");
    res.status(200).json({ plats });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer les plats." });
  }
};

export const creerPlat = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  const { nom, type, allergenes_ids = [] } = req.body;
  if (!nom || !type) {
    return res.status(400).json({ error: "Le nom et le type (entree, plat, dessert) sont obligatoires." });
  }
  try {
    const result = await Database.query("INSERT INTO plat (nom, type) VALUES (?, ?);", [nom, type]);
    const idplat = result.insertId;
    for (const idallergene of allergenes_ids) {
      await Database.query("INSERT INTO plat_allergene (plat_idplat, allergene_idallergene) VALUES (?, ?);", [idplat, idallergene]);
    }
    res.status(201).json({ message: "Plat créé avec succès !", idplat });
  } catch (error) {
    console.error("Erreur création plat :", error.message);
    res.status(500).json({ error: "Impossible de créer le plat." });
  }
};

export const getTousLesAllergenes = async (req, res) => {
  try {
    const allergenes = await Database.query("SELECT * FROM allergene ORDER BY nom ASC");
    res.status(200).json({ allergenes });
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer les allergènes." });
  }
};

export const creerAllergene = async (req, res) => {
  if (!estAutorise(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur ou à l'employé." });
  }
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ error: "Le nom de l'allergène est obligatoire." });
  try {
    const result = await Database.query(
      "INSERT INTO allergene (nom) VALUES (?) ON DUPLICATE KEY UPDATE nom=nom;",
      [nom]
    );
    res.status(201).json({ message: "Allergène créé avec succès !", idallergene: result.insertId });
  } catch (error) {
    console.error("Erreur création allergène :", error.message);
    res.status(500).json({ error: "Impossible de créer l'allergène." });
  }
};
