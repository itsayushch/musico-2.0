import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { GuildMember, Message, AttachmentBuilder } from 'discord.js';

import timeString from '../../lib/time-string';
import { musicCard } from 'musicard';

@ApplyOptions<Command.Options>({
	description: 'Skips a song to the next one.',
	aliases: ['s', 'next']
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption((option) => option.setName('position').setDescription(this.description).setRequired(false))
		);
	}

	// Message command
	public async messageRun(message: Message, args: Args) {
		let num = await args.rest('number').catch(() => 1);

		if (!message.member?.voice?.channel) {
			return send(message, {
				embeds: [
					{
						description: 'You must be connected to a voice channel to use that command!',
						color: 11642864
					}
				]
			});
		}

		const queue = this.container.client.music.queues.get(message.guild!.id);
		const queues = await queue.tracks();

		num = !queues.length || num > queues.length ? 1 : num;
		const skip = await queue.next(num);
		if (!skip) {
			await queue.stop();

			return send(message, {
				embeds: [{ author: { name: 'Skipped ⏭' }, color: 11642864 }]
			});
		}

		const song = await this.decode(queues[num - 1]);

		const card = new musicCard()
			.setName(song.title)
			.setAuthor(song.author)
			.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
			.setBrightness(50)
			.setThumbnail(`https://i.ytimg.com/vi/${song.identifier}/hqdefault.jpg`)
			.setProgress(0)
			.setStartTime("0:00")
			.setEndTime(`${song.isStream ? 'Live' : timeString(song.length)}`)

		const img = await card.build();

		const attachment = new AttachmentBuilder(img, { name: 'song.png' });

		return send(message, {
			files: [attachment]
		});
	}

	public async chatInputRun(message: Command.ChatInputCommandInteraction) {
		if (!(message.member as GuildMember)?.voice?.channel) {
			return message.reply({
				embeds: [
					{
						description: 'You must be connected to a voice channel to use that command!',
						color: 11642864
					}
				]
			});
		}

		let num = message.options.getInteger('position') ?? 1;

		const queue = this.container.client.music.queues.get(message.guild!.id);
		const queues = await queue.tracks();

		num = !queues.length || num > queues.length ? 1 : num;
		const skip = await queue.next(num);
		if (!skip) {
			await queue.stop();

			return message.reply({
				embeds: [{ author: { name: 'Skipped ⏭' }, color: 11642864 }]
			});
		}

		const song = await this.decode(queues[num - 1]);

		const card = new musicCard()
			.setName(song.title)
			.setAuthor(song.author)
			.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
			.setBrightness(50)
			.setThumbnail(`https://i.ytimg.com/vi/${song.identifier}/hqdefault.jpg`)
			.setProgress(0)
			.setStartTime("0:00")
			.setEndTime(`${song.isStream ? 'Live' : timeString(song.length)}`)

		const img = await card.build();

		const attachment = new AttachmentBuilder(img, { name: 'song.png' });

		return message.reply({
			files: [attachment]
		});
	}

	async decode(track: string) {
		const decoded = await this.container.client.music.decode(track);
		return decoded;
	}
}
