import '../lib/setup';
import type { ClientOptions } from 'discord.js'
import { SapphireClient } from '@sapphire/framework';
import Music from './Queue';

export class Bot extends SapphireClient {
    readonly music: Music;
    constructor(args: ClientOptions) {
        super(args);

        this.music = new Music({
            userID: process.env.ID!,
            password: process.env.LAVA_PASS!,
            hosts: {
				rest: process.env.LAVA_REST,
				ws: process.env.LAVA_WS
			},
            send: async (guild, packet): Promise<void> => {
                const shardGuild = this.guilds.cache.get(guild);
                if (shardGuild) return shardGuild.shard.send(packet);
                return Promise.resolve();
            },
            advanceBy: queue => {
                if (queue.looping()) return 0;
                return 1;
            }
        });

		this.on('raw', async (packet: any) => {
			switch (packet.t) {
				case 'VOICE_STATE_UPDATE':
					if (packet.d.user_id !== process.env.ID) return;
					this.music.voiceStateUpdate(packet.d);
					break;
				case 'VOICE_SERVER_UPDATE':
					this.music.voiceServerUpdate(packet.d);
					break;
				default: break;
			}
		});
    }
}

declare module "discord.js" {
    interface Client {
        readonly music: Music
    }
}
