import '../lib/setup';
import "@lavaclient/queue/register";
import type { ClientOptions } from 'discord.js'
import { SapphireClient } from '@sapphire/framework';
import { Node } from "lavaclient";

export class Bot extends SapphireClient {
    readonly music: Node;
    constructor(args: ClientOptions) {
        super(args);

        this.music = new Node({
            sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
            connection: {
                host: process.env.LAVA_HOST!,
                password: process.env.LAVA_PASS!,
                port: Number(process.env.LAVA_PORT ?? 443)
            }
        });

        this.ws.on("VOICE_SERVER_UPDATE", data => this.music.handleVoiceUpdate(data));
        this.ws.on("VOICE_STATE_UPDATE", data => this.music.handleVoiceUpdate(data));
    }
}

declare module "discord.js" {
    interface Client {
        readonly music: Node
    }
}