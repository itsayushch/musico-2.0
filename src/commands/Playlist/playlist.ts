import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';

import { PlaylistAdd } from '../../struct/Playlist/add';
import { PlaylistCreate } from '../../struct/Playlist/create';
import { PlaylistDelete } from '../../struct/Playlist/delete';
import { PlaylistInfo } from '../../struct/Playlist/info';
import { PlaylistLoad } from '../../struct/Playlist/load';


@ApplyOptions<Subcommand.Options>({
	aliases: ['pl'],
	description: 'Create playlists of your favourite songs.',
	subcommands: [
		{
			name: 'add',
			messageRun: 'playlistAdd'
		},
		{
			name: 'create',
			messageRun: 'playlistCreate'
		},
		{
			name: 'delete',
			messageRun: 'playlistDelete',
		},
		{
			name: 'start',
			messageRun: 'playlistLoad',
		},
		{
			name: 'info',
			messageRun: 'playlistInfo',
		},
		{
			name: 'show',
			messageRun: 'playlistShow',
			default: true
		}
	]
})

export class UserCommand extends Subcommand {
	public async playlistShow(message: Message) {
		return send(message, 'No!');
	}

	public async playlistCreate(message: Message, args: Args) {
		return await new PlaylistCreate(this.container.client).exec(message, args);
	}

	public async playlistAdd(message: Message, args: Args) {
		return await new PlaylistAdd(this.container.client).exec(message, args);
	}

	public async playlistLoad(message: Message, args: Args) {
		return await new PlaylistLoad(this.container.client).exec(message, args);
	}

	public async playlistDelete(message: Message, args: Args) {
		return await new PlaylistDelete(this.container.client).exec(message, args);
	}

	public async playlistInfo(message: Message, args: Args) {
		return await new PlaylistInfo(this.container.client).exec(message, args);
	}
}