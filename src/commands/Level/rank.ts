import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { GuildMember, Message, MessageAttachment, User } from 'discord.js';

import { Rank } from 'canvacord';

@ApplyOptions<Command.Options>({
	description: 'Shows you your level and rank in the server.',
	aliases: ['level']
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
		const data = await this.getData(message.author);

		const rank = new Rank()
			.setAvatar(message.author.displayAvatarURL({ size: 2048, format: 'png' }))
			.setCurrentXP(data.currentLevelExp)
			.setRequiredXP(data.levelExp)
			.setRank(data.rank)
			.setLevel(data.currentLevel)
			.setStatus(message.member?.presence?.status ?? 'offline')
			.setProgressBar('#FFFFFF', 'COLOR')
			.setUsername('Snowflake')
			.setDiscriminator('0007');

		const img = await rank.build();
		const attachment = new MessageAttachment(img, 'rank.png');

		return send(message, {
			attachments: [attachment]
		});
	}

	public async chatInputRun(message: Command.ChatInputInteraction) {
		const data = await this.getData(message.user);

		const rank = new Rank()
			.setAvatar(message.user.displayAvatarURL({ size: 2048, format: 'png' }))
			.setCurrentXP(data.currentLevelExp)
			.setRequiredXP(data.levelExp)
			.setRank(data.rank)
			.setLevel(data.currentLevel)
			.setStatus((message.member as GuildMember)?.presence?.status ?? 'offline')
			.setProgressBar('#FFFFFF', 'COLOR')
			.setUsername('Snowflake')
			.setDiscriminator('0007');

		const img = await rank.build();
		const attachment = new MessageAttachment(img, 'rank.png');

		return message.reply({
			attachments: [attachment]
		});
	}

	private async getData(user: User) {
		const userData = await this.container.client.db.collection('levels').findOne({ user: user.id });

		const currentLevel = this.container.client.levels.getLevelFromExp(userData?.exp);
		const levelExp = this.container.client.levels.getLevelExp(currentLevel);
		const currentLevelExp = this.container.client.levels.getLevelProgress(userData?.exp);
		const leaderboard = await this.container.client.levels.getLeaderboard();
		const rank = leaderboard.findIndex((item) => item.user === user.id) + 1;

		return {
			currentLevel,
			levelExp,
			currentLevelExp,
			rank
		};
	}
}
