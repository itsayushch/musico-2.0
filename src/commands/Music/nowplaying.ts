import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import timeString from '../../lib/time-string';

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
			const embed = new MessageEmbed().setColor('RED').setDescription('Could not find anything in the queue!');
			return send(message, { embeds: [embed] });
		}
		const decoded = await this.container.client.music.decode(current.track);
		const position = Number(current.position);
		const duration = Number(decoded.length);
		const progress = new ProgressBar(position, duration, 15);

		const embed = new MessageEmbed()
			.setColor(11642864)
			.setAuthor({ name: 'Now Playing' })
			.setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`).setDescription(stripIndents`
			**❯ Song**
			[${decoded.title}](${decoded.uri})
			**❯ Uploaded by**
			${decoded.author}
			**❯ Time**
			${timeString(current.position)}/${decoded.isStream ? '∞' : timeString(decoded.length)}
			**❯ Progress Bar**
			${progress.createBar()}
			`);

		return send(message, { embeds: [embed] });
	}

	// slash command
	public async chatInputRun(message: Command.ChatInputInteraction) {
		const queue = this.container.client.music.queues.get(message.guild!.id);

		const current = await queue.current();
		if (!current) {
			const embed = new MessageEmbed().setColor('RED').setDescription('Could not find anything in the queue!');
			return message.reply({ embeds: [embed] });
		}
		const decoded = await this.container.client.music.decode(current.track);
		const position = Number(current.position);
		const duration = Number(decoded.length);
		const progress = new ProgressBar(position, duration, 15);

		const embed = new MessageEmbed()
			.setColor(11642864)
			.setAuthor({ name: 'Now Playing' })
			.setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`).setDescription(stripIndents`
			**❯ Song**
			[${decoded.title}](${decoded.uri})
			**❯ Uploaded by**
			${decoded.author}
			**❯ Time**
			${timeString(current.position)}/${decoded.isStream ? '∞' : timeString(decoded.length)}
			**❯ Progress Bar**
			${progress.createBar()}
			`);

		return message.reply({ embeds: [embed] });
	}
}

class ProgressBar {
	public value: number;
	public maxValue: number;
	public barSize: number;

	constructor(value: number, maxValue: number, barSize: number) {
		this.value = value;
		this.maxValue = maxValue;
		this.barSize = barSize;
	}

	createBar(showPercentage = true) {
		const percentage = this.value / this.maxValue; // Calculate the percentage of the bar
		const progress = Math.round(this.barSize * percentage); // Calculate the number of square caracters to fill the progress side.
		const emptyProgress = this.barSize - progress; // Calculate the number of dash caracters to fill the empty progress side.

		const progressText = `[▰](https://www.youtube.com/watch?v=dQw4w9WgXcQ)`.repeat(progress); // Repeat is creating a string with progress * caracters in it
		const emptyProgressText = '▱'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
		const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

		const bar = `${progressText}${emptyProgressText}${showPercentage ? ` ${percentageText}` : ''}`; // Creating the bar
		return bar;
	}
}
