import './lib/setup';
import { LogLevel } from '@sapphire/framework';
import { Bot } from './struct/Bot';

const client = new Bot({
	defaultPrefix: ';',
	regexPrefix: /^(hey +)?musico[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	],
	partials: ['CHANNEL'],
	loadMessageCommandListeners: true
});

client.init();
