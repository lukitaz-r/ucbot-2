/* eslint-disable no-empty-function */
import { readdirSync } from 'fs';
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, SlashCommandBuilder, Message, ChatInputCommandInteraction, Guild } from 'discord.js';
import { ExtendedClient, Command } from '../../types';
import config from '../../../config/config.json';

const { color } = config;

const FOOTER = {
  text: '© desarrollado por lukitaz_r | 2025',
};

function listCategories(path = './src/commands'): string[] {
  return readdirSync(path).filter(dir => dir);
}

function getCommand(nameOrAlias: string, client: ExtendedClient): Command | undefined {
  const key = nameOrAlias.toLowerCase();
  return client.commands.get(key)
    || client.commands.find(cmd => cmd.aliases?.includes(key));
}

function getCategory(name: string, categories: string[]): string | undefined {
  return categories.find(cat => cat.toLowerCase().endsWith(name.toLowerCase()));
}

function buildCommandEmbed(cmd: Command): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`Comando \`${cmd.name}\``)
    .setColor(color as any)
    .setFooter(FOOTER);

  if (cmd.desc) embed.addFields({ name: '✍ Descripción', value: `\`\`\`${cmd.desc}\`\`\`` });
  if (cmd.aliases?.length) embed.addFields({ name: '✅ Alias', value: cmd.aliases.map(a => `\`${a}\``).join(', ') });
  if (cmd.permisos?.length) embed.addFields({ name: '👤 Permisos requeridos', value: cmd.permisos.map(p => `\`${p}\``).join(', ') });
  if (cmd.permisos_bot?.length) embed.addFields({ name: '🤖 Permisos de BOT requeridos', value: cmd.permisos_bot.map(p => `\`${p}\``).join(', ') });

  return embed;
}

function buildCategoryEmbed(category: string, index: number, total: number, guild: Guild): EmbedBuilder {
  const commands = readdirSync(`./src/commands/${category}`)
    .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
    .map(file => `\`${file.replace(/\.(js|ts)$/, '')}\``);

  return new EmbedBuilder()
    .setTitle(`Categoría: ${category}`)
    .setColor(color as any)
    .setThumbnail(guild.iconURL({ forceStatic: false }) || '')
    .setDescription(commands.length ? `>>> *${commands.join(' - ')}*` : '>>> *Sin comandos aún...*')
    .setFooter({ text: `Página ${index} / ${total}`, iconURL: guild.iconURL({ forceStatic: false }) || '' });
}

const emojiMap: Record<string, string> = {
  Admin: '🔧',
  Moderacion: '🔨',
  Musica: '🎧',
  Info: '❓',
  Misc: '➕',
  Setup: '✅',
  Ajustes: '⚙',
  // … el resto de tus carpetas
};

const command: Command = {
  name: 'help',
  aliases: ['h', 'ayuda', 'bothelp'],
  desc: 'Muestra información del bot y sus comandos',
  slashBuilder: new SlashCommandBuilder()
    .setName('help')
    .setDescription('❓ ¡Consulta la información del bot!')
    .addStringOption(opt =>
      opt.setName('comando')
        .setDescription('❓ El nombre del comando que quieres ver.')
        .setRequired(false),
    ) as SlashCommandBuilder,
  async run(
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    prefix: string,
    interaction: ChatInputCommandInteraction | null
  ): Promise<void> {
    const latency = Math.round(client.ws.ping);
    const categories = listCategories();
    let input: string | undefined;

    if (message) {
      input = args.join(' ');
      if (input.length) {
        const cmd = getCommand(input, client);
        const cat = getCategory(input, categories);

        if (cmd) {
          await message.reply({ embeds: [buildCommandEmbed(cmd)] });
          return;
        }

        if (cat) {
          const embed = buildCategoryEmbed(cat, 1, 1, message.guild!)
            .setTitle(`Categoría: ${cat}`);
          await message.reply({ embeds: [embed] });
          return;
        }

        await message.reply(`❌ Comando o categoría \`${input}\` no encontrada. Usa \`${prefix}help\` para ver más.`);
        return;
      }

      const totalPages = categories.length + 1;
      let currentPage = 0;

      const overview = new EmbedBuilder()
        .setTitle(`Ayuda de __${client.user!.tag}__`)
        .setColor(color as any)
        .setDescription('Bot multifuncional en desarrollo por [lukitaz_r](https://github.com/lukitaz-r)')
        .addFields(
          { name: '❓ ¿Quién soy?', value: `👋 Hola **${message.author.username}**, soy **${client.user!.username}** con funciones de ADMIN, MODERACIÓN, MÚSICA y más.` },
          { name: '📈 Estadísticas', value: `⚙ **${client.commands.size} comandos** en **${client.guilds.cache.size} servidores**\n📶 \`${latency}ms\` ping` },
        )
        .setThumbnail(message.guild!.iconURL({ forceStatic: false }) || '')
        .setFooter({ text: `Página 1 / ${totalPages}` });

      const pages = [overview, ...categories.map((cat, i) => buildCategoryEmbed(cat, i + 2, totalPages, message.guild!))];

      const select = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_select')
          .setPlaceholder('Selecciona categoría')
          .addOptions(
            categories.map(cat => ({
              label: cat,
              value: cat,
              description: `Ver comandos de ${cat}`,
              emoji: { name: emojiMap[cat] || '❔' },
            })),
          ),
      );

      const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('Atrás').setEmoji('⬅️').setStyle(1),
        new ButtonBuilder().setCustomId('home').setLabel('Inicio').setEmoji('🏠').setStyle(2),
        new ButtonBuilder().setCustomId('next').setLabel('Avanzar').setEmoji('➡️').setStyle(1),
      );

      const helpMsg = await message.reply({ embeds: [pages[0]], components: [select, nav] });

      const collector = helpMsg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        idle: 180000,
      });

      collector.on('collect', async inter => {
        if (inter.isStringSelectMenu()) {
          const selected = inter.values[0];
          const embed = buildCategoryEmbed(selected, 1, 1, message.guild!);
          await inter.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        switch (inter.customId) {
          case 'prev':
            currentPage = (currentPage - 1 + pages.length) % pages.length;
            break;
          case 'next':
            currentPage = (currentPage + 1) % pages.length;
            break;
          case 'home':
            currentPage = 0;
            break;
        }

        await inter.update({ embeds: [pages[currentPage]] });
        collector.resetTimer();
      });

      collector.on('end', () => {
        helpMsg.edit({ content: `Tiempo expirado. Vuelve a usar \`${prefix}help\` para reabrirlo.`, components: [] }).catch(() => { });
      });
    }

    if (interaction) {
      const option = interaction.options.getString('comando', false);
      await interaction.deferReply();

      if (option) {
        const cmd = getCommand(option, client);
        const cat = getCategory(option, categories);

        if (cmd) {
          await interaction.editReply({ embeds: [buildCommandEmbed(cmd)] });
          return;
        }

        if (cat) {
          const embed = buildCategoryEmbed(cat, 1, 1, interaction.guild!)
            .setTitle(`Categoría: ${cat}`);
          await interaction.editReply({ embeds: [embed] });
          return;
        }

        await interaction.editReply(`❌ Comando o categoría \`${option}\` no encontrada. Usa \`${prefix}help\` para ver más.`);
        return;
      }

      const totalPages = categories.length + 1;
      let currentPage = 0;

      const overview = new EmbedBuilder()
        .setTitle(`Ayuda de __${client.user!.tag}__`)
        .setColor(color as any)
        .setDescription('Bot multifuncional en desarrollo por `lukitaz_r`')
        .addFields(
          { name: '❓ ¿Quién soy?', value: `👋 Hola **${interaction.user.username}**, soy **${client.user!.username}** con funciones de ADMIN, MODERACIÓN, MÚSICA y más.` },
          { name: '📈 Estadísticas', value: `⚙ **${client.commands.size} comandos** en **${client.guilds.cache.size} servidores**\n📶 \`${latency}ms\` ping` },
        )
        .setThumbnail(interaction.guild!.iconURL({ forceStatic: false }) || '')
        .setFooter({ text: `Página 1 / ${totalPages}` });

      const pages = [overview, ...categories.map((cat, i) => buildCategoryEmbed(cat, i + 2, totalPages, interaction.guild!))];

      const select = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_select')
          .setPlaceholder('Selecciona categoría')
          .addOptions(
            categories.map(cat => ({
              label: cat,
              value: cat,
              description: `Ver comandos de ${cat}`,
              emoji: { name: emojiMap[cat] || '❔' },
            })),
          ),
      );

      const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('Atrás').setEmoji('⬅️').setStyle(1),
        new ButtonBuilder().setCustomId('home').setLabel('Inicio').setEmoji('🏠').setStyle(2),
        new ButtonBuilder().setCustomId('next').setLabel('Avanzar').setEmoji('➡️').setStyle(1),
      );

      const helpMsg = await interaction.editReply({ embeds: [pages[0]], components: [select, nav] });

      const collector = helpMsg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        idle: 180000,
      });

      collector.on('collect', async inter => {
        if (inter.isStringSelectMenu()) {
          const selected = inter.values[0];
          const embed = buildCategoryEmbed(selected, 1, 1, interaction.guild!);
          await inter.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        switch (inter.customId) {
          case 'prev':
            currentPage = (currentPage - 1 + pages.length) % pages.length;
            break;
          case 'next':
            currentPage = (currentPage + 1) % pages.length;
            break;
          case 'home':
            currentPage = 0;
            break;
        }

        await inter.update({ embeds: [pages[currentPage]] });
        collector.resetTimer();
      });

      collector.on('end', () => {
        helpMsg.edit({ content: `Tiempo expirado. Vuelve a usar \`${prefix}help\` para reabrirlo.`, components: [] }).catch(() => { });
      });
    }
  },
};

export = command;
