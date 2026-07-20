import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  }
  if (!token && req.query) token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Jeton manquant ou non fourni." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Jeton d'authentification invalide ou expiré." });
  }
};

export default authMiddleware;
