import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
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
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('member').setDescription(this.description).setRequired(false))
		);
    }

    // Message command
    public async messageRun(message: Message, args: Args) {
        const member = await args.rest('member').catch(() => message.member!)

        const data = await this.getData(member.user);

        if (!data.userData && !member.user.bot) {
			return send(message, {
				embeds: [{
					color: 'RED',
					description: `<:Cross:1060646027318800385> **${member.user.tag}** does not have any exp. Start chatting to earn them.`
				}]
			});
		} else if (member.user.bot) {
            return send(message, {
				embeds: [{
					color: 'RED',
					description: `<:Cross:1060646027318800385> **${member.user.tag}** is a bot. What is the point of a bot earning exp?`
				}]
			});
		}

        const rank = new Rank()
            .setAvatar(member.displayAvatarURL({ size: 2048, format: 'png' }))
            .setCurrentXP(data.currentLevelExp)
            .setRequiredXP(data.levelExp)
            .setRank(data.rank)
            .setLevel(data.currentLevel)
            .setStatus(member?.presence?.status ?? 'offline')
            .setProgressBar('#FFFFFF', 'COLOR')
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator);

        const img = await rank.build();
        const attachment = new MessageAttachment(img, 'rank.png');

        return send(message, {
            files: [attachment]
        });
    }

    public async chatInputRun(message: Command.ChatInputInteraction) {
        const member = (message.options.getMember('member') ?? message.member) as GuildMember;

        const data = await this.getData(member.user);


        if (!data.userData && !member.user.bot) {
			return message.reply({
				embeds: [{
					color: 'RED',
					description: `<:Cross:1060646027318800385> **${member.user.tag}** does not have any exp. Start chatting to earn them.`
				}]
			});
		} else if (member.user.bot) {
            return message.reply({
				embeds: [{
					color: 'RED',
					description: `<:Cross:1060646027318800385> **${member.user.tag}** is a bot. What is the point of a bot earning exp?`
				}]
			});
		}


        const rank = new Rank()
            .setAvatar(member.user.displayAvatarURL({ size: 2048, format: 'png' }))
            .setCurrentXP(data.currentLevelExp ?? 0)
            .setRequiredXP(data.levelExp)
            .setRank(data.rank)
            .setLevel(data.currentLevel)
            .setStatus(member?.presence?.status ?? 'offline')
            .setProgressBar('#FFFFFF', 'COLOR')
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator);

        const img = await rank.build();
        const attachment = new MessageAttachment(img, 'rank.png');

        return message.reply({
            files: [attachment]
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
            userData,
            currentLevel,
            levelExp,
            currentLevelExp,
            rank
        };
    }
}
