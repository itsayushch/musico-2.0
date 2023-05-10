import type { Message } from 'discord.js';
import type { Db, Collection } from 'mongodb';

export class PlaylistHandler {
	protected database: Collection;

	public constructor(database: Db) {
		this.database = database.collection('playlist');
	}

	// 	For creating a playlist
	async create(message: Message, name: string, info?: string | null) {
		const pl = await this.database
			.insertOne({
				name,
				guild: message.guildId,
				user: message.author.id,
				description: info ? info : null,
				plays: 0,
				createdAt: new Date(),
				tracks: []
			});
		return pl;
	}

	// 	For adding a track to the playlist
	async add(message: Message, name: string, track: string[]) {
		const pladd = await this.database
			.updateOne({
				name,
				guild: message.guildId,
				user: message.author.id
			},
			{ $push: { tracks: { $each: track } } },
			{ upsert: true });
		return pladd;
	}

	// 	For editing the playlist plays
	async plays(name: string, plays: string) {
		const plplays = await this.database
			.updateOne({
				name
			},
			{ $set: { plays } },
			{ upsert: true });
		return plplays;
	}

	// 	For editing the playlist's description
	async editdesc(name: string, description: string) {
		const pledit = await this.database
			.updateOne({
				name
			},
			{ $set: { description } },
			{ upsert: true });
		return pledit;
	}

	// 	For editing the playlist's name
	async editname(name: string, newname: string) {
		const pledit = await this.database
			.updateOne({ name }, {
				$set: {
					name: newname
				}
			},
			{ upsert: true });
		return pledit;
	}

	// 	For deleting the playlist
	async remove(name: string) {
		const pldel = await this.database
			.findOneAndDelete({ name });
		return pldel;
	}

	// 	For removing a song from the playlist
	async removesong(name: string, track: string) {
		const plrm = await this.database
			.updateOne({
				name
			},
			{ $set: { tracks: track } },
			{ upsert: true });
		return plrm;
	}
};