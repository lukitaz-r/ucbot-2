import { EmbedBuilder, Message, TextChannel, GuildChannel } from 'discord.js';
import setupSchema from '../../models/setups';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: "setup-reactionrole",
  aliases: ["setup-reactionroles", "setup-reaccionroles", "setup-reaccionrol", "setupreactionroles", "reactionrolessetup"],
  desc: "Sirve para ver crear un sistema de roles con reacciones",
  permisos: ["Administrator"],
  permisos_bot: ["ManageRoles", "ManageChannels"],
  run: async (client: ExtendedClient, message: Message | null, _args: string[], prefix: string) => {
    if (!message || !message.guild) return;

    let contador = 0;
    let finalizado = false;

    interface Parametro {
      Emoji: string;
      Emojimsg?: string;
      Rol: string;
      msg?: string;
    }

    interface Objeto {
      ID_MENSAJE: string;
      ID_CANAL: string;
      Parametros: Parametro[];
    }

    let objeto: Objeto = {
      ID_MENSAJE: "",
      ID_CANAL: "",
      Parametros: []
    }

    const finalizar = async () => {
      if (contador === 1 && !objeto.Parametros.length) {
        await message.reply(`❌ **Tienes que añadir al menos un emoji con un rol**\nSetup cancelado!`);
        return;
      }
      let msg = await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle(`Especificar Canal`)
          .setDescription(`⬇ Menciona o escribe la ID del canal del mensaje a reaccionar! ⬇`)
          .setColor((client as any).color)
        ]
      })
      await msg.channel.awaitMessages({
        filter: m => m.author.id === message.author.id,
        max: 1,
        errors: ["time"],
        time: 180e3,
      }).then(async collected => {
        var msgCollected = collected.first();
        if (!msgCollected) return;
        const canal = msgCollected.guild?.channels.cache.get(msgCollected.content) || msgCollected.mentions.channels.filter(c => (c as GuildChannel).guild.id == message.guild?.id).first()
        if (canal) {
          objeto.ID_CANAL = canal.id

          var idmensaje = await message.reply({
            embeds: [new EmbedBuilder()
              .setTitle(`Especificar Mensaje`)
              .setDescription(`⬇ Escribe la ID del mensaje para añadir las reacciones! ⬇`)
              .setColor((client as any).color)
            ]
          });
          await idmensaje.channel.awaitMessages({
            filter: m => m.author.id === message.author.id,
            max: 1,
            errors: ["time"],
            time: 180e3,
          }).then(async collected => {
            var msgCollected2 = collected.first();
            if (!msgCollected2) return;

            const channel = message.guild?.channels.cache.get(objeto.ID_CANAL) as TextChannel;
            if (!channel) {
              await message.reply(`❌ **No se ha encontrado el canal!**`);
              return;
            }

            try {
              const encontrado = await channel.messages.fetch(msgCollected2.content);
              if (encontrado) {
                for (var i = 0; i < objeto.Parametros.length; i++) {
                  encontrado.react(objeto.Parametros[i].Emoji).catch(() => { console.log("NO SE HA PODIDO AÑADIR LA REACCIÓN") })
                }
                objeto.ID_MENSAJE = msgCollected2.content;
                let setupdatos = await setupSchema.findOne({ guildID: message.guild?.id });
                if (!setupdatos) {
                  setupdatos = new setupSchema({ guildID: message.guild?.id });
                }

                // Ensure reaccion_roles exists
                if (!setupdatos.reaccion_roles) {
                  setupdatos.reaccion_roles = [];
                }

                setupdatos.reaccion_roles.push(objeto);
                await setupdatos.save();
                await message.reply(`Setup de Reacción con Roles Creado ✅\nPuedes crear otro setup ejecutando el comando \`${prefix}setup-reactionroles\``);
                return;
              } else {
                await message.reply(`❌ **No se ha encontrado el mensaje que has especificado!**\nSetup cancelado!`);
                return;
              }
            } catch (e) {
              await message.reply(`❌ **No se ha encontrado el mensaje que has especificado!**\nSetup cancelado!`);
              return;
            }
          }).catch(async (_e) => {
            await message.reply(`Tu tiempo ha expirado!`);
            return;
          })
        } else {
          await message.reply(`❌ **No se ha encontrado el canal que has especificado!**\nSetup cancelado!`);
          return;
        }
      }).catch(async (_e) => {
        await message.reply(`Tu tiempo ha expirado!`);
        return;
      })
    }

    const rol = async (parametros: Parametro) => {
      let querol = await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle(`¿Qué rol quieres usar para el emoji seleccionado?`)
          .setDescription(`*Simplemente menciona el rol o escribe su ID!*`)
          .setColor((client as any).color)
        ]
      });
      await querol.channel.awaitMessages({
        filter: m => m.author.id === message.author.id,
        max: 1,
        errors: ["time"],
        time: 180e3
      }).then(async collected => {
        var msgCollected = collected.first();
        if (!msgCollected) return;
        const rol = msgCollected.guild?.roles.cache.get(msgCollected.content) || msgCollected.mentions.roles.filter(r => r.guild.id == message.guild?.id).first();
        if (rol) {
          parametros.Rol = rol.id;
          objeto.Parametros.push(parametros);

          querol.delete().catch(() => { });

          return emoji();
        } else {
          await message.reply(`❌ **El Rol que has mencionado NO EXISTE!**\nSetup cancelado!`);
          return;
        }
      }).catch(() => {
        return finalizar();
      })
    }

    const emoji = async () => {
      contador++;
      if (contador === 23) return finalizar();
      var parametros: Parametro = {
        Emoji: "",
        Emojimsg: "",
        Rol: "",
        msg: "",
      };

      let preguntar = await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle(`¿Qué emoji quieres usar para el \`${contador}º\` rol?`)
          .setDescription(`*Reacciona en **__este mensaje__** con el emoji deseado!*\n\nEscribe \`finalizar\` para terminar el setup!`)
          .setColor((client as any).color)
        ]
      });

      const collector = preguntar.createReactionCollector({
        filter: (_reaction, user) => {
          return user.id === message.author.id && !finalizado;
        },
        max: 1,
        time: 180e3
      });

      const msgCollector = preguntar.channel.createMessageCollector({
        filter: m => m.author.id === message.author.id,
        max: 1,
        time: 180e3
      });

      let answered = false;

      collector.on('collect', (reaction, _user) => {
        if (answered) return;
        answered = true;
        msgCollector.stop();

        if (reaction.emoji.id && reaction.emoji.id.length > 2) {
          preguntar.delete().catch(() => { });
          parametros.Emoji = reaction.emoji.id;
          if (reaction.emoji.animated) {
            parametros.Emoji = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`
          } else {
            parametros.Emoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`
          }
          rol(parametros);
        } else if (reaction.emoji.name) {
          preguntar.delete().catch(() => { });
          parametros.Emoji = reaction.emoji.name;
          parametros.Emojimsg = reaction.emoji.name;
          rol(parametros);
        } else {
          message.reply(`Cancelado y finalizando setup...`)
          finalizar();
        }
      });

      msgCollector.on('collect', (m) => {
        if (answered) return;
        if (m.content.toLowerCase() === "finalizar" && !finalizado) {
          answered = true;
          finalizado = true;
          collector.stop();
          finalizar();
        }
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'time' && !answered) {
          finalizar();
        }
      });
    }

    await emoji();
  }
}

export default command;
