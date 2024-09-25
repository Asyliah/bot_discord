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
                lowerPrice: lowerPrice > 0 ? lowerPrice : 0.01,  // Ajuster pour éviter 0€
                upperPrice: upperPrice,  // Prix maximum
                sortBy: 'Deal Rating'  // Trier par la meilleure évaluation des offres
            }
        });

        let games = response.data;

        // Si aucun jeu n'est trouvé, renvoyer un message d'erreur
        if (games.length === 0) {
            return `Aucun jeu trouvé entre ${lowerPrice}€ et ${upperPrice}€ sur Steam.`;
        }

        // Sélectionner des jeux aléatoires dans la liste et créer des Embeds
        const embeds = [];
        for (let i = 0; i < numGames; i++) {
            if (games.length === 0) break; // Éviter les erreurs si moins de jeux sont disponibles

            const randomIndex = Math.floor(Math.random() * games.length);
            const randomGame = games.splice(randomIndex, 1)[0]; // Retirer le jeu pour éviter les doublons
            const gameUrl = `https://www.cheapshark.com/redirect?dealID=${randomGame.dealID}`;

            const normalPrice = parseFloat(randomGame.normalPrice);
            const salePrice = parseFloat(randomGame.salePrice);
            const discountPercentage = Math.round((1 - (salePrice / normalPrice)) * 100);

            // Créer un Embed pour chaque jeu
            const embed = new EmbedBuilder()
                .setTitle(randomGame.title)
                .setURL(gameUrl)
                .setDescription(`Prix : **${salePrice.toFixed(2)}€** (Prix original : ${normalPrice.toFixed(2)}€)\nRemise : **${discountPercentage}%**`)
                .setColor(0x00AE86);

            if (randomGame.thumb) {
                embed.setThumbnail(randomGame.thumb);
            } else if (randomGame.steamAppID) {
                embed.setThumbnail(`https://cdn.cloudflare.steamstatic.com/steam/apps/${randomGame.steamAppID}/capsule_sm_120.jpg`);
            }

            embeds.push(embed);
        }

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
                storeID: 1,  // 1 = Steam
                sortBy: 'Metacritic',  // Trier par le score Metacritic
                pageSize: 60  // Nombre de jeux à récupérer
            }
        });

        let games = response.data;

        // Filtrer les jeux qui ont une remise et un score Metacritic ou Steam
        games = games.filter(game => {
            const normalPrice = parseFloat(game.normalPrice);
            const salePrice = parseFloat(game.salePrice);
            const hasDiscount = salePrice < normalPrice;
            const hasScore = game.metacriticScore || game.steamRatingPercent;
            return hasDiscount && hasScore;
        });

        // Si aucun jeu n'est trouvé, renvoyer un message d'erreur
        if (games.length === 0) {
            return `Aucun jeu en promotion avec un score disponible.`;
        }

        // Trier les jeux par 'metacriticScore' ou 'steamRatingPercent' décroissant
        games.sort((a, b) => {
            const scoreA = parseInt(a.metacriticScore || a.steamRatingPercent || 0);
            const scoreB = parseInt(b.metacriticScore || b.steamRatingPercent || 0);
            return scoreB - scoreA;
        });

        // Prendre les premiers 'numGames' jeux
        games = games.slice(0, numGames);

        // Créer des Embeds pour les jeux sélectionnés
        const embeds = games.map(game => {
            const gameUrl = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;
            const normalPrice = parseFloat(game.normalPrice);
            const salePrice = parseFloat(game.salePrice);
            const discountPercentage = Math.round((1 - (salePrice / normalPrice)) * 100);

            // Obtenir le score (Metacritic ou Steam)
            const score = game.metacriticScore ? `Metacritic: ${game.metacriticScore}/100` : game.steamRatingPercent ? `Steam: ${game.steamRatingPercent}%` : 'Score non disponible';

            const embed = new EmbedBuilder()
                .setTitle(game.title)
                .setURL(gameUrl)
                .setDescription(`Prix : **${salePrice.toFixed(2)}€** (Prix original : ${normalPrice.toFixed(2)}€)\nRemise : **${discountPercentage}%**\n${score}`)
                .setColor(0x00AE86);

            if (game.thumb) {
                embed.setThumbnail(game.thumb);
            } else if (game.steamAppID) {
                embed.setThumbnail(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/capsule_sm_120.jpg`);
            }

            return embed;
        });

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
                storeID: 1,  // 1 = Steam
                sortBy: 'Savings',  // Trier par pourcentage de remise décroissant
                pageSize: numGames > 60 ? numGames : 60  // Ajuster la taille de la page en fonction du nombre de jeux demandés
            }
        });

        let games = response.data;

        // Filtrer les jeux qui ont une remise significative
        games = games.filter(game => parseFloat(game.savings) > 0);

        // Si aucun jeu n'est trouvé, renvoyer un message d'erreur
        if (games.length === 0) {
            return `Aucun jeu en promotion n'a été trouvé.`;
        }

        // Prendre les premiers 'numGames' jeux
        games = games.slice(0, numGames);

        // Créer des Embeds pour les jeux sélectionnés
        const embeds = games.map(game => {
            const gameUrl = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;
            const normalPrice = parseFloat(game.normalPrice);
            const salePrice = parseFloat(game.salePrice);
            const discountPercentage = Math.round(parseFloat(game.savings));

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
        });

        return embeds;
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

module.exports = { getRandomGamesByPrice, getBestRankedGames, getTopDiscountedGames };
