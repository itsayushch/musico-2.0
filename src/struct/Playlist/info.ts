import type { Args, SapphireClient } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';
import moment from 'moment';
import 'moment-duration-format';
export class PlaylistInfo {
    private client: SapphireClient;

    public constructor(client: SapphireClient) {
        this.client = client;
    }
    async exec(message: Message, args: Args) {
        const playlist = await args.pick('playlist').catch(() => null);

        if (!playlist) {
            return send(message, 'A playlist with this name does not exists.');
        }

        const user = await this.client.users.fetch(playlist.user);
        const guild = this.client.guilds.cache.get(playlist.guild);

        const decoded = await this.client.music.decode(playlist.tracks[0]);

        return send(message, { embeds: [{
            color:11642864,
            fields: [
                { name: '❯ Name', value: playlist.name },
                { name: '❯ Description', value: playlist.description ? playlist.description.substring(0, 1020) : 'No description.' },
                { name: '❯ User', value: user ? `${user.tag} (ID: ${user.id})` : 'Couldn\'t fetch user.' },
                { name: '❯ Guild', value: guild ? `${guild.name}` : 'Couldn\'t fetch guild.' },
                { name: '❯ Songs', value: playlist.tracks.length || 'No songs.' },
                { name: '❯ Plays', value: playlist.plays },
                { name: '❯ Created at', value: moment.utc(playlist.createdAt).format('DD/MM/YYYY hh:mm:ss') ?? 'lol' },
            ],
            thumbnail: {
                url: `https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`
            }
        }] });
    }
}