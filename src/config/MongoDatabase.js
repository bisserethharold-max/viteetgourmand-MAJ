import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDatabase {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB_NAME || 'vite_et_gourmand_stats';

    try {
      this.client = await MongoClient.connect(url);
      this.db = this.client.db(dbName);
      console.log("✅ Connecté avec succès à MongoDB (Statistiques)");
    } catch (error) {
      console.error("❌ Erreur de connexion MongoDB :", error.message);
      throw error;
    }
  }

  getDb() {
    if (!this.db) throw new Error("MongoDB n'est pas connecté.");
    return this.db;
  }
}

export default new MongoDatabase();