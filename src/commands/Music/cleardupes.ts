import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Removes duplicate songs from the queue.',
	aliases: ['removedupes', 'rd']
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
		const tracks = await queue.tracks();
		if (!tracks.length) {
			return send(message, {
				embeds: [{ description: 'You must be playing a track to use this command!', color: 11642864 }]
			});
		}

		const newTracks = tracks.reduce((a: any, b: any) => {
			if (a.indexOf(b) < 0) a.push(b);
			return a;
		}, []);

		await queue.store.cached.delete(queue.keys.next);
		await queue.add(...newTracks);

		const removed = tracks.length - newTracks.length;
		return send(message, {
			embeds: [
				{
					author: {
						name: `Removed ${removed} Track${removed === 1 ? '' : 's'}`
					},
					color: 11642864
				}
			]
		});
	}

	// slash command
	public async chatInputRun(message: Command.ChatInputCommandInteraction) {
		const queue = this.container.client.music.queues.get(message.guild!.id);
		const tracks = await queue.tracks();
		if (!tracks.length) {
			return message.reply({
				embeds: [{ description: 'You must be playing a track to use this command!', color: 11642864 }]
			});
		}

		const newTracks = tracks.reduce((a: any, b: any) => {
			if (a.indexOf(b) < 0) a.push(b);
			return a;
		}, []);

		await queue.store.cached.delete(queue.keys.next);
		await queue.add(...newTracks);

		const removed = tracks.length - newTracks.length;
		return message.reply({
			embeds: [
				{
					author: {
						name: `Removed ${removed} Track${removed === 1 ? '' : 's'}`
					},
					color: 11642864
				}
			]
		});
	}
}
