require('dotenv').config(); // Charger les variables d'environnement

module.exports = {
    discordToken: process.env.DISCORD_TOKEN, // Charger le token Discord depuis le fichier .env
    prefix: '!', // Préfixe pour les commandes (facultatif, si tu en utilises)
};

