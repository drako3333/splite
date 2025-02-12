const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');

module.exports = class ServerIconCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'servericon',
            aliases: ['icon', 'i', 'serveravatar', 'serverav'],
            usage: 'servericon',
            description: 'Displays the server\'s icon.',
            type: client.types.INFO,
        });
    }

    run(message) {
        const embed = new MessageEmbed()
            .setTitle(`${message.guild.name}'s Icon`)
            .setImage(message.guild.iconURL({dynamic: true, size: 512}))
            .setFooter({
                text: message.member.displayName,
                iconURL: message.author.displayAvatarURL(),
            })
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor);
        message.channel.send({embeds: [embed]});
    }
};
