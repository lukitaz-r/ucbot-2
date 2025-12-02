import { SlashCommandBuilder, EmbedBuilder, Message, ChatInputCommandInteraction } from 'discord.js';
import { ensureVoice, buildEmbed, formatDuration } from '../../utils/music';
import { ExtendedClient, Command } from '../../types';
import { lavalink } from '../../../config/config.json';

const command: Command = {
  name: 'queue',
  aliases: ['cola', 'lista'],
  desc: '🎧 ¡Consulta la lista de canciones!',
  slashBuilder: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('🎧 ¡Consulta la lista de canciones!'),

  /**
   * Ejecuta el comando queue.
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
  ): Promise<void> {
    const ctx = message || interaction;
    if (!ctx) return;

    if (!lavalink.active) {
      ctx?.reply('❌🎧 El bot no está activado para reproducir música.');
      return;
    }

    const voiceChannel = ensureVoice(ctx as any);
    if (!voiceChannel) return;

    const player = client.manager.players.get(ctx.guild!.id);
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'La Última Radio',
      })
      .setTitle('📃 Lista de la Radio')
      .setColor('#0099ff')
      .setThumbnail(ctx.guild!.iconURL({ forceStatic: false }) || '');

    if (player?.current) {
      embed.setDescription(`**Ahora suena:**\n[${player.current.title}](${player.current.url}) - ${player.current.author} | \`${formatDuration(player.current.duration)}\``);
    }

    if (player?.queue.size > 0) {
      const tracks = player.queue.tracks.map((track: any, index: number) => {
        return `${index + 1}. ${track.title} - ${track.author} | \`${formatDuration(track.duration)}\``;
      });

      embed.addFields([{
        name: 'Las que siguen:',
        value: tracks.slice(0, 10).join('\n'),
      }]);

      if (player.queue.size > 10) {
        embed.addFields([{
          name: 'Y mas...',
          value: `${player.queue.size - 10} canciones mas en la cola.`,
        }]);
      }
    }

    if (message) {
      if (!player) {
        await ctx.reply({
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
        return;
      }

      if (ctx.member && 'voice' in ctx.member && ctx.member.voice.channel?.id !== player.voiceChannelId) {
        await ctx.reply({
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
        return;
      }

      if (!player?.current) {
        await ctx.reply({
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
        return;
      }

      if (!player?.current && player.queue.size === 0) {
        await ctx.reply('**¡No hay canciones en espera!** 😅');
        return;
      }

      await ctx.reply({
        embeds: [embed],
      });
    }

    if (interaction) {
      await interaction.deferReply();

      if (!player) {
        await interaction.editReply({
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
        return;
      }

      if (interaction.member && 'voice' in interaction.member && interaction.member.voice.channel?.id !== player.voiceChannelId) {
        await interaction.editReply({
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
        return;
      }

      if (!player?.current) {
        await interaction.editReply({
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
        return;
      }

      if (!player?.current && player.queue.size === 0) {
        await interaction.editReply('**¡No hay canciones en espera!** 😅');
        return;
      }

      await interaction.editReply({
        embeds: [embed],
      });
    }
  },
};

export = command;
