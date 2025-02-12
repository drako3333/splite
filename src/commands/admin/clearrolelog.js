const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success} = require('../../utils/emojis.json');
const {oneLine,} = require('common-tags');

module.exports = class clearRoleLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clearrolelog',
            aliases: ['clearrl', 'crl'],
            usage: 'clearrolelog',
            description: oneLine`
        clears the role change log text channel for your server.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['clearrolelog'],
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
        const roleLogId = this.client.db.settings.selectRoleLogId
            .pluck()
            .get(context.guild.id);
        const oldRoleLog =
            context.guild.channels.cache.get(roleLogId) || '`None`';
        const embed = new MessageEmbed()
            .setTitle('Settings: `Logging`')
            .setThumbnail(context.guild.iconURL({dynamic: true}))
            .setDescription(
                `The \`role log\` was successfully cleared. ${success}`
            )
            .setFooter({
                text: this.getUserIdentifier(context.author),
                iconURL: this.getAvatarURL(context.author),
            })
            .setTimestamp();

        // Clear if no args provided
        this.client.db.settings.updateRoleLogId.run(null, context.guild.id);

        const payload = ({
            embeds: [embed.addField('Role Log', `${oldRoleLog} ➔ \`None\``)],
        });

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
