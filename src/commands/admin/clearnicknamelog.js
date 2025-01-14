const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class clearNicknameLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clearnicknamelog',
            aliases: ['clearnnl', 'cnnl'],
            usage: 'clearnicknamelog',
            description: oneLine`
        clears the nickname change log text channel for your server.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['clearnicknamelog'],
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
        const nicknameLogId = this.client.db.settings.selectNicknameLogId
            .pluck()
            .get(context.guild.id);
        const oldNicknameLog =
            context.guild.channels.cache.get(nicknameLogId) || '`None`';
        const embed = new MessageEmbed()
            .setTitle('Settings: `Logging`')
            .setThumbnail(context.guild.iconURL({dynamic: true}))
            .setDescription(
                `The \`nickname log\` was successfully cleared. ${success}`
            )
            .setFooter({
                text: this.getUserIdentifier(context.author),
                iconURL: this.getAvatarURL(context.author),
            })
            .setTimestamp();

        // Clear if no args provided
        this.client.db.settings.updateNicknameLogId.run(
            null,
            context.guild.id
        );

        const payload = {embeds: [embed.addField('Nickname Log', `${oldNicknameLog} ➔ \`None\``),],};

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
