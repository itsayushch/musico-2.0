import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { GuildMember, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Leaves the voice channel and clears the queue.'
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
		if (!message.member?.voice?.channel) {
			return send(message, {
				content: null,
				embeds: [{
					description: 'You must be connected to a voice channel to use that command!', color: 11642864
				}]
			})
		}

		const queue = this.container.client.music.queues.get(message.guild!.id);
		await queue.clear();
		await queue.stop();
		await queue.player.destroy();
		if (message.guild?.me?.voice.channel) await queue.player.leave();

		return send(message, {
			content: null,
			embeds: [{ author: { name: 'Left the voice channel!' }, color: 11642864 }]
		});
	}

	// slash command
	public async chatInputRun(message: Command.ChatInputInteraction) {
		if (!(message.member as GuildMember)?.voice?.channel) {
			return message.reply({
				content: null,
				embeds: [{
					description: 'You must be connected to a voice channel to use that command!', color: 11642864
				}]
			})
		}

		const queue = this.container.client.music.queues.get(message.guild!.id);
		await queue.clear();
		await queue.stop();
		await queue.player.destroy();
		if (message.guild?.me?.voice.channel) await queue.player.leave();

		return message.reply({
			content: null,
			embeds: [{ author: { name: 'Left the voice channel!' }, color: 11642864 }]
		});
	}
}