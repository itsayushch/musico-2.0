import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import timeString from '../../lib/time-string';

@ApplyOptions<Command.Options>({
    description: 'Seeks to a specific position (default: 0)',
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
    public async messageRun(message: Message, args: Args) {
        if (!message.member?.voice || !message.member.voice.channel) {
            return send(message, {
                content: null,
                embeds: [{
                    description: 'You must be connected to a voice channel to use that command!', color: 'RED'
                }]
            });
        }

        const position = await args.rest('string').catch(() => '0');

        const queue = this.container.client.music.queues.get(message.guild!.id);

        const current = await queue.current();
        if (!current) return;

        const ms = position.replace('.', ':').split(':');
		let point = 0;

		switch (ms.length) {
			case 1:
				point = Number(ms[0]) * 1000 * 60;
				break;
			case 2:
				point = Number(ms[0]) * 60 * 1000 + Number(ms[1].padEnd(2, '0')) * 1000;
				break;
			case 3:
				point = Number(ms[0]) * 60 * 60 * 1000 + Number(ms[1]) * 60 * 1000 + Number(ms[2]) * 1000;
				break;
			default:
				break;
		}
		await queue.player.seek(point);
		const decoded = await this.container.client.music.decode(current.track);
		const duration = Number(decoded.length);
		const progress = new ProgressBar(point, duration, 15);
		
        const embed = new MessageEmbed()
			.setColor(11642864)
			.setAuthor({ name: 'Seeked' })
			.setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`)
			.setDescription([
				`[${decoded.title}](${decoded.uri}) \`[${timeString(point)}/${decoded.isStream ? '∞' : timeString(decoded.length)}]\``,
				'\n',
				`${progress.createBar(message)}`
			].join('\n'));
		
        return send(message, { embeds: [embed] });
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

    createBar(message: Message, showPercentage = true) {
        const percentage = this.value / this.maxValue; // Calculate the percentage of the bar
        const progress = Math.round(this.barSize * percentage); // Calculate the number of square caracters to fill the progress side.
        const emptyProgress = this.barSize - progress; // Calculate the number of dash caracters to fill the empty progress side.

        const progressText = `[▰](${message.url.replace(message.id, '')})`.repeat(progress); // Repeat is creating a string with progress * caracters in it
        const emptyProgressText = '▱'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
        const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

        const bar = `${progressText}${emptyProgressText}${showPercentage ? ` ${percentageText}` : ''}`; // Creating the bar
        return bar;
    }
}