const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class clearAutoRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clearautorole',
            aliases: ['clearaur', 'caur'],
            usage: 'clearautorole',
            description: oneLine`
        clears the current \`auto role\`.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['clearautorole'],
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
        const autoRoleId = this.client.db.settings.selectAutoRoleId
            .pluck()
            .get(context.guild.id);
        const oldAutoRole =
            context.guild.roles.cache.find((r) => r.id === autoRoleId) || '`None`';

        const embed = new MessageEmbed()
            .setTitle('Settings: `System`')
            .setThumbnail(context?.guild?.iconURL({dynamic: true}))
            .setDescription(
                `The \`auto role\` was successfully cleared. ${success}`
            )
            .setFooter({
                text: this.getUserIdentifier(context.author),
                iconURL: this.getAvatarURL(context.author),
            })
            .setTimestamp()
            .setColor(context.guild.me.displayHexColor);

        this.client.db.settings.updateAutoRoleId.run(null, context.guild.id);

        const payload = {embeds: [embed.addField('Auto Role', `${oldAutoRole}`)],};

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
