import type { GuildMember } from 'discord.js';
import type { Collection, Db } from 'mongodb';

export class LevelProvider {
	private database: Collection;
	private cached = new Set();

	constructor(database: Db) {
		this.database = database.collection('levels');
	}

	public getLevelExp(level: number) {
		return 5 * Math.pow(level, 2) + 50 * level + 100;
	}

	public static randomInt(low: number, high: number) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}

	public getLevelFromExp(exp: number) {
		let level = 0;

		while (exp >= this.getLevelExp(level)) {
			exp -= this.getLevelExp(level);
			level++;
		}

		return level;
	}

	public getLevelProgress(exp: number) {
		let level = 0;

		while (exp >= this.getLevelExp(level)) {
			exp -= this.getLevelExp(level);
			level++;
		}

		return exp;
	}

	public async getLeaderboard() {
		const members = await this.database.find().toArray();
		return members.sort((a, b) => b.exp - a.exp);
	}

	public async getGuildMemberExp(member: GuildMember) {
		const data = await this.database.findOne({
			user: member.id
		});
		return data ? data.exp : 0;
	}

	async setGuildMemberExp(member: GuildMember, exp: number) {
		const data = await this.database.updateOne(
			{ user: member.id },
			{
				$set: { exp }
			},
			{ upsert: true }
		);

		return data;
	}

	async giveGuildUserExp(member: GuildMember) {
		if (this.cached.has(member.id)) return;

		this.cached.add(member.id);
		const oldExp = await this.getGuildMemberExp(member);
		const newExp = oldExp + LevelProvider.randomInt(15, 25);

		await this.setGuildMemberExp(member, newExp);

		// if (oldLvl !== newLvl) {
		// 	await send(message, `Congratulations ${message.author.toString()}! You leveled up to level **${newLvl}**!`);
		// }

		await this.sleep(45000);
		this.cached.delete(member.id);
	}

	private async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
