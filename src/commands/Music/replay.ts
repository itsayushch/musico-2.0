import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import timeString from '../../lib/time-string';

@ApplyOptions<Command.Options>({
    description: 'Reset the progress of the current song.',
})

export class UserCommand extends Command {
    // Register slash and context menu command
    public override registerApplicationCommands(registry: Command.Registry) {
        // Register slash command
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        });
    }

    // Message command
    public async messageRun(message: Message) {
        if (!message.member?.voice || !message.member.voice.channel) {
            return send(message, {
                content: null,
                embeds: [{
                    description: 'You must be connected to a voice channel to use that command!', color: 'RED'
                }]
            });
        }

        const queue = this.container.client.music.queues.get(message.guild!.id);

        const current = await queue.current();
        if (!current) return;

        await queue.player.seek(0);
        const decoded = await this.container.client.music.decode(current.track);
        const embed = new MessageEmbed()
            .setColor(11642864)
            .setAuthor({ name: 'Replaying' })
            .setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`)
            .setDescription(`[${decoded.title}](${decoded.uri}) (${decoded.isStream ? 'Live' : timeString(decoded.length)})`);
        
        return send(message, { embeds: [embed] });
    }

    public async chatInputRun(message: Command.ChatInputInteraction) {
        if (!(message.member as GuildMember)?.voice || !(message.member as GuildMember).voice.channel) {
            return message.reply({
                content: null,
                embeds: [{
                    description: 'You must be connected to a voice channel to use that command!', color: 'RED'
                }]
            });
        }

        const queue = this.container.client.music.queues.get(message.guild!.id);

        const current = await queue.current();
        if (!current) return;

        await queue.player.seek(0);
        const decoded = await this.container.client.music.decode(current.track);
        const embed = new MessageEmbed()
            .setColor(11642864)
            .setAuthor({ name: 'Replaying' })
            .setThumbnail(`https://i.ytimg.com/vi/${decoded.identifier}/hqdefault.jpg`)
            .setDescription(`[${decoded.title}](${decoded.uri}) (${decoded.isStream ? 'Live' : timeString(decoded.length)})`);
        
        return message.reply({ embeds: [embed] });
    }
}