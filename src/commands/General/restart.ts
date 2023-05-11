import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
    aliases: ['restart'],
    description: 'Restart the bot',
    preconditions: ['OwnerOnly'],
})

export class RestartComamnd extends Command {
    public async messageRun(message: Message) {

		this.container.logger.info('RESTARTING');

		await send(message, {
			embeds: [{
				color: 0xFF0000,
				description: '**RESTARTING**'
			}]
		});

		process.exit();
    }
}