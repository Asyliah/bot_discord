const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Charger les variables d'environnement
const { getGamesByPrice } = require('./scraper'); // Importer la fonction depuis scraper.js
const { discordToken } = require('./config'); // Charger le token depuis config.js

// Initialiser le client Discord avec les intentions (v14)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Nécessaire pour lire le contenu des messages
    ]
});

// Événement déclenché lorsque le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

// Commandes du bot
client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignorer les messages des autres bots

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

    // Tu peux ajouter ici d'autres commandes si nécessaire
});

// Connexion du bot à Discord
client.login(discordToken || process.env.DISCORD_TOKEN);
