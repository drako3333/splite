const Command = require('../Command.js');
const {MessageEmbed} = require('discord.js');
const moment = require('moment');
const {mem, cpu, os} = require('node-os-utils');
const {stripIndent} = require('common-tags');
const emojis = require('../../utils/emojis.json');

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: ['statistics', 'metrics'],
            usage: 'stats',
            description: `Fetches ${client.name}'s statistics.`,
            type: client.types.INFO,
        });
    }

    async run(message) {
        const d = moment.duration(message.client.uptime);
        const days = d.days() === 1 ? `${d.days()} day` : `${d.days()} days`;
        const hours = d.hours() === 1 ? `${d.hours()} hour` : `${d.hours()} hours`;
        const clientStats = stripIndent`
      Servers   :: ${message.client.guilds.cache.size}
      Users     :: ${message.client.users.cache.size}
      Channels  :: ${message.client.channels.cache.size}
      WS Ping   :: ${Math.round(message.client.ws.ping)}ms
      Uptime    :: ${days} and ${hours}
    `;
        const {totalMemMb, usedMemMb} = await mem.info();
        const serverStats = stripIndent`
      OS        :: ${await os.oos()}
      CPU       :: ${cpu.model()}
      Cores     :: ${cpu.count()}
      CPU Usage :: ${await cpu.usage()} %
      RAM       :: ${totalMemMb} MB
      RAM Usage :: ${usedMemMb} MB 
    `;
        const embed = new MessageEmbed()
            .setTitle(`${message.client.name}'s Statistics`)
            .addField(
                'Commands',
                `\`${message.client.commands.size}\` commands`,
                true
            )
            .addField(
                'Aliases',
                `\`${message.client.aliases.size}\` aliases`,
                true
            )
            .addField(
                'Command Types',
                `\`${Object.keys(message.client.types).length}\` command types`,
                true
            )
            .addField('Client', `\`\`\`asciidoc\n${clientStats}\`\`\``)
            .addField('Server', `\`\`\`asciidoc\n${serverStats}\`\`\``)
            .addField(
                '**Links**',
                `**[Invite Me](${message.client.config.inviteLink})**`
            )
            .setFooter({
                text: message.member.displayName,
                iconURL: message.author.displayAvatarURL(),
            })
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor);

        if (this.client.owners?.length > 0) {
            embed.addField('Developed By', `${this.client.owners[0]}`);
            if (this.client.owners.length > 1)
                embed.addField(`${emojis.owner} Bot Owner${this.client.owners.length > 1 ? 's' : ''}`, this.client.owners.join(', '));
        }
        if (this.client.managers?.length > 0) {
            embed.addField(`${emojis.manager} Bot Manager${this.client.managers.length > 1 ? 's' : ''}`, this.client.managers.join(', '));
        }

        message.channel.send({embeds: [embed]});
    }
};
