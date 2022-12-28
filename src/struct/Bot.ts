import '../lib/setup';
import type { ClientOptions } from 'discord.js';
import { SapphireClient } from '@sapphire/framework';
import Music from './Queue';
import { Database } from './Database';
import SettingsProvider from './SettingsProvider';
import type { Db } from 'mongodb';

export class Bot extends SapphireClient {
	public readonly music: Music;
	public db!: Db;
	public settings!: SettingsProvider;

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
			advanceBy: (queue) => {
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
				default:
					break;
			}
		});
	}

	async init() {
		await Database.connect().then(() => this.logger.info('Connected to MongoDB'));
		this.db = Database.db('musico');

		this.settings = new SettingsProvider(this.db);
		await this.settings.init();

		try {
			this.logger.info('Logging in');
			await this.login();
			this.logger.info('logged in');
		} catch (error) {
			this.logger.fatal(error);
			this.destroy();
			process.exit(1);
		}
	}
}

declare module 'discord.js' {
	interface Client {
		readonly music: Music;
		db: Db;
		settings: SettingsProvider;
	}
}
