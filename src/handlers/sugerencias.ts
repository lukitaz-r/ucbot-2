import { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Interaction, ButtonInteraction, TextChannel } from 'discord.js';

const setupSchema = require(`${process.cwd()}/models/setups.js`);
const votosSchema = require(`${process.cwd()}/models/votos-sugs.js`);
const { asegurar_todo } = require(`${process.cwd()}/utils/funciones.js`);

interface SetupData {
  guildID: string;
  sugerencias?: string;
}

interface VotosData {
  messageID: string;
  autor: string;
  si: string[];
  no: string[];
  save: () => Promise<void>;
}

module.exports = (client: Client) => {
  //evento al enviar mensaje en el canal de sugerencias
  client.on("messageCreate", async (message: Message) => {
    try {
      //comprobaciones previas
      if (!message.guild || !message.channel || message.author.bot) return;
      //buscamos los datos de la DB
      const setup_data: SetupData | null = await setupSchema.findOne({ guildID: message.guild.id });
      //comprobaciones previas
      if (!setup_data || !setup_data.sugerencias || !message.guild.channels.cache.get(setup_data.sugerencias) || message.channel.id !== setup_data.sugerencias) return;
      //eliminamos la sugerencia enviada por el autor y lo convertimos en sugerencia con botones
      message.delete().catch(() => { });
      //definimos los botones
      const botones = new ActionRowBuilder<ButtonBuilder>().addComponents([
        //votar si
        new ButtonBuilder().setStyle(2).setLabel("0").setEmoji("✅").setCustomId("votar_si"),
        //votar no
        new ButtonBuilder().setStyle(2).setLabel("0").setEmoji("❌").setCustomId("votar_no"),
        //ver votanes
        new ButtonBuilder().setStyle(1).setLabel("¿Quién ha votado?").setEmoji("❓").setCustomId("ver_votos"),
      ])
      //enviamos el mensaje con los botones
      const msg = await (message.channel as TextChannel).send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: "Sugerencia de " + message.author.tag, iconURL: message.author.displayAvatarURL({ forceStatic: false }) })
            .setDescription(`>>> ${message.content}`)
            .addFields([
              { name: `✅ Votos positivos`, value: "0 votos", inline: true },
              { name: `❌ Votos negativos`, value: "0 votos", inline: true }
            ])
            .setColor((client as any).color)
            .setFooter({ text: "Quieres sugerir algo? Simplemente envía la sugerencia aquí!", iconURL: "https://images.emojiterra.com/google/android-pie/512px/1f4a1.png" })
        ],
        components: [botones]
      })
      const data_msg = new votosSchema({
        messageID: msg.id,
        autor: message.author.id,
      })
      data_msg.save();
    } catch (e) { console.log(e) }
  })

  //evento al hacer click en un botón de la sugerencia
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      //comprobaciones previas
      if (!interaction.isButton() || !interaction.guild || !interaction.channel || !interaction.message || !interaction.user) return;

      const buttonInteraction = interaction as ButtonInteraction;

      //aseguramos la base de datos
      asegurar_todo(interaction.guild.id, interaction.user.id);
      //buscamos los datos en la base de datos
      const setup_data: SetupData | null = await setupSchema.findOne({ guildID: interaction.guild.id });
      //buscamos la base de datos del mensaje de la sugerencia
      const msg_data: VotosData | null = await votosSchema.findOne({ messageID: interaction.message.id });
      //comprobaciones previas
      if (!msg_data || !setup_data || !setup_data.sugerencias || interaction.channelId !== setup_data.sugerencias) return;

      switch (buttonInteraction.customId) {
        case "votar_si": {
          //si el votante ya ha votado en el mismo voto hacemos return;
          if (msg_data.si.includes(interaction.user.id)) {
            await buttonInteraction.reply({ content: `Ya has votado SÍ en la sugerencia de <@${msg_data.autor}>`, ephemeral: true });
            return;
          }
          //modificamos la DB
          if (msg_data.no.includes(interaction.user.id)) msg_data.no.splice(msg_data.no.indexOf(interaction.user.id), 1)
          msg_data.si.push(interaction.user.id);
          await msg_data.save();

          //modificamos el embed
          const embed = EmbedBuilder.from(interaction.message.embeds[0]);
          embed.data.fields![0].value = `${msg_data.si.length} votos`;
          embed.data.fields![1].value = `${msg_data.no.length} votos`;

          //modificamos los botones con el valor de los votos
          const row = ActionRowBuilder.from<ButtonBuilder>(interaction.message.components[0] as any);
          row.components[0].setLabel(msg_data.si.length.toString());
          row.components[1].setLabel(msg_data.no.length.toString());

          //editamos el mensaje
          await interaction.message.edit({ embeds: [embed], components: [row] });
          await buttonInteraction.deferUpdate();
        }
          break;

        case "votar_no": {
          //si el votante ya ha votado en el mismo voto hacemos return;
          if (msg_data.no.includes(interaction.user.id)) {
            await buttonInteraction.reply({ content: `Ya has votado NO en la sugerencia de <@${msg_data.autor}>`, ephemeral: true });
            return;
          }
          //modificamos la DB
          if (msg_data.si.includes(interaction.user.id)) msg_data.si.splice(msg_data.si.indexOf(interaction.user.id), 1)
          msg_data.no.push(interaction.user.id);
          await msg_data.save();

          //modificamos el embed
          const embed = EmbedBuilder.from(interaction.message.embeds[0]);
          embed.data.fields![0].value = `${msg_data.si.length} votos`;
          embed.data.fields![1].value = `${msg_data.no.length} votos`;

          //modificamos los botones con el valor de los votos
          const row = ActionRowBuilder.from<ButtonBuilder>(interaction.message.components[0] as any);
          row.components[0].setLabel(msg_data.si.length.toString());
          row.components[1].setLabel(msg_data.no.length.toString());

          //editamos el mensaje
          await interaction.message.edit({ embeds: [embed], components: [row] });
          await buttonInteraction.deferUpdate();

        }
          break;

        case "ver_votos": {
          await buttonInteraction.reply({
            embeds: [new EmbedBuilder()
              .setTitle(`Votos de la sugerencia`)
              .addFields([
                { name: `✅ Votos positivos`, value: msg_data.si.length >= 1 ? msg_data.si.map(u => `<@${u}>\n`).join('') : "No hay votos", inline: true },
                { name: `❌ Votos negativos`, value: msg_data.no.length >= 1 ? msg_data.no.map(u => `<@${u}>\n`).join('') : "No hay votos", inline: true }
              ])
              .setColor((client as any).color)
            ],
            ephemeral: true,
          })
        }
          break;

        default:
          break;
      }
    } catch (e) { console.log(e) }
  })
}
