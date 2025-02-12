const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class clearWelcomeChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clearwelcomechannel',
            aliases: ['clearwc', 'cwc', 'cleargreetchannel'],
            usage: 'clearwelcomechannel',
            description: oneLine`
        Clears the welcome message text channel for your server. 
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['clearwelcomechannel'],
        });
    }

    run(message) {
        this.handle(message, false);
    }

    async interact(interaction) {
        await interaction.deferReply();
        this.handle(interaction, true);
    }

    handle(context, isInteraction) {
        let {
            welcome_channel_id: welcomeChannelId,
            welcome_message: welcomeMessage,
        } = this.client.db.settings.selectWelcomes.get(context.guild.id);
        const oldWelcomeChannel =
            context.guild.channels.cache.get(welcomeChannelId) || '`None`';

        // Get status
        const oldStatus = this.client.utils.getStatus(
            welcomeChannelId,
            welcomeMessage
        );

        // Trim message
        if (welcomeMessage && welcomeMessage.length > 1024)
            welcomeMessage = welcomeMessage.slice(0, 1021) + '...';

        const embed = new MessageEmbed()
            .setTitle('Settings: `Welcomes`')
            .setDescription(
                `The \`welcome channel\` was successfully cleared. ${success}`
            )
            .addField(
                'Message',
                this.client.utils.replaceKeywords(welcomeMessage) || '`None`'
            )
            .setThumbnail(context.guild.iconURL({dynamic: true}))
            .setFooter({
                text: context.member.displayName,
                iconURL: context.author.displayAvatarURL(),
            })
            .setTimestamp()
            .setColor(context.guild.me.displayHexColor);

        // Clear if no args provided
        this.client.db.settings.updateWelcomeChannelId.run(
            null,
            context.guild.id
        );

        // Update status
        const status = 'disabled';
        const statusUpdate =
            oldStatus != status
                ? `\`${oldStatus}\` ➔ \`${status}\``
                : `\`${oldStatus}\``;

        const payload = {
            embeds: [embed
                .spliceFields(0, 0, {
                    name: 'Channel',
                    value: `${oldWelcomeChannel} ➔ \`None\``,
                    inline: true,
                })
                .spliceFields(1, 0, {
                    name: 'Status',
                    value: statusUpdate,
                    inline: true,
                }),],
        };

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
