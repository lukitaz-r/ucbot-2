/* eslint-disable no-useless-escape */
import { Message } from 'discord.js';
import serverSchema from '../models/servidor';
import setupSchema from '../models/setups';
import warnSchema from '../models/warns';
import config from '../../config/config.json';
import { ExtendedClient } from '../types';

const { prefix, opcionales } = config;

const allowedLinks: string[] = opcionales?.allowedLinks || [];
const privilegedRoleId: string[] = opcionales?.privilegedRoleId || [];

export async function asegurar_todo(guildid?: string, userid?: string): Promise<void> {
  if (guildid) {
    let serverdata = await serverSchema.findOne({ guildID: guildid });
    if (!serverdata) {
      console.log('Asegurado: Config de Server'.green);
      serverdata = new serverSchema({
        guildID: guildid,
        prefijo: prefix,
      });
      await serverdata.save();
    }

    let setupsdata = await setupSchema.findOne({ guildID: guildid });
    if (!setupsdata) {
      console.log('Asegurado: Setups'.green);
      setupsdata = new setupSchema({
        guildID: guildid,
        reaccion_roles: [],
      });
      await setupsdata.save();
    }
  }

  if (guildid && userid) {
    let warn_data = await warnSchema.findOne({ guildID: guildid, userID: userid });
    if (!warn_data) {
      console.log(`Asegurado: Warnings de ${userid} en ${guildid}`.green);
      warn_data = new warnSchema({
        guildID: guildid,
        userID: userid,
        warnings: [],
      });
      await warn_data.save();
    }
  }
}

export async function automod(client: ExtendedClient, message: Message): Promise<void> {
  if (!message) return;

  const whitelistedChannels: string[] = opcionales?.whitelistedChannels || [];
  if (whitelistedChannels.includes(message.channel.id)) return;

  const urlRegex = /(https?:\/\/[\w\.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:\/?#\[\]@!\$&'\(\)\*\+,;=.]+)?)/gi;
  const foundLinks = message.content.match(urlRegex);

  if (!foundLinks) return;

  const unallowedLinks = foundLinks.filter(link => !allowedLinks.some(keyword => link.includes(keyword)));

  if (unallowedLinks.length === 0) return;

  try {
    await message.delete();
    console.log(`Deleted message from ${message.author.tag} containing unallowed links.`);
  } catch (error) {
    console.error(`Failed to delete message: ${error}`);
  }

  try {
    const member = await message.guild!.members.fetch(message.author.id);
    let hasPrivilegedRole = false;

    for (let i = 0; i < privilegedRoleId.length; i++) {
      if (member.roles.cache.has(privilegedRoleId[i])) {
        hasPrivilegedRole = true;
        break;
      }
    }

    if (hasPrivilegedRole) {
      console.log('No se aplicaron sanciones al usuario privilegiado');
      return;
    }

    await asegurar_todo(message.guild!.id, member.id);

    await member.timeout(1000 * 60 * 10, 'Enlace no permitido');

    // creamos el objeto del warn
    const objeto_warn = {
      fecha: Date.now(),
      autor: client.user!.id,
      razon: 'Enlace no permitido en el servidor!',
    };

    // empujamos el objeto en la base de datos
    await warnSchema.findOneAndUpdate(
      { guildID: message.guild!.id, userID: member.id },
      {
        $push: {
          warnings: objeto_warn,
        },
      }
    );

    const data = await warnSchema.findOne({ guildID: message.guild!.id, userID: member.id });
    if (data && data.warnings.length > 8) {
      await member.ban({ reason: 'Automod' });
      console.log(`Baneado ${member.user.tag} por comportamiento sospechoso`);
    }
  } catch (error) {
    console.error(`Failed to punish user: ${error}`);
  }
}
