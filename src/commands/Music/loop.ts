import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { GuildMember, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Loops the current song in the queue.',
	aliases: ['repeat']
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
		if (!message.member?.voice || !message.member.voice.channel) {
			return send(message, {
				content: null,
				embeds: [{
					description: 'You must be connected to a voice channel to use that command!', color: 'RED'
				}]
			});
		}

		const queue = this.container.client.music.queues.get(message.guild!.id);
		const looping = queue.looping() ? queue.looping(false) : queue.looping(true);

		return send(message, {
			embeds: [{ author: { name: looping ? 'Enabled 🔁' : 'Disabled 🔁' }, color: 11642864 }]
		});
	}

	// slash command
	public async chatInputRun(message: Command.ChatInputInteraction) {
		if (!(message.member as GuildMember)?.voice || !(message.member as GuildMember)?.voice.channel) {
			return message.reply({
				content: null,
				embeds: [{
					description: 'You must be connected to a voice channel to use that command!', color: 'RED'
				}]
			});
		}

		const queue = this.container.client.music.queues.get(message.guild!.id);
		const looping = queue.looping() ? queue.looping(false) : queue.looping(true);

		return message.reply({
			embeds: [{ author: { name: looping ? 'Enabled 🔁' : 'Disabled 🔁' }, color: 11642864 }]
		});
	}
}