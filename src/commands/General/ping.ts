import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, EmbedBuilder, ApplicationCommandType } from 'discord.js';

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
			type: ApplicationCommandType.Message
		});
		// Register context menu command available from any user
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User
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
			embeds: [new EmbedBuilder().setColor('DarkNavy').setDescription(content)]
		});
	}
	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: 'Ping?', fetchReply: true });

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			msg.createdTimestamp - interaction.createdTimestamp
		}ms.`;

		return await interaction.editReply({
			content: null,
			embeds: [new EmbedBuilder().setColor('DarkNavy').setDescription(content)]
		});
	}
}
