import type { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember, Message } from 'discord.js';

export class UserEvent extends Listener<typeof Events.MessageCreate> {
	public async run(message: Message) {
		if (!message.guild || message.guild.id !== '1056555185914265670' || message.author.bot) return;
		
        return await this.container.client.levels.giveGuildUserExp(message.member as GuildMember, message);
	}
}
