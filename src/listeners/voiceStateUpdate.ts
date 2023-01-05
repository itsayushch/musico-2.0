import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import type { VoiceState } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.VoiceStateUpdate })
export class UserEvent extends Listener {
	private timeout = new Map();

	public run(oldState: VoiceState, newState: VoiceState) {
		if (newState.guild.me!.voice.channel && oldState.guild.me!.voice.channel) {
			const queue = this.container.client.music.queues.get(newState.guild.id);
			if (newState.guild.me!.voice.channel.members.size <= 1) {
				this.leave(queue);
			}
			if (newState.guild.me!.voice.channel.members.size >= 2) {
				this.cancel(queue);
			}
		}
	}

	private leave(queue: any) {
		const timeout = setTimeout(async () => {
			await queue.player.stop();
			await queue.player.destroy();
			await queue.player.leave();
			this.timeout.delete(queue.guildID);
		}, 1000 * 60 * 2);
		this.timeout.set(queue.guildID, timeout);
	}

	private cancel(queue: any) {
		clearTimeout(this.timeout.get(queue.guildID));
		this.timeout.delete(queue.guildID);
	}
}
