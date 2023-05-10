import type { Args, SapphireClient } from "@sapphire/framework";
import timeString from "../../lib/time-string";
import type { Message } from "discord.js";

import path from 'path';
import url from 'url';
import { send } from "@sapphire/plugin-editable-commands";

export class PlaylistAdd {
    private client: SapphireClient;

    public constructor(client: SapphireClient) {
        this.client = client;
    }
    
    async exec(message: Message, args: Args) {
        const playlist = await args.pick('playlist').catch(() => null);
        let query = await args.rest('string').catch(() => null);

        if (!playlist) {
            return send(message, 'Playlist with this name does not exists!');
        }

        if (playlist.user !== message.author.id) {
            return send(message, {
                embeds: [{ description: 'You can only add songs to your own playlists!', color: 3093046 }]
            });
        }

        if (!query && message.attachments.first()) {
            query = message.attachments.first()!.url;
            // @ts-expect-error
            if (!['.mp3', '.ogg', '.flac', '.m4a'].includes(path.parse(url.parse(query).path).ext)) return;
        } else if (!query) {
            return;
        }
        // @ts-expect-error
        if (!['http:', 'https:'].includes(url.parse(query).protocol)) query = `ytsearch:${query}`;

        const res = await this.client.music.load(query);
        let embed;
        if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
            await this.client.playlist.add(message, playlist.name, [res.tracks[0].track]);

            embed = {
                author: {
                    name: `Added to ${playlist.name.replace(/\b(\w)/g, (char: string) => char.toUpperCase())}`
                },
                color: 11642864,
                thumbnail: {
                    url: `https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`
                },
                description: `[${res.tracks[0].info.title}](${res.tracks[0].info.uri}) (${res.tracks[0].info.isStream ? 'Live' : timeString(res.tracks[0].info.length)})`
            };
        } else if (res.loadType === 'PLAYLIST_LOADED') {
            await this.client.playlist.add(message, playlist.name, res.tracks.map(track => track.track));
            embed = {
                author: {
                    name: `Added to ${playlist.name.replace(/\b(\w)/g, (char: string) => char.toUpperCase())}`
                },
                color: 11642864,
                description: res.playlistInfo.name,
                thumbnail: {
                    url: `https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`
                }
            };
        } else if (res.loadType === 'LOAD_FAILED') {
            embed = {
                color: 'RED',
                description: 'No results found!'
            }
        } else {
            return send(message, { embeds: [{ description: 'I couldn\'t find What you were looking for!', color: 0xFF0000 }] });
        }

        return send(message, {
            // @ts-expect-error
            embeds: [embed]
        });
    }
}