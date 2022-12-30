import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberAdd })
export class UserEvent extends Listener {	
    public async run(member: GuildMember) {
        const webhook = await this.container.client.fetchWebhook('1056952589868081302').catch(() => null);
        if (!webhook) return;

        return member.user.bot
        ? webhook.send(`<a:hug:864429334009348106>${member.toString()}, Welcome! Oh it's a bot`)
        : webhook.send(stripIndents`
                <a:Hi:765766930761383976> Welcome ${member.toString()}!
                Make sure to read the rules in <#1056555186367242271> and get your roles from <#1056950401770995722>.
                Happy **${this.getDay}!** <a:blobdance:765766933017526283>
            `);
	}
    

    private get getDay(): string {
        const weekday = new Array(7);
        weekday[0] = 'Sunday';
        weekday[1] = 'Monday';
        weekday[2] = 'Tuesday';
        weekday[3] = 'Wednesday';
        weekday[4] = 'Thursday';
        weekday[5] = 'Friday';
        weekday[6] = 'Saturday';

        return weekday[new Date().getDay()];
    }

}
