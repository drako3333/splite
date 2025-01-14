const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success, fail} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class SetStarboardChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setstarboardchannel',
            aliases: ['setstc', 'sstc'],
            usage: 'setstarboardchannel <channel mention/ID>',
            description: oneLine`
        Sets the starboard text channel for your server.
        \nUse \`clearstarboardchannel\` to clear the current \`starboard channel\`.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['setstarboardchannel #starboard', 'clearstarboardchannel'],
        });
    }

    run(message, args) {
        this.handle(args.join(' '), message, false);
    }

    async interact(interaction) {
        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        this.handle(channel, interaction, true);
    }

    handle(channel, context, isInteraction) {
        const starboardChannelId = this.client.db.settings.selectStarboardChannelId.pluck().get(context.guild.id);
        const oldStarboardChannel = context.guild.channels.cache.get(starboardChannelId) || '`None`';
        const embed = new MessageEmbed()
            .setTitle('Settings: `Starboard`')
            .setThumbnail(context.guild.iconURL({dynamic: true}))

            .setFooter({
                text: context.member.displayName,
                iconURL: context.author.displayAvatarURL(),
            })
            .setTimestamp();

        // Show current starboard channel
        if (!channel) {
            return context.channel.send({
                embeds: [
                    embed
                        .addField(
                            'Current Starboard Channel',
                            `${oldStarboardChannel}`
                        )
                        .setDescription(this.description),
                ],
            });
        }

        channel = isInteraction ? channel : this.getChannelFromMention(context, channel) || context.guild.channels.cache.get(channel);

        if (!channel || (channel.type != 'GUILD_TEXT' && channel.type != 'GUILD_NEWS') || !channel.viewable) {
            const payload = `${fail} I can't find that channel.`;
            if (isInteraction) context.editReply(payload);
            else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
            return;
        }

        this.client.db.settings.updateStarboardChannelId.run(channel.id, context.guild.id);

        const payload = ({
            embeds: [
                embed.addField(
                    'Starboard Channel',
                    `${oldStarboardChannel} ➔ ${channel}`
                ).setDescription(
                    `The \`starboard channel\` was successfully updated. ${success}\nUse \`clearstarboardchannel\` to clear the current \`starboard channel\``
                ),
            ],
        });

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
