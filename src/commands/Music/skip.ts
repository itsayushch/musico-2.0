import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

import timeString from '../../lib/time-string';

@ApplyOptions<Command.Options>({
	description: 'Leaves the voice channel and clears the queue.',
    options: ['clear']
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
		// Register context menu command available from any message
		registry.registerContextMenuCommand({
			name: this.name,
			type: 'MESSAGE'
		});
		// Register context menu command available from any user
		registry.registerContextMenuCommand({
			name: this.name,
			type: 'USER'
		});
	}

	// Message command
	public async messageRun(message: Message, args: Args) {
		let num = await args.rest('number').catch(() => 1);

		if (!message.member?.voice?.channel) {
			return send(message, {
                content: null,
                embeds:[{
                    description: 'You must be connected to a voice channel to use that command!', color: 11642864 
                }]
            })
		}

        const queue = this.container.client.music.queues.get(message.guild!.id);
		const queues = await queue.tracks();

		num = !queues.length || num > queues.length ? 1 : num;
		const skip = await queue.next(num);
		if (!skip) {
			await queue.stop();
			
			return send(message, {
				content: null,
				embeds: [{ author: { name: 'Skipped ⏭' }, color: 11642864 }]
			});
		}

		const song = await this.decode(queues[num - 1]);

		const embed = new MessageEmbed()
		    .setColor(11642864)
			.setAuthor({ name: 'Now Playing' })
			.setThumbnail(`https://i.ytimg.com/vi/${song.identifier}/hqdefault.jpg`)
			.setDescription(`[${song.title}](${song.uri}) (${song.isStream ? '∞' : timeString(song.length)})`);

		return send(message, {
			content: null,
			embeds: [embed]
		});
	}

    async decode(track: string) {
		const decoded = await this.container.client.music.decode(track);
		return decoded;
	}
}