import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

import Database from './config/Database.js';
import MongoDatabase from './config/MongoDatabase.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import commandeRoutes from './routes/commandeRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import catalogueRoutes from './routes/catalogueRoutes.js';
import employeRoutes from './routes/employeRoutes.js';
import statistiquesRoutes from './routes/statistiquesRoutes.js';
import parametresRoutes from './routes/parametresRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import avisRoutes from './routes/avisRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

MongoDatabase.connect().catch(() => {});
Database.connect().catch(() => {});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/commandes', commandeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/avis', avisRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `La route ${req.originalUrl} n'existe pas.` });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
});

app.listen(PORT);

export default app;
