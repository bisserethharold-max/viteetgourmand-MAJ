import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifierAuthentification = (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Aucun jeton fourni." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Jeton de sécurité invalide ou expiré." });
  }
};

export const verifierRole = (rolesAutorises) => {
  return (req, res, next) => {
    const listeRoles = Array.isArray(rolesAutorises) ? rolesAutorises : [rolesAutorises];
    if (!req.user || !listeRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès interdit. Droits insuffisants." });
    }
    next();
  };
};

