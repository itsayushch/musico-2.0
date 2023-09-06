import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import timeString from '../../lib/time-string';
import { musicCard } from 'musicard';

@ApplyOptions<Command.Options>({
	description: 'Shows What song the bot is currently playing.',
	aliases: ['np']
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
		if (!current) {
			const embed = new EmbedBuilder().setColor(0xff0000).setDescription('Could not find anything in the queue!');
			return send(message, { embeds: [embed] });
		}
		const decoded = await this.container.client.music.decode(current.track);



		const card = new musicCard()
			.setName(decoded.title)
			.setAuthor(decoded.author)
			.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
			.setBrightness(50)
			.setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`)
			.setProgress(Number(current.position / decoded.length) * 100)
			.setStartTime(`${timeString(current.position)}`)
			.setEndTime(`${decoded.isStream ? 'Live' : timeString(decoded.length)}`)

		const img = await card.build();

		const attachment = new AttachmentBuilder(img, { name: 'song.png' });

		return send(message, {
			files: [attachment]
		});
	}

	// slash command
	public async chatInputRun(message: Command.ChatInputCommandInteraction) {
		const queue = this.container.client.music.queues.get(message.guild!.id);

		const current = await queue.current();
		if (!current) {
			const embed = new EmbedBuilder().setColor(0xff0000).setDescription('Could not find anything in the queue!');
			return message.reply({ embeds: [embed] });
		}
		const decoded = await this.container.client.music.decode(current.track);



		const card = new musicCard()
			.setName(decoded.title)
			.setAuthor(decoded.author)
			.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
			.setBrightness(50)
			.setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`)
			.setProgress(Number(current.position / decoded.length) * 100)
			.setStartTime(`${timeString(current.position)}`)
			.setEndTime(`${decoded.isStream ? 'Live' : timeString(decoded.length)}`)

		const img = await card.build();

		const attachment = new AttachmentBuilder(img, { name: 'np.png' });

		return message.reply({
			files: [attachment]
		});
	}
}

// class ProgressBar {
// 	public value: number;
// 	public maxValue: number;
// 	public barSize: number;

// 	constructor(value: number, maxValue: number, barSize: number) {
// 		this.value = value;
// 		this.maxValue = maxValue;
// 		this.barSize = barSize;
// 	}

// 	createBar(showPercentage = true) {
// 		const percentage = this.value / this.maxValue; // Calculate the percentage of the bar
// 		const progress = Math.round(this.barSize * percentage); // Calculate the number of square caracters to fill the progress side.
// 		const emptyProgress = this.barSize - progress; // Calculate the number of dash caracters to fill the empty progress side.

// 		const progressText = `[▰](https://www.youtube.com/watch?v=dQw4w9WgXcQ)`.repeat(progress); // Repeat is creating a string with progress * caracters in it
// 		const emptyProgressText = '▱'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
// 		const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

// 		const bar = `${progressText}${emptyProgressText}${showPercentage ? ` ${percentageText}` : ''}`; // Creating the bar
// 		return bar;
// 	}
// }
