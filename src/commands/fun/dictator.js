const Command = require('../Command.js');
const {MessageEmbed, MessageAttachment} = require('discord.js');
const {load} = require('../../utils/emojis.json');

module.exports = class dictatorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dictator',

            usage: 'dictator <user mention/id>',
            description: 'Generates a dictator image',
            type: client.types.FUN,
            examples: ['dictator @split'],
        });
    }

    async run(message, args) {
        const member = (await this.getGuildMember(message.guild, args.join(' '))) || message.author;
        await message.channel
            .send({
                embeds: [new MessageEmbed().setDescription(`${load} Loading...`)],
            }).then(msg => {
                message.loadingMessage = msg;
                this.handle(member, message, false);
            });
    }

    async interact(interaction) {
        await interaction.deferReply();
        const member = interaction.options.getUser('user') || interaction.author;
        this.handle(member, interaction, true);
    }

    async handle(targetUser, context, isInteraction) {
        const buffer = await context.client.ameApi.generate('dictator', {
            url: this.getAvatarURL(targetUser, 'png'),
        });
        const attachment = new MessageAttachment(buffer, 'dictator.png');

        if (isInteraction) {
            context.editReply({
                files: [attachment],
            });
        }
        else {
            context.loadingMessage ? context.loadingMessage.edit({
                files: [attachment],
                embeds: []
            }) : context.channel.send({
                files: [attachment],
            });
        }
    }
};
