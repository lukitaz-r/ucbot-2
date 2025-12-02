import { EmbedBuilder, Message, ChannelType, GuildChannel } from 'discord.js';
import setupSchema from '../../models/setups';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: "setup-suggestions",
  aliases: ["suggestion-setup", "setup-sugerencias", "setup-sugerencia", "setupsugerencias"],
  desc: "Sirve para crear un sistema de Sugerencias",
  permisos: ["Administrator"],
  permisos_bot: ["ManageRoles", "ManageChannels"],
  run: async (client: ExtendedClient, message: Message | null, args: string[], __prefix: string) => {
    if (!message) return;

    if (!args.length) {
      await message.reply("❌ **Tienes que especificar el canal de sugerencias!**");
      return;
    }

    const channel = message.guild?.channels.cache.get(args[0]) || message.mentions.channels.filter(c => (c as GuildChannel).guild.id == message.guild?.id).first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      await message.reply("❌ **El canal de sugerencias que has mencionado no existe o no es un canal de texto!**");
      return;
    }

    await setupSchema.findOneAndUpdate({ guildID: message.guild?.id }, {
      sugerencias: channel.id
    }, { upsert: true });

    await message.reply({
      embeds: [new EmbedBuilder()
        .setTitle(`✅ Establecido el canal de sugerencias a \`${channel.name}\``)
        .setDescription(`*Cada vez que una persona envíe un mensaje en ${channel}, lo convertiré a sugerencia!*`)
        .setColor((client as any).color)
      ]
    });
  }
}

export default command;
