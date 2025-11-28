/* eslint-disable no-empty */
/* eslint-disable no-inline-comments */
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { Manager } from 'moonlink.js';
import { readdirSync } from 'fs';
import { ExtendedClient } from './types';
import config from '../config/config.json';
import 'colors';

const { token, lavalink } = config;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildExpressions,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
}) as ExtendedClient;

client.commands = new Collection();
client.aliases = new Collection();

if (lavalink.active === true) {
  client.manager = new Manager({
    // Configura el server de LavaLink al que te tienes que conectar
    nodes: [
      {
        identifier: 'bot',
        host: lavalink.host, // El host name de tu server de lavalink
        port: lavalink.port, // El puerto que tu server esta leyendo
        password: lavalink.password, // La contraseña para tu server de Lavalink
        secure: lavalink.secure, // Elige que tipo de conexión usas
      },
    ],
    sendPayload: (guildId: string, payload: string) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(JSON.parse(payload));
    },
  } as any);

  client.manager.on('nodeConnected', (node) => {
    console.log(`Node ${node.identifier} connected`);
  });

  client.manager.on('nodeDisconnect', (node) => {
    console.log(`Node ${node.identifier} disconnected`);
  });

  client.manager.on('debug', (d) => console.log(d));

  client.manager.on('nodeError', (node, error) => {
    console.error(`Node ${node.identifier} encountered an error:`, error);
  });

  // Playback events
  client.manager.on('trackStart', (player, track) => {
    // Envia un mensaje cuando hay una canción sonando
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel && channel.isTextBased() && 'send' in channel) {
      channel.send(`🎧 Ahora suena: **${track.title} - ${track.author}**  🎧`);
    }
  });

  client.manager.on('queueEnd', async (player) => {
    // Envia un mensaje cuando la cola termina
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel && channel.isTextBased() && 'send' in channel) {
      let countdown = 30;
      let msg;

      try {
        if (!channel) return;
        msg = await channel.send(`❌🎧 **¡Cola terminada!** Desconectando en \`${countdown}s\` si no se añaden nuevas canciones. 🎧❌`);
      } catch (err) {
        console.error('No pude enviar el mensaje de countdown:', err);
        return;
      }

      const interval = setInterval(async () => {
        if (player.playing || player.queue.size > 0) {
          clearInterval(interval);
          clearTimeout(timeout);
          try {
            await msg.delete();
          } catch {
            // Ignore deletion errors
          }
          return;
        }
        countdown--;
        if (countdown > 0) {
          try {
            await msg.edit(`❌🎧 **¡Cola terminada!** Desconectando en \`${countdown}s\` si no se añaden nuevas canciones. 🎧❌`);
          } catch (err) {
            console.error('Error al editar el mensaje de countdown:', err);
          }
        } else {
          clearInterval(interval);
          clearTimeout(timeout);
          try {
            await msg.delete();
          } catch (err) {
            console.error('Error al borrar el mensaje de countdown:', err);
          }
        }
      }, 1000);

      // Se desconecta si no se añaden nuevas canciones
      // Esto ayuda a ahorrar recursos
      const timeout = setTimeout(() => {
        if (!player.playing && player.queue.size === 0) {
          player.destroy();
          if (channel && channel.isTextBased() && 'send' in channel) {
            channel.send('❌🎧 ¡Desconectado por Inactividad! 🎧❌');
          }
        }
      }, 30000);
    }
  });

  client.on('raw', (packet) => {
    client.manager.packetUpdate(packet);
  });
}

readdirSync('./handlers').forEach((handler) => {
  try {
    require(`./handlers/${handler}`).default(client);
  } catch (e) {
    console.log(`ERROR EN EL HANDLER ${handler}`.red);
    console.log(e);
  }
});

client.login(token).catch(() => console.log('-[X]- NO HAS ESPECIFICADO UN TOKEN VALIDO O TE FALTAN INTENTOS -[X]-\n [-] ACTIVA LOS INTENTOS EN https://discord.dev [-]'.red));
