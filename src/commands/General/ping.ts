import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
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
		const msg = await send(message, 'Pinging!');

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
		}ms.`;

		return send(message, {
			content: null,
			embeds: [new MessageEmbed().setColor('DARK_NAVY').setDescription(content)]
		});
	}
	// slash command
	public async chatInputRun(interaction: Command.ChatInputInteraction) {
		const msg = await interaction.reply({ content: 'Ping?', fetchReply: true });
		const createdTime = msg instanceof Message ? msg.createdTimestamp : Date.parse(msg.timestamp);

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			createdTime - interaction.createdTimestamp
		}ms.`;

		return await interaction.editReply({
			content: null,
			embeds: [new MessageEmbed().setColor('DARK_NAVY').setDescription(content)]
		});
	}
}
