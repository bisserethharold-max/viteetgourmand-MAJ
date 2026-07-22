import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = null;
  }

  // Gardé pour compatibilité : app.js appelle Database.connect() au démarrage.
  // Avec un pool, "se connecter" = créer le pool et vérifier qu'il répond.
  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });

      // Vérification que la connexion fonctionne réellement (sinon erreur explicite dès le démarrage)
      const conn = await this.pool.getConnection();
      conn.release();

      console.log("✅ Connecté avec succès à la base de données MySQL (pool, Docker)");
    } catch (error) {
      console.error("❌ Erreur de connexion MySQL :", error.message);
      throw error;
    }
  }

  async query(sql, params) {
    if (!this.pool) {
      throw new Error("La base de données n'est pas connectée.");
    }
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("❌ Erreur brute dans Database.query :", error.message);
      throw error;
    }
  }
}

export default new Database();
