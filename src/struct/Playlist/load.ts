import type { Args, SapphireClient } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { stripIndents } from 'common-tags';
import type { Message, VoiceChannel } from 'discord.js';

export class PlaylistLoad {
    private client: SapphireClient;

    public constructor(client: SapphireClient) {
        this.client = client;
    }
    async exec(message: Message, args: Args) {
        const playlist = await args.pick('playlist').catch(() => null);

        if (!playlist) {
            return send(message, 'A playlist with this name does not exists.');
        }


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

        const queue = this.client.music.queues.get(message.guildId!);

		if (!message.guild?.members.me?.voice.channel) await queue.player.join(message.member.voice.channel.id);
        
        const decoded = await this.client.music.decode(playlist.tracks[0]);
        
        await queue.add(...playlist.tracks);

        const embed = {
            author: {
                name: 'Added to queue'
            },
            color: 11642864,
            description: stripIndents`
            **❯ Playlist**
            ${playlist.name}

            **❯ Total Songs**
            ${playlist.tracks.length}
            `,
            thumbnail: {
                url: `https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`
            }
        };


        if (queue.player.playing === false && queue.player.paused === false) await queue.start();
        playlist.plays += 1;
        await this.client.playlist.plays(playlist.name, playlist.plays);

        return send(message, { embeds: [embed] });
    }
}