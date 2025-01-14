const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const {success, fail} = require('../../utils/emojis.json');
const {oneLine} = require('common-tags');

module.exports = class ToggleCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'togglecommand',
            aliases: ['togglec', 'togc', 'tc', 'disable', 'enable', 'toggle'],
            usage: 'togglecommand <command>',
            description: oneLine`
        Enables or disables the provided command. 
        Disabled commands will no longer be able to be used, and will no longer show up with the \`help\` command.
        \`${client.utils.capitalize(
        client.types.ADMIN
    )}\` commands cannot be disabled.
      `,
            type: client.types.ADMIN,
            userPermissions: ['MANAGE_GUILD'],
            examples: ['togglecommand ping'],
        });
    }

    run(message, args) {
        this.handle(args[0], message, false);
    }

    async interact(interaction) {
        await interaction.deferReply();
        const commandName = interaction.options.getString('command');
        this.handle(commandName, interaction, true);
    }

    handle(commandName, context, isInteraction) {
        const {ADMIN, OWNER} = this.client.types;

        const command = this.client.commands.get(commandName) || this.client.aliases.get(commandName);

        if (!command || (command && command.type == OWNER)) {
            const validCommands = this.client.commands.filter(c => c.type != OWNER && c.type != ADMIN).map(c => c.name);

            const payload = {
                embeds: [new MessageEmbed()
                    .setTitle('Invalid command')
                    .setDescription(`${fail} Please provide a valid command. Valid commands are: \`${validCommands.join('`, `')}\``)
                ]
            };

            if (isInteraction) context.editReply(payload);
            else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
            return;
        }

        const {capitalize} = this.client.utils;

        if (command.type === ADMIN) {
            const payload = {
                embeds: [new MessageEmbed()
                    .setTitle('Invalid command')
                    .setDescription(`${fail} ${capitalize(ADMIN)} commands cannot be disabled`)
                ]
            };

            if (isInteraction) context.editReply(payload);
            else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
            return;
        }

        let disabledCommands = this.client.db.settings.selectDisabledCommands.pluck().get(context.guild.id) || [];
        if (typeof disabledCommands === 'string') disabledCommands = disabledCommands.split(' ');

        let description;

        // Disable command
        if (!disabledCommands.includes(command.name)) {
            disabledCommands.push(command.name); // Add to array if not present
            description = `The \`${command.name}\` command has been successfully **disabled**. ${fail}`;
        }
        // Enable command
        else {
            this.client.utils.removeElement(disabledCommands, command.name);
            description = `The \`${command.name}\` command has been successfully **enabled**. ${success}`;
        }

        this.client.db.settings.updateDisabledCommands.run(
            disabledCommands.join(' '),
            context.guild.id
        );

        disabledCommands = disabledCommands.map((c) => `\`${c}\``).join(' ') || '`None`';
        const payload = new MessageEmbed()
            .setTitle('Settings: `System`')
            .setThumbnail(context.guild.iconURL({dynamic: true}))
            .setDescription(description)
            .addField('Disabled Commands', disabledCommands, true)
            .setFooter({
                text: context.member.displayName,
                iconURL: context.author.displayAvatarURL(),
            })
            .setTimestamp()
            .setColor(context.guild.me.displayHexColor);

        if (isInteraction) context.editReply(payload);
        else context.loadingMessage ? context.loadingMessage.edit(payload) : context.reply(payload);
    }
};
