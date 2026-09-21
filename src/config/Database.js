import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = null;
  }

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

      const conn = await this.pool.getConnection();
      conn.release();

      console.log("Connecté avec succès à la base de données MySQL (pool, Docker)");
    } catch (error) {
      console.error("Erreur de connexion MySQL :", error.message);
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
