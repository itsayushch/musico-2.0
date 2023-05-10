import type { Args, SapphireClient } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";

export class PlaylistCreate {
    private client: SapphireClient;

    public constructor(client: SapphireClient) {
        this.client = client;
    }
    async exec(message: Message, args: Args) {
        const name = await args.pick('existingPlaylist').catch(() => null);
        const info = await args.rest('string').catch(() => null);

        if (!name) {
            return send(message, 'A playlist with this name already exists.');
        }

        await this.client.playlist.create(message, name, info);

        return send(message, {
            embeds: [{
                color: 11642864,
                description: `Successfully created **${name}**.`
            }]
        });
    }
}