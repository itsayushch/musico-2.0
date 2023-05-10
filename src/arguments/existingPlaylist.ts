import type { PieceContext } from '@sapphire/pieces';
import { Argument } from '@sapphire/framework';

export class PlaylistArgument extends Argument<any> {
	public constructor(context: PieceContext) {
		super(context, { name: 'existingPlaylist' });
	}

	public async run(parameter: string, context: Argument.Context): Argument.AsyncResult<any> {

        const guildID = context.message.guildId;
    
        const playlist = await this.container.client.db.collection('playlist').findOne({ name: new RegExp(`^${parameter}$`, 'i'), guild: guildID});
        
        if (playlist) {
            return this.error({
                context,
                parameter,
                message: 'A playlist with this name already exists!',
                identifier: 'InvalidPlaylist'
            });
        }
        
        return this.ok(parameter);

	}

}

