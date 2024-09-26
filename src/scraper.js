// scraper.js
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

// URL de base de l'API CheapShark
const API_URL = 'https://www.cheapshark.com/api/1.0/deals';

// Fonction pour récupérer des jeux entre un prix minimum et maximum et créer des Embeds
async function getRandomGamesByPrice(lowerPrice, upperPrice, numGames = 5) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                storeID: 1,  // 1 = Steam
                lowerPrice: lowerPrice > 0 ? lowerPrice : 0.01,
                upperPrice: upperPrice,
                sortBy: 'Deal Rating',
                pageSize: 100 // Récupérer plus de jeux pour la randomisation
            }
        });

        let games = response.data;

        if (games.length === 0) {
            return `Aucun jeu trouvé entre ${lowerPrice}€ et ${upperPrice}€ sur Steam.`;
        }

        // Mélanger les jeux et en prendre numGames
        games = shuffleArray(games).slice(0, numGames);

        // Créer des Embeds pour les jeux
        const embeds = games.map(game => createGameEmbed(game));
        return embeds;
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

async function getBestRankedGames(numGames = 5) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                storeID: 1,
                sortBy: 'Metacritic',
                pageSize: numGames
            }
        });

        let games = response.data;

        if (games.length === 0) {
            return 'Aucun jeu en promotion avec un score disponible.';
        }

        // Créer des Embeds pour les jeux
        const embeds = games.map(game => createGameEmbed(game));
        return embeds;
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

async function getTopDiscountedGames(numGames = 5) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                storeID: 1,
                sortBy: 'Savings',
                pageSize: numGames
            }
        });

        let games = response.data;

        if (games.length === 0) {
            return 'Aucun jeu en promotion n\'a été trouvé.';
        }

        // Créer des Embeds pour les jeux
        const embeds = games.map(game => createGameEmbed(game));
        return embeds;
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

// Fonction utilitaire pour créer un Embed pour un jeu
function createGameEmbed(game) {
    const gameUrl = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;
    const normalPrice = parseFloat(game.normalPrice);
    const salePrice = parseFloat(game.salePrice);
    const discountPercentage = Math.round((1 - (salePrice / normalPrice)) * 100);

    const embed = new EmbedBuilder()
        .setTitle(game.title)
        .setURL(gameUrl)
        .setDescription(`Prix : **${salePrice.toFixed(2)}€** (Prix original : ${normalPrice.toFixed(2)}€)\nRemise : **${discountPercentage}%**`)
        .setColor(0x00AE86);

    if (game.thumb) {
        embed.setThumbnail(game.thumb);
    } else if (game.steamAppID) {
        embed.setThumbnail(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/capsule_sm_120.jpg`);
    }

    return embed;
}

// Fonction utilitaire pour mélanger un tableau
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

module.exports = {
    getRandomGamesByPrice,
    getBestRankedGames,
    getTopDiscountedGames
};
