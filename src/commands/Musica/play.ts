import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from 'discord.js';
import { createPlayer, searchMusic, enqueuePlaylist, enqueueTrack, ensureVoice, buildEmbed } from '../../utils/music';
import { ExtendedClient, Command } from '../../types';

const command: Command = {
  name: 'play',
  aliases: ['escuchar', 'ponla', 'dj'],
  desc: '🎧 ¡Pon un temita!',
  slashBuilder: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎧 ¡Pon un temita!')
    .addStringOption(opt =>
      opt.setName('entrada')
        .setDescription('🎧 Un link valido (de Spotify, YouTube o Deezer) o el nombre de la canción.')
        .setRequired(true),
    )
    .addIntegerOption(opt =>
      opt.setName('posición')
        .setDescription('🎧 Posición en la que será asignada el tema dentro de la cola.')
        .setRequired(false),
    ),

  /**
   * Ejecuta el comando play.
   * @param client Instancia del cliente de Discord
   * @param message Mensaje que invocó el comando
   * @param args Argumentos del comando
   * @param prefix Prefijo utilizado
   * @param interaction Interacción de slash command
   */
  async run(
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    _prefix: string,
    interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    // Determina el contexto (mensaje o slash)
    const ctx = message || interaction;
    if (!ctx) return;

    const user = message?.author || interaction?.user;
    if (!user) return;

    let input: string;
    if (interaction) {
      input = interaction.options.getString('entrada', true);
    } else if (message) {
      input = args.join(' ');
    } else {
      return;
    }

    // 1. Asegurarse de que el usuario está en un canal de voz
    const voiceChannel = ensureVoice(ctx as any);
    if (!voiceChannel) return;

    // 2. Crear/obtener el player de Lavalink
    const player = createPlayer(client, ctx.guild!.id, voiceChannel.id, ctx.channel!.id);

    // 3. Realizar la búsqueda
    const searchResult = await searchMusic(client, input, user.id);

    if (!searchResult.tracks.length) {
      await ctx.reply({
        embeds: [buildEmbed({
          author: 'La Última Radio',
          title: '❌ No se encontraron resultados. ❌',
          description: '> Surgió un problema al intentar encontrar el track.',
          color: 'Red',
        })],
      });
      return;
    }

    // 4. Gestionar los distintos tipos de resultado
    switch (searchResult.loadType) {
      case 'playlist':
        await enqueuePlaylist(player, searchResult, message || false, interaction || false);
        break;
      case 'track':
      case 'search':
        await enqueueTrack(player, searchResult.tracks[0], message || false, interaction || false);
        break;
      case 'empty':
        await ctx.reply('❌ No hay coincidencias para tu búsqueda. ❌');
        return;
      case 'error':
        await ctx.reply(`❌ Error al cargar: ${searchResult.error || 'Desconocido'} ❌`);
        return;
    }

    // 5. Iniciar reproducción si aún no está sonando
    if (player && !player.playing) {
      await player.play();
    }
  },
};

export = command;
