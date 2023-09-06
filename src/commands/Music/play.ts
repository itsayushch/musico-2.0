import path from 'path';
import url from 'url';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import timeString from '../../lib/time-string';
import { AttachmentBuilder, type GuildMember, type Message, type VoiceChannel } from 'discord.js';
import { musicCard } from 'musicard';

@ApplyOptions<Command.Options>({
	aliases: ['p'],
	description: 'Play a song from literally any source you can think of.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('query').setDescription('Name/URL of the song').setRequired(true))
		);
	}

	// Message command
	public async messageRun(message: Message, args: Args) {
		let query = await args.rest('string').catch(() => null);

		if (!message.member?.voice || !message.member.voice.channel) {
			return send(message, {
				embeds: [
					{
						description: 'You must be connected to a voice channel to use that command!',
						color: 0xff0000
					}
				]
			});
		} else if (!message.member?.voice.channel.joinable) {
			return send(message, {
				embeds: [
					{
						description: "I don't have permission to **connect** to this voice channel!",
						color: 0xff0000
					}
				]
			});
		} else if (!(message.member.voice.channel as VoiceChannel).speakable) {
			return send(message, {
				embeds: [
					{
						description: "I don't have permission to **stream** in this voice channel!",
						color: 0xff0000
					}
				]
			});
		}

		if (!query && message.attachments.first()) {
			query = message.attachments.first()!.url;
			// @ts-expect-error
			if (!['.mp3', '.ogg', '.flac', '.m4a'].includes(path.parse(url.parse(query).path).ext)) return;
		} else if (!query) {
			return send(message, {
				embeds: [
					{
						description: 'You need to enter a song for me to play',
						color: 0xff0000
					}
				]
			});
		}

		// @ts-expect-error
		if (!['http:', 'https:'].includes(url.parse(query).protocol)) query = `ytsearch:${query}`;

		const res = await this.container.client.music.load(query);

		console.log(res);

		const queue = this.container.client.music.queues.get(message.guild!.id);

		if (!message.guild?.members.me?.voice.channel) await queue.player.join(message.member.voice.channel.id);

		let embed;

		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			await queue.add(res.tracks[0].track);

			const card = new musicCard()
				.setName(res.tracks[0].info.title)
				.setAuthor(res.tracks[0].info.author)
				.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
				.setBrightness(50)
				.setThumbnail(`https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`)
				.setProgress(0)
				.setStartTime("0:00")
				.setEndTime(`${res.tracks[0].info.isStream ? 'Live' : timeString(res.tracks[0].info.length)}`)

			const img = await card.build();
			const attachment = new AttachmentBuilder(img, { name: 'song.png' });

			if (queue.player.playing === false && queue.player.paused === false) await queue.start();

			return send(message, {
				files: [attachment]
			});

		} else if (res.loadType === 'PLAYLIST_LOADED') {
			await queue.add(...res.tracks.map((track) => track.track));

			const card = new musicCard()
				.setName(res.tracks[0].info.title)
				.setAuthor(res.tracks[0].info.author)
				.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
				.setBrightness(50)
				.setThumbnail(`https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`)
				.setProgress(0)
				.setStartTime("0:00")
				.setEndTime(`${res.tracks[0].info.isStream ? 'Live' : timeString(res.tracks[0].info.length)}`)

			const img = await card.build();
			const attachment = new AttachmentBuilder(img, { name: 'song.png' });

			const totalLength = res.tracks.filter((track) => !track.info.isStream).reduce((prev, song) => prev + song.info.length, 0) - 1;

			if (queue.player.playing === false && queue.player.paused === false) await queue.start();

			return send(message, {
				files: [attachment],
				content: `## _Added __${totalLength}__ songs more!_`
			});
		} else if (res.loadType === 'LOAD_FAILED') {
			embed = {
				color: 0xff0000,
				// @ts-expect-error
				description: `**${res.exception.message}**`,
				thumbnail: {
					url: this.container.client.user?.avatarURL()
				}
			};
		} else if (res.loadType === 'NO_MATCHES') {
			return send(message, {
				embeds: [
					{
						description: 'No results found!',
						color: 0xff0000
					}
				]
			});
		} else {
			return send(message, {
				embeds: [
					{
						description: 'No results found!',
						color: 0xff0000
					}
				]
			});
		}

		return send(message, {
			// @ts-expect-error
			embeds: [embed]
		});
	}

	// slash command below
	public async chatInputRun(message: Command.ChatInputCommandInteraction) {
		let query = message.options.getString('query');
		const member = message.member as GuildMember;

		if (!member.voice || !member.voice.channel) {
			return message.reply({
				embeds: [
					{
						description: 'You must be connected to a voice channel to use that command!',
						color: 0xff0000
					}
				]
			});
		} else if (!member?.voice.channel.joinable) {
			return message.reply({
				embeds: [
					{
						description: "I don't have permission to **connect** to this voice channel!",
						color: 0xff0000
					}
				]
			});
		} else if (!(member.voice.channel as VoiceChannel).speakable) {
			return message.reply({
				embeds: [
					{
						description: "I don't have permission to **stream** in this voice channel!",
						color: 0xff0000
					}
				]
			});
		}

		if (!query) {
			return message.reply({
				embeds: [
					{
						description: 'You need to enter a song for me to play',
						color: 0xff0000
					}
				]
			});
		}

		// @ts-expect-error
		if (!['http:', 'https:'].includes(url.parse(query).protocol)) query = `ytsearch:${query}`;

		const res = await this.container.client.music.load(query);

		const queue = this.container.client.music.queues.get(message.guild!.id);

		if (!message.guild?.members.me?.voice.channel) await queue.player.join(member.voice.channel.id);

		let embed;

		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			await queue.add(res.tracks[0].track);

			const card = new musicCard()
				.setName(res.tracks[0].info.title)
				.setAuthor(res.tracks[0].info.author)
				.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
				.setBrightness(50)
				.setThumbnail(`https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`)
				.setProgress(0)
				.setStartTime("0:00")
				.setEndTime(`${res.tracks[0].info.isStream ? 'Live' : timeString(res.tracks[0].info.length)}`)

			const img = await card.build();
			const attachment = new AttachmentBuilder(img, { name: 'song.png' });
			if (queue.player.playing === false && queue.player.paused === false) await queue.start();

			return message.reply({
				files: [attachment]
			});

		} else if (res.loadType === 'PLAYLIST_LOADED') {
			await queue.add(...res.tracks.map((track) => track.track));

			const card = new musicCard()
				.setName(res.tracks[0].info.title)
				.setAuthor(res.tracks[0].info.author)
				.setColor("auto") // or hex color without # (default: auto) (auto: dominant color from thumbnail)
				.setBrightness(50)
				.setThumbnail(`https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`)
				.setProgress(0)
				.setStartTime("0:00")
				.setEndTime(`${res.tracks[0].info.isStream ? 'Live' : timeString(res.tracks[0].info.length)}`)

			const img = await card.build();
			const attachment = new AttachmentBuilder(img, { name: 'song.png' });

			const totalLength = res.tracks.filter((track) => !track.info.isStream).reduce((prev, song) => prev + song.info.length, 0) - 1;
			if (queue.player.playing === false && queue.player.paused === false) await queue.start();

			return message.reply({
				files: [attachment],
				content: `## _Added __${totalLength}__ songs more!_`
			});
		} else if (res.loadType === 'LOAD_FAILED') {
			embed = {
				color: 0xff0000,
				// @ts-expect-error
				description: `**${res.exception.message}**`,
				thumbnail: {
					url: this.container.client.user?.avatarURL()
				}
			};
		} else if (res.loadType === 'NO_MATCHES') {
			return message.reply({
				embeds: [
					{
						description: 'No results found!',
						color: 0xff0000
					}
				]
			});
		} else {
			return message.reply({
				embeds: [
					{
						description: 'No results found!',
						color: 0xff0000
					}
				]
			});
		}

		if (queue.player.playing === false && queue.player.paused === false) await queue.start();

		return message.reply({
			// @ts-expect-error
			embeds: [embed]
		});
	}
}
