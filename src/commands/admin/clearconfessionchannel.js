const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class clearconfessionchannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clearconfessionchannel',
            aliases: [
                'clearconfessions',
                'cconfessions',
                'clearconfessionschannel',
            ],
            usage: 'clearconfessionchannel',
            description: oneLine`
        Clears the current \`confessions channel\`.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['clearconfessionchannel'],
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
        const embed = new MessageEmbed()
            .setTitle('Settings: `Confessions`')
            .setThumbnail(context.guild.iconURL({dynamic: true}))
            .setDescription(
                `The \`confessions channel\` was successfully cleared. ${success}`
            )
            .setFooter({
                text: this.getUserIdentifier(context.author),
                iconURL: this.getAvatarURL(context.author),
            })
            .setTimestamp();

        this.client.db.settings.updateConfessionsChannelId.run(
            null,
            context.guild.id
        );

        const payload = {embeds: [embed.addField('Confessions Channel', '`None`')],};

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
