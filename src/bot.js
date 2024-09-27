// bot.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const {
    getRandomGamesByPrice,
    getBestRankedGames,
    getTopDiscountedGames
} = require('./scraper'); // Importer les fonctions du scraper
const { discordToken } = require('./config'); // Charger le token depuis config.js

// Initialiser le client Discord avec les intentions nécessaires
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

// Gestion des commandes du bot
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === '!p5') {
        const games = await getRandomGamesByPrice(0.01, 5, 5);
        sendGamesEmbed(message.channel, games);
    } else if (command === '!p10') {
        const games = await getRandomGamesByPrice(5, 10, 5);
        sendGamesEmbed(message.channel, games);
    } else if (command === '!p20') {
        const games = await getRandomGamesByPrice(10, 20, 5);
        sendGamesEmbed(message.channel, games);
    } else if (command === '!best') {
        const games = await getBestRankedGames(5);
        sendGamesEmbed(message.channel, games);
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
        sendGamesEmbed(message.channel, games);
    } else if (command === '!help') {
        // Créer un Embed pour le message d'aide
        const helpEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Liste des commandes')
            .setDescription('Voici les commandes que vous pouvez utiliser :')
            .addFields(
                { name: '!p5', value: 'Affiche 5 jeux aléatoires à moins de 5€.' },
                { name: '!p10', value: 'Affiche 5 jeux aléatoires entre 5€ et 10€.' },
                { name: '!p20', value: 'Affiche 5 jeux aléatoires entre 10€ et 20€.' },
                { name: '!best', value: 'Affiche les 5 meilleurs jeux en promotion.' },
                { name: '!topdiscount [nombre]', value: 'Affiche les [nombre] meilleures remises (par défaut 5, maximum 10).' },
                { name: '!help', value: 'Affiche ce message d\'aide.' }
            )
            .setFooter({ text: 'Bot de Scrapping de Jeux Vidéo' });

        message.channel.send({ embeds: [helpEmbed] });
    }
});

// Fonction pour envoyer les Embeds des jeux
function sendGamesEmbed(channel, games) {
    if (Array.isArray(games)) {
        channel.send({ embeds: games });
    } else {
        channel.send(games);
    }
}

// Connexion du bot à Discord
client.login(discordToken || process.env.DISCORD_TOKEN);
