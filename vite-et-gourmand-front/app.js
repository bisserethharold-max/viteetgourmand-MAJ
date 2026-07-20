const API_URL = "http://localhost:3001/api";

async function chargerCatalogue() {
  const catalogueDiv = document.getElementById("catalogue");

  try {
    const response = await fetch(`${API_URL}/produits`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }

    const data = await response.json();
    catalogueDiv.innerHTML = "";

    if (!data.produits || data.produits.length === 0) {
      catalogueDiv.innerHTML = "<p>Aucun produit disponible pour le moment.</p>";
      return;
    }

    data.produits.forEach(produit => {
      const card = document.createElement("div");
      card.classList.add("card-produit");

      // On utilise une vraie image placeholder si l'URL exemple.com ne répond pas
      const imageValide = produit.image_url.includes("exemple.com") 
        ? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" 
        : produit.image_url;

      card.innerHTML = `
        <img src="${imageValide}" alt="${produit.nom}">
        <h3>${produit.nom}</h3>
        <p>${produit.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="prix">${produit.prix} €</span>
          <button onclick="ajouterAuPanier(${produit.idproduit})">Ajouter</button>
        </div>
      `;

      catalogueDiv.appendChild(card);
    });

  } catch (error) {
    console.error("Erreur de chargement :", error);
    catalogueDiv.innerHTML = `<p style='color: red;'>Impossible de charger la carte. (Erreur: ${error.message})</p>`;
  }
}

const PORT = 3001; 
app.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});

// ... ton code précédent ...

// Route de test simple pour vérifier que ça fonctionne
app.get('/api/test', (req, res) => {
    res.json({ message: "Le backend communique avec le frontend !" });
});

// Lancer le serveur sur le port 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});

document.addEventListener("DOMContentLoaded", chargerCatalogue);