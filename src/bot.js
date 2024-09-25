const { Client, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./config');

// Initialiser le client Discord avec les intentions (v14)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});
// CODE AJOUTER 
const { Client, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./config');

// Initialiser le client Discord avec les intentions (v14)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.login(discordToken);

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config(); // Pour charger les variables d'environnement

// API URL de CheapShark pour récupérer les promos
const API_URL = 'https://www.cheapshark.com/api/1.0/deals';

// Fonction pour récupérer les jeux par prix maximum
async function getGamesByPrice(maxPrice) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                storeID: 1,  // 1 = Steam
                upperPrice: maxPrice,  // Prix maximum
                sortBy: 'Deal Rating' // Trier par la meilleure évaluation des offres
            }
        });

        const games = response.data;

        if (games.length === 0) {
            return `Aucun jeu trouvé à moins de ${maxPrice}€ sur Steam.`;
        }

        // Limiter les résultats à 5 pour éviter trop de spam dans le channel Discord
        return games.slice(0, 5).map(game => `${game.title} - Prix: ${game.salePrice}€ (Prix original: ${game.normalPrice}€)`).join('\n');
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        return 'Désolé, une erreur est survenue lors de la récupération des données.';
    }
}

// Commandes du bot
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Commande pour récupérer les jeux à 10€ ou moins
    if (message.content === '!p10') {
        const games = await getGamesByPrice(10);
        message.channel.send(games);
    }

    // Commande pour récupérer les jeux à 5€ ou moins
    if (message.content === '!p5') {
        const games = await getGamesByPrice(5);
        message.channel.send(games);
    }

    // Commande pour récupérer les jeux à 20€ ou moins
    if (message.content === '!p20') {
        const games = await getGamesByPrice(20);
        message.channel.send(games);
    }

    // Ajoute ici d'autres commandes similaires si nécessaire
});

// Lancer le bot
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);
// CODE AJOUTER

client.login(discordToken);
