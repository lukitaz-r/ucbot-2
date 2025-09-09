const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config/config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.once(Events.ClientReady, bot => {
  console.log(`El bot está activo como ${bot.user.tag}`);
});

client.login(token);