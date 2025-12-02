import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, TextChannel, GuildChannel } from 'discord.js';
import setupSchema from '../../models/setups';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: "setup-ticket",
  aliases: ["ticket-setup", "setupticket", "ticketsetup"],
  desc: "Sirve para crear un sistema de Tickets",
  permisos: ["Administrator"],
  permisos_bot: ["ManageRoles", "ManageChannels"],
  run: async (client: ExtendedClient, message: Message | null, _args: string[], __prefix: string) => {
    if (!message) return;

    let objeto = {
      canal: "",
      mensaje: "",
    };

    const quecanal = await message.reply({
      embeds: [new EmbedBuilder()
        .setTitle(`¿Qué canal quieres usar para el sistema de tickets?`)
        .setDescription(`*Simplemente menciona el canal o envia su ID!*`)
        .setColor((client as any).color)
      ]
    });

    await quecanal.channel.awaitMessages({
      filter: m => m.author.id === message.author.id,
      max: 1,
      errors: ["time"],
      time: 180e3
    }).then(async collected => {
      var msgCollected = collected.first();
      if (!msgCollected) return;
      const channel = msgCollected.guild?.channels.cache.get(msgCollected.content) || msgCollected.mentions.channels.filter(c => (c as GuildChannel).guild.id == message.guild?.id).first()
      if (channel) {
        objeto.canal = channel.id;
        const quemensaje = await message.reply({
          embeds: [new EmbedBuilder()
            .setTitle(`¿Qué mensaje quieres usar para el sistema de tickets?`)
            .setDescription(`*Simplemente envía el mensaje!*`)
            .setColor((client as any).color)
          ]
        });
        await quemensaje.channel.awaitMessages({
          filter: m => m.author.id === message.author.id,
          max: 1,
          errors: ["time"],
          time: 180e3
        }).then(async collected => {
          var msgCollected2 = collected.first();
          if (!msgCollected2) return;

          const targetChannel = message.guild?.channels.cache.get(objeto.canal) as TextChannel;
          if (!targetChannel) {
            await message.reply("❌ **El canal seleccionado no es válido!**");
            return;
          }

          const msg = await targetChannel.send({
            embeds: [new EmbedBuilder()
              .setTitle(`📥 Crea un Ticket`)
              .setDescription(`${msgCollected2.content.substring(0, 2048)}`)
              .setColor((client as any).color)
            ],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setLabel("Crea un ticket").setEmoji("📨").setCustomId("crear_ticket").setStyle(ButtonStyle.Success)
            )]
          })
          objeto.mensaje = msg.id
          await setupSchema.findOneAndUpdate({ guildID: message.guild?.id }, {
            sistema_tickets: objeto
          }, { upsert: true });
          await message.reply(`✅ **Configurado correctamente en <#${objeto.canal}>**`)
        }).catch(async (_e) => {
          await message.reply("❌ **El tiempo ha expirado!**")
        })
      } else {
        await message.reply("❌ **No se ha encontrado el canal que has especificado!**")
      }
    }).catch(async (_e) => {
      await message.reply("❌ **El tiempo ha expirado!**")
    })

  }
}

export default command;
