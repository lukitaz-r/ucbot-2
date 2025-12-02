import { Client, Interaction, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, TextChannel, GuildChannel, ChannelType } from 'discord.js';
const { asegurar_todo } = require("../utils/funciones.js");
const setupSchema = require(`${process.cwd()}/models/setups`);
const ticketSchema = require(`${process.cwd()}/models/tickets`);
const html = require('discord-html-transcripts');

interface SetupData {
  guildID: string;
  sistema_tickets?: {
    canal?: string;
    mensaje?: string;
  };
}

interface TicketData {
  guildID: string;
  autor: string;
  canal: string;
  cerrado: boolean;
  save: () => Promise<void>;
}

async function deleteTicketData(interaction: ButtonInteraction) {
  await ticketSchema.deleteOne({ guildID: interaction.guild?.id, canal: interaction.channel?.id });
}

module.exports = (client: Client) => {

  //CREACIÓN DE TICKETS
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      //comprobaciones previas
      if (!interaction.isButton() || !interaction.guild || !interaction.channel || interaction.message.author?.id !== client.user?.id || interaction.customId !== "crear_ticket") return;

      const buttonInteraction = interaction as ButtonInteraction;

      //aseguramos la base de datos para evitar errores
      await asegurar_todo(interaction.guild.id);
      //buscamos el setup en la base de datos
      const setup: SetupData | null = await setupSchema.findOne({ guildID: interaction.guild.id });
      //comprobaciones previas
      if (!setup || !setup.sistema_tickets || !setup.sistema_tickets.canal || interaction.channelId !== setup.sistema_tickets.canal || interaction.message.id !== setup.sistema_tickets.mensaje) return;
      //buscamos primero si el usuario tiene un ticket creado
      const ticket_data: TicketData[] = await ticketSchema.find({ guildID: interaction.guild.id, autor: interaction.user.id, cerrado: false });

      //comprobar si el usuario ya tiene un ticket creado en el servidor y NO esté cerrado, y si es así, hacemos return;
      for (const ticket of ticket_data) {
        if (interaction.guild.channels.cache.get(ticket.canal)) {
          await buttonInteraction.reply({ content: `❌ **Ya tienes un ticket creado en <#${ticket.canal}>**`, ephemeral: true });
          return;
        }
      }

      await buttonInteraction.reply({ content: "⌛ **Creando tu ticket... Porfavor espere**", ephemeral: true });
      //creamos el canal
      const channel = await interaction.guild.channels.create({
        name: `🎫│ticket-${interaction.user.username}`.substring(0, 50),
        type: ChannelType.GuildText,
        parent: (interaction.channel && 'parent' in interaction.channel && interaction.channel.parent?.type === ChannelType.GuildCategory) ? interaction.channel.parent : undefined,
        permissionOverwrites: [
          //denegamos el permiso de ver el ticket a otra persona que no sea el creador del ticket
          {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
          },
          //permitimos ver el ticket al usuario que ha creado el ticket
          {
            id: interaction.user.id,
            allow: ["ViewChannel"]
          },
          {
            id: "1373132705491058708",
            allow: ["ViewChannel"]
          },
        ]
      });
      //enviamos la bienvenida en el ticket del usuario
      await channel.send({
        embeds: [new EmbedBuilder()
          .setTitle(`Ticket de ${interaction.user.tag}`)
          .setDescription(`Bienvenido al soporte ${interaction.user}\nExplica detallademente tu problema.`)
          .setColor((client as any).color)
        ],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
          [
            new ButtonBuilder().setStyle(4).setLabel("CERRAR").setEmoji("🔒").setCustomId("cerrar_ticket"),
            new ButtonBuilder().setStyle(2).setLabel("BORRAR").setEmoji("🗑").setCustomId("borrar_ticket"),
            new ButtonBuilder().setStyle(1).setLabel("GUARDAR").setEmoji("💾").setCustomId("guardar_ticket"),
          ]
        )]
      });

      const data = new ticketSchema({
        guildID: interaction.guild.id,
        autor: interaction.user.id,
        canal: channel.id,
        cerrado: false,
      });
      await data.save();
      await buttonInteraction.editReply({ content: `✅ **Ticket creado en ${channel}**` })

    } catch (e) {
      console.log(e)
    }
  })

  //BOTONES
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {

      //comprobaciones previas
      if (!interaction.isButton() || !interaction.guild || !interaction.channel || interaction.message.author?.id !== client.user?.id) return;

      const buttonInteraction = interaction as ButtonInteraction;

      //aseguramos la base de datos para evitar errores
      await asegurar_todo(interaction.guild.id);

      const ticket_data: TicketData | null = await ticketSchema.findOne({ guildID: interaction.guild.id, canal: interaction.channel.id })
      switch (buttonInteraction.customId) {
        case "cerrar_ticket": {
          //si el ticket ya está cerrado, hacemos return;
          if (ticket_data && ticket_data.cerrado) {
            await buttonInteraction.reply({ content: `❌ **Este ticket ya estaba cerrado!**`, ephemeral: true });
            return;
          }
          await buttonInteraction.deferUpdate();
          //creamos el mensaje de verificar
          const verificar = await (interaction.channel as TextChannel).send({
            embeds: [new EmbedBuilder()
              .setTitle(`Verificate primero!`)
              .setColor('Green')
            ],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setLabel("Verificarse").setStyle(3).setCustomId("verificar").setEmoji("✅")
            )]
          });


          //creamos el collector
          const collector = verificar.createMessageComponentCollector({
            filter: (i: Interaction) => i.isButton() && i.message.author?.id == client.user?.id && !!i.user,
            time: 180e3
          });

          //escuchamos clicks en el botón
          collector.on("collect", async (boton: ButtonInteraction) => {
            //si la persona que hace clic en el botón de verificarse NO es la misma persona que ha hecho clic al botón de cerrar ticket, return;
            if (boton.user.id !== interaction.user.id) {
              await boton.reply({ content: `❌ **No puedes hacer eso! Solo ${interaction.user} puede!**`, ephemeral: true });
              return;
            }

            //paramos el collector
            collector.stop();
            await boton.deferUpdate();
            //cerramos el ticket en la base de datos
            if (ticket_data) {
              ticket_data.cerrado = true;
              await ticket_data.save();
              //hacemos que el usuario que ha creado el ticket, no pueda ver el ticket
              await (interaction.channel as TextChannel).permissionOverwrites.edit(ticket_data.autor, { ViewChannel: false });
              await (interaction.channel as TextChannel).send(`✅ **Ticket Cerrado por \`${interaction.user.tag}\` el <t:${Math.round(Date.now() / 1000)}>**`)
            }
          });

          collector.on("end", async (collected) => {
            //si el usuario ha hecho clic al botón de verificar, editamos el mensaje desactivado el botón de verificar
            if (collected && collected.first() && (collected.first() as ButtonInteraction).customId) {
              //editamos el mensaje desactivado el botón de verificarse
              await verificar.edit({
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder().setLabel("Verificarse").setStyle(3).setCustomId("verificar").setEmoji("✅").setDisabled(true)
                )]
              })
            } else {
              await verificar.edit({
                embeds: [EmbedBuilder.from(verificar.embeds[0]).setColor("Red" as any)],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder().setLabel("NO VERIFICADO").setStyle(4).setCustomId("verificar").setEmoji("❌").setDisabled(true)
                )]
              })
            }
          })

        }
          break;

        case "borrar_ticket": {
          await buttonInteraction.deferUpdate();
          //creamos el mensaje de verificar
          const verificar = await (interaction.channel as TextChannel).send({
            embeds: [new EmbedBuilder()
              .setTitle(`Verificate primero!`)
              .setColor('Green')
            ],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setLabel("Verificarse").setStyle(3).setCustomId("verificar").setEmoji("✅")
            )]
          });

          //creamos el collector
          const collector = verificar.createMessageComponentCollector({
            filter: (i: Interaction) => i.isButton() && i.message.author?.id == client.user?.id && !!i.user,
            time: 180e3
          });


          collector.on("collect", async (boton: ButtonInteraction) => {
            if (boton.user.id !== interaction.user.id) {
              await boton.reply({ content: `❌ **No puedes hacer eso! Solo ${interaction.user} puede!**`, ephemeral: true });
              return;
            }
            collector.stop();
            await boton.deferUpdate();
            await deleteTicketData(buttonInteraction);
            await (interaction.channel as TextChannel).send(`✅ **El ticket será eliminado en menos de \`3 segundos ...\`\nAcción por: \`${interaction.user.tag}\` el <t:${Math.round(Date.now() / 1000)}>**`)

            setTimeout(() => {
              (interaction.channel as TextChannel).delete();
            }, 3_000);
          });

          collector.on("end", async (collected) => {
            //si el usuario ha hecho clic al botón de verificar, editamos el mensaje desactivado el botón de verificar
            if (collected && collected.first() && (collected.first() as ButtonInteraction).customId) {
              //editamos el mensaje desactivado el botón de verificarse
              await verificar.edit({
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder().setLabel("Verificarse").setStyle(3).setCustomId("verificar").setEmoji("✅").setDisabled(true)
                )]
              })
            } else {
              await verificar.edit({
                embeds: [EmbedBuilder.from(verificar.embeds[0]).setColor("Red" as any)],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder().setLabel("NO VERIFICADO").setStyle(4).setCustomId("verificar").setEmoji("❌").setDisabled(true)
                )]
              })
            }
          })

        }
          break;

        case "guardar_ticket": {
          await buttonInteraction.deferUpdate();
          //enviamos el mensaje de guardando ticket
          const mensaje = await (interaction.channel as TextChannel).send({
            content: interaction.user.toString(),
            embeds: [new EmbedBuilder()
              .setTitle(`⌛ Guardando Ticket...`)
              .setColor((client as any).color)
            ]
          });

          //generamos el archivo html con la conversación
          const adjunto = await html.createTranscript(interaction.channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `${(interaction.channel as GuildChannel).name}.html`
          })

          await mensaje.edit({
            embeds: [new EmbedBuilder()
              .setTitle(`✅ Ticket Gurdado`)
              .setColor('Green')
            ],
            files: [adjunto]
          })
        }
          break;

        default:
          break;
      }

    } catch (e) {
      console.log(e)
    }
  })
}
