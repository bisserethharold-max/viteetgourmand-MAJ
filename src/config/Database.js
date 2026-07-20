import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      console.log("✅ Connecté avec succès à la base de données MySQL (Docker)");
    } catch (error) {
      console.error("❌ Erreur de connexion MySQL :", error.message);
      throw error;
    }
  }

  async query(sql, params) {
    if (!this.connection) {
      throw new Error("La base de données n'est pas connectée.");
    }
    
    try {
      const [results] = await this.connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error("❌ Erreur brute dans Database.query :", error.message);
      throw error;
    }
  }
}

export default new Database();