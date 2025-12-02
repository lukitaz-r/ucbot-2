import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from 'discord.js';
import { ensureVoice, buildEmbed } from '../../utils/music';
import { ExtendedClient, Command } from '../../types';
import { lavalink } from '../../../config/config.json';

const command: Command = {
  name: 'pause',
  aliases: ['pausa'],
  desc: '🎧 ¡Pausa la canción!',
  slashBuilder: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('🎧 ¡Pausa la canción!'),

  /**
   * Ejecuta el comando pause.
   * @param client Instancia del cliente de Discord
   * @param message Mensaje que invocó el comando
   * @param args Argumentos del comando
   * @param prefix Prefijo utilizado
   * @param interaction Interacción de slash command
   */
  async run(
    client: ExtendedClient,
    message: Message | null,
    _args: string[],
    prefix: string,
    interaction: ChatInputCommandInteraction | null,
  ): Promise<any> {

    const ctx = message || interaction;
    if (!ctx) return;

    if (!lavalink.active) return ctx?.reply('❌🎧 El bot no está activado para reproducir música.');

    const user = message?.author || interaction?.user;
    if (!user) return;

    const voiceChannel = ensureVoice(ctx as any);
    if (!voiceChannel) return;

    const player = client.manager.players.get(ctx.guild!.id);

    if (message) {
      if (!player) {
        return ctx.reply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 No hay una radio activa en el servidor',
              description: `> Si quieres escuchar musica, pon \`${prefix}play [cancion]\` o \`/play\``,
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (ctx.member && 'voice' in ctx.member && ctx.member.voice.channel?.id !== player.voiceChannelId) {
        return ctx.reply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 Debes estar en el mismo VC del bot',
              description: '> Así no funcionan las cosas...',
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (!player?.current) {
        return ctx.reply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 No hay nada sonando ahora',
              description: `> Si quieres escuchar musica, pon \`${prefix}play [cancion]\` o \`/play'`,
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (player.paused) {
        return ctx.reply('**¡La canción ya está pausada!** 😅');
      }

      const requestedById = typeof player.current.requestedBy === 'string'
        ? player.current.requestedBy
        : (player.current.requestedBy as any)?.id || 'Unknown';

      await ctx.reply({
        embeds: [
          buildEmbed({
            author: 'La Última Radio',
            title: '⏸️ Canción pausada',
            description: `[${player.current.title}](${player.current.url}) - ${player.current.author} \n > Solicitada por <@${requestedById}> \n > Pausada por <@${user.id}>`,
            thumbnail: user.avatarURL() || undefined,
            color: 'Yellow',
          }),
        ],
      });
    }

    if (interaction) {
      await interaction.deferReply();

      if (!player) {
        return interaction.editReply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 No hay una radio en el servidor ahora mismo',
              description: `> Si quieres escuchar musica, pon \`${prefix}play [cancion]\` o \`/play\``,
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (interaction.member && 'voice' in interaction.member && interaction.member.voice.channel?.id !== player.voiceChannelId) {
        return interaction.editReply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 Debes estar en el mismo VC del bot',
              description: '> Así no funcionan las cosas...',
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (!player?.current) {
        return interaction.editReply({
          embeds: [
            buildEmbed({
              author: 'La Última Radio',
              title: '❌🎧 No hay nada sonando ahora',
              description: `> Si quieres escuchar musica, pon \`${prefix}play [cancion]\` o \`/play\``,
              thumbnail: client.user!.avatarURL() || undefined,
              color: 'Red',
            }),
          ],
        });
      }

      if (player.paused) {
        return interaction.editReply('**¡La canción ya está pausada!** 😅');
      }

      const requestedById = typeof player.current.requestedBy === 'string'
        ? player.current.requestedBy
        : (player.current.requestedBy as any)?.id || 'Unknown';

      await interaction.editReply({
        embeds: [
          buildEmbed({
            author: 'La Última Radio',
            title: '⏸️ Canción pausada',
            description: `[${player.current.title}](${player.current.url}) - ${player.current.author} \n > Solicitada por <@${requestedById}> \n > Pausada por <@${user.id}>`,
            thumbnail: user.avatarURL() || undefined,
            color: 'Yellow',
          }),
        ],
      });
    }

    return player.pause();
  },
};

export = command;
