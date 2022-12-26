import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { stripIndents } from 'common-tags';

import timeString from '../../lib/time-string';
import { sendLoadingMessage } from '../../lib/utils';

@ApplyOptions<Command.Options>({
    description: 'Shows you the current queue',
    aliases: ['q']
})

export class UserCommand extends Command {
    // Register slash and context menu command
    public override registerApplicationCommands(registry: Command.Registry) {
        // Register slash command
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        });
    }

    // Message command
    public async messageRun(message: Message) {
        const queue = this.container.client.music.queues.get(message.guild!.id);

        const current = await queue.current();
        const tracks = [(current || { track: null }).track].concat(await queue.tracks()).filter(track => track);

        if (!tracks.length) {
            return send(message, {
                embeds: [{ description: 'Got nothing in queue!', color: 'RED' }]
            });
        }

        let page = 1;

        const response = await sendLoadingMessage(message);

        const decoded = await this.container.client.music.decode(tracks);
        const totalLength = decoded.reduce((prev, song) => prev + song.info.length, 0);

        let paginated = this.paginate(decoded.slice(1), page);

        let index = (paginated.page - 1) * 10;

        const embed = new MessageEmbed()
            .setColor(11642864)
            .setTitle('Music Queue')
            .setFooter({ text: ' Page' });

        const paginatedMessage = new PaginatedMessage({
            template: embed
        });

        for (let i = 0; i < paginated.maxPage; i++) {
            paginated = this.paginate(decoded.slice(1), page);
            paginatedMessage.addPageEmbed((embed) =>
                embed.setDescription([
                    '**Now Playing**',
                    `[${decoded[0].info.title}](${decoded[0].info.uri}) (${timeString(current?.position ?? 0)}/${decoded[0].info.isStream ? '∞' : timeString(decoded[0].info.length)})`,
                    '',
                    paginated.items.length
                        ? stripIndents`**Queue${paginated.maxPage > 1 ? `, Page ${paginated.page}/${paginated.maxPage}` : ''}**
				${paginated.items.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${song.info.isStream ? '∞' : timeString(song.info.length)})`).join('\n')}\n
				**Total Queue Time:** ${timeString(totalLength)}, **Song${decoded.length > 1 || decoded.length === 0 ? 's' : ''}:** ${decoded.length}`
                        : 'No more songs in Queue'
                ].join('\n'))
            );
            ++page;
        }

        await paginatedMessage.run(response, message.author);
        return response;
    }

    async decode(track: string) {
        const decoded = await this.container.client.music.decode(track);
        return decoded;
    }

    paginate(items: any[], page = 1, pageLength = 10) {
        const maxPage = Math.ceil(items.length / pageLength);
        if (page < 1) page = 1;
        if (page > maxPage) page = maxPage;
        const startIndex = (page - 1) * pageLength;

        return {
            items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
            page,
            maxPage,
            pageLength
        };
    }
}