import { Message } from 'discord.js';
import { ExtendedClient } from '../types';
import { allowedLinks, opcionales } from '../../config/config.json';
import { asegurar_todo } from '../utils/funciones';
import warnSchema from '../models/warns';

export default (client: ExtendedClient) => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;
    if (opcionales?.whitelistedChannels.includes(message.channel.id)) return;
    if (!message.guild) return;

    const urlRegex = /(https?:\/\/[\w\.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:\/?#\[\]@!\$&'\(\)\*\+,;=.]+)?)/gi;
    const foundLinks = message.content.match(urlRegex);
    if (!foundLinks) return;

    const unallowedLinks = foundLinks.filter(link => !allowedLinks.some(keyword => link.includes(keyword)));
    if (unallowedLinks.length === 0) return;

    try {
      if (message.deletable) {
        await message.delete();
        console.log(`Deleted message from ${message.author.tag} containing unallowed links.`);
      }
    } catch (error) {
      console.error(`Failed to delete message: ${error}`);
    }

    try {
      const member = await message.guild.members.fetch(message.author.id);
      let hasPrivilegedRole = false;

      for (const roleId of opcionales?.privilegedRoleId) {
        if (member.roles.cache.has(roleId)) {
          hasPrivilegedRole = true;
          break;
        }
      }

      if (hasPrivilegedRole) {
        console.log('No se aplicaron sanciones al usuario privilegiado');
        return;
      }

      await asegurar_todo(message.guild.id, member.id);

      await member.timeout(1000 * 60 * 10, 'Enlace no permitido');

      // creamos el objeto del warn
      const objeto_warn = {
        fecha: Date.now(),
        autor: client.user?.id || 'Bot',
        razon: 'Enlace no permitido en el servidor!',
      };

      // empujamos el objeto en la base de datos
      await warnSchema.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, {
        $push: {
          warnings: objeto_warn,
        },
      });

      const data = await warnSchema.findOne({ guildID: message.guild.id, userID: member.id });
      if (data && data.warnings.length > 8) {
        if (member.bannable) {
          await member.ban({ reason: 'Automod' });
          console.log(`Baneado ${member.user.tag} por comportamiento sospechoso`);
        }
      }
    } catch (error) {
      console.error(`Failed to punish user: ${error}`);
    }
  });
};
