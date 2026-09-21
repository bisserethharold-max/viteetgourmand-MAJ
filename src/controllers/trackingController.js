import MongoDatabase from '../config/MongoDatabase.js';

function estAdmin(req) {
  return req.user && req.user.role === 'admin';
}


export const enregistrerVisite = async (req, res) => {
  try {
    const { page } = req.body;
    const db = MongoDatabase.getDb();
    await db.collection('visites').insertOne({
      page: page || 'inconnue',
      date: new Date(),
      user_agent: req.headers['user-agent'] || 'inconnu'
    });
    res.status(201).json({ message: "Visite enregistrée." });
  } catch (error) {
    // Le tracking ne doit JAMAIS bloquer la navigation de l'utilisateur en cas d'échec
    console.error("Erreur enregistrement visite (non bloquant) :", error.message);
    res.status(200).json({ message: "Tracking ignoré." });
  }
};


export const getStatsVisites = async (req, res) => {
  if (!estAdmin(req)) {
    return res.status(403).json({ error: "Accès réservé à l'administrateur." });
  }
  try {
    const db = MongoDatabase.getDb();

    const totalVisites = await db.collection('visites').countDocuments();

    const visitesParPage = await db.collection('visites').aggregate([
      { $group: { _id: '$page', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();

    const septJoursAvant = new Date();
    septJoursAvant.setDate(septJoursAvant.getDate() - 7);
    const visitesRecentes = await db.collection('visites').aggregate([
      { $match: { date: { $gte: septJoursAvant } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const totalLogsCommandes = await db.collection('logs_commandes').countDocuments();

    res.status(200).json({
      total_visites: totalVisites,
      visites_par_page: visitesParPage,
      visites_7_jours: visitesRecentes,
      total_commandes_loggees: totalLogsCommandes
    });
  } catch (error) {
    console.error("Erreur récupération stats MongoDB :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les statistiques." });
  }
};

export async function loggerCommande(donnees) {
  try {
    const db = MongoDatabase.getDb();
    await db.collection('logs_commandes').insertOne({
      ...donnees,
      date_log: new Date()
    });
  } catch (error) {
    console.error("⚠️ Erreur log commande dans MongoDB (non bloquant) :", error.message);
  }
}
