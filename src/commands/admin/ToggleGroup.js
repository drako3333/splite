const Command = require('../Command.js');
const {SlashCommandBuilder} = require('@discordjs/builders');

const commandMappings = {
    anonymous: 'toggleanonymous',
    command: 'togglecommand',
    category: 'togglecategory',
};

module.exports = class ToggleSettingsCommandGroup extends Command {
    constructor(client) {
        super(client, {
            name: 'toggle-settings',
            description: 'Toggle Management - Toggle various features on and off',
            type: client.types.ADMIN,
            slashCommand: new SlashCommandBuilder().setName('toggle')
                .addSubcommand((o) => o.setName('anonymous').setDescription('Toggle the anonymous feature - Let users anonymously post messages'))
                .addSubcommand((o) => o.setName('command').setDescription('Toggle on/off any command').addStringOption(p => p.setName('command').setRequired(true).setDescription('The command to toggle - Use the help command to see all commands')))
                .addSubcommand((o) => o.setName('category').setDescription('Toggle on/off any command category.').addStringOption(p => p.setName('category').setRequired(true).setDescription('The category to toggle - Use the help command to see all categories')))
        });
    }

    interact(interaction) {
        const command = this.client.commands.get(commandMappings[interaction.options.getSubcommand()]);
        if (command) {
            command.interact(interaction);
        }
        else {
            interaction.reply('Invalid command - Potential mapping error');
        }
    }
};
