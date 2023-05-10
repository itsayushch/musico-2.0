import type { Args, SapphireClient } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";

export class PlaylistDelete {
    private client: SapphireClient;

    public constructor(client: SapphireClient) {
        this.client = client;
    }
    async exec(message: Message, args: Args) {
        const playlist = await args.pick('playlist').catch(() => null);

        if (!playlist) {
            return send(message, 'A playlist with this name does not exists.');
        }

        await this.client.playlist.remove(playlist.name);
        return send(message, {
            embeds: [{
                color: 11642864,
                description: `Successfully delted **${playlist.name}**.`
            }]
        });
    }
}