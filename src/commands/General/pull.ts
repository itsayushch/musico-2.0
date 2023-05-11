import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';
import shell from 'shelljs';

@ApplyOptions<Command.Options>({
    aliases: ['pull'],
    description: 'GitPull',
    preconditions: ['OwnerOnly'],
})

export class GitPullComamnd extends Command {
    public async messageRun(message: Message) {
        const { stdout, stderr } = shell.exec('git pull');
        await shell.exec('npm install');
        return send(message, {
            content: [
                '```js',
                `${stdout}`,
                `${stderr}`,
                '```'
            ].join('\n')
        })
    }
}