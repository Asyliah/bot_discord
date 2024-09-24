const { Client, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./config');

// Initialiser le client Discord avec les intentions (v14)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.login(discordToken);
