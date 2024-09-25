const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { getRandomGamesByPrice, getBestRankedGames, getTopDiscountedGames } = require('./scraper'); // Importer la nouvelle fonction
const { discordToken } = require('./config'); // Charger le token

// Initialiser le client Discord avec les intentions
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Événement déclenché lorsque le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

// Commandes du bot pour obtenir des jeux
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === '!p5') {
        const games = await getRandomGamesByPrice(0.01, 5, 5);
        if (Array.isArray(games)) {
            message.channel.send({ embeds: games });
        } else {
            message.channel.send(games);
        }
    } else if (command === '!p10') {
        const games = await getRandomGamesByPrice(5, 10, 5);
        if (Array.isArray(games)) {
            message.channel.send({ embeds: games });
        } else {
            message.channel.send(games);
        }
    } else if (command === '!p20') {
        const games = await getRandomGamesByPrice(10, 20, 5);
        if (Array.isArray(games)) {
            message.channel.send({ embeds: games });
        } else {
            message.channel.send(games);
        }
    } else if (command === '!best') {
        const games = await getBestRankedGames(5);
        if (Array.isArray(games)) {
            message.channel.send({ embeds: games });
        } else {
            message.channel.send(games);
        }
    } else if (command === '!topdiscount') {
        let numGames = 5; // Nombre par défaut de jeux
        if (args[0]) {
            const parsedNum = parseInt(args[0]);
            if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 10) {
                numGames = parsedNum;
            } else {
                return message.channel.send('Veuillez fournir un nombre valide de jeux à afficher (entre 1 et 10).');
            }
        }

        const games = await getTopDiscountedGames(numGames);
        if (Array.isArray(games)) {
            message.channel.send({ embeds: games });
        } else {
            message.channel.send(games);
        }
    }
});

// Connexion du bot à Discord
client.login(discordToken || process.env.DISCORD_TOKEN);
