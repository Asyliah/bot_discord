const axios = require('axios');

// URL de base de l'API CheapShark
const API_URL = 'https://www.cheapshark.com/api/1.0/deals';

// Fonction pour récupérer les jeux en fonction du prix maximum
async function getGamesByPrice(maxPrice) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                storeID: 1,  // 1 = Steam (tu peux ajuster si tu utilises d'autres stores)
                upperPrice: maxPrice,  // Le prix maximum
                sortBy: 'Deal Rating'  // Trier par la meilleure évaluation des offres
            }
        });

        const games = response.data;

        if (games.length === 0) {
            return `Aucun jeu trouvé à moins de ${maxPrice}€ sur Steam.`;
        }

        // Limiter les résultats à 5 pour éviter de trop charger le canal Discord
        return games.slice(0, 5).map(game => `${game.title} - Prix: ${game.salePrice}€ (Prix original: ${game.normalPrice}€)`).join('\n');
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

module.exports = { getGamesByPrice };
