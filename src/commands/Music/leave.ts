import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

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
	public async messageRun(message: Message) {
		if (!message.member?.voice?.channel) {
			return send(message, {
                content: null,
                embeds:[{
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
			embeds: [{author: { name: 'Left the voice channel!' }, color: 11642864}]
		});
	}
}