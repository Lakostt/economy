const Discord = require('discord.js');
const economy = require('discord-eco');
const fs = require('fs');

const client = new Discord.Client();
const modRole = 'root';
client.login('NDI4NjI0MDY2MDQ0MjMxNjgw.DZ1yyA.Iho3mmHt6ce7KhW8dwC7BjkKt_U');

client.on('ready', () =>
{
    console.log('Economy Launched...');
    client.user.setStatus('dnd');
    client.user.setActivity('пздц ебнутый код');
});
// JSON
const items = JSON.parse(fs.readFileSync('items.json', 'utf8'));

client.on('message', message  =>{

    // Varriables
    let prefix = '<';
    let msg = message.content.toUpperCase();
    let cont = message.content.slice(prefix.length).split(" ");
    let args = cont.slice(1);

    // Commands
    if(message.content.toUpperCase() === `${prefix}PING`) {
        message.channel.send('Pong ' + client.ping);
    }

    // Commands end

    // Buy Command - You can buy items with this.
    if (msg.startsWith(`${prefix}BUY`)) {

        // Variables
        let categories = []; //

        //
        if (!args.join(" ")) {
            for (var i in items) {
                if (!categories.includes(items[i].type)) {
                    categories.push(items[i].type)
                }

            }

            const embed = new Discord.RichEmbed()
                .setDescription(`Available Items`)
                .setColor(0xD4AF37)

            for (var i = 0; i < categories.length; i++) {

                var tempDesc = '';

                for (var c in items) {
                    if (categories[i] === items[c].type) {

                        tempDesc += `${items[c].name} - $${items[c].price} - ${items[c].desc}\n`;

                    }

                }
                embed.addField(categories[i], tempDesc);

            }

            return message.channel.send({
                embed
            });
        }

        // Item Info
        let itemName = '';
        let itemPrice = 0;
        let itemDesc = '';

        for (var i in items) {
            if (args.join(" ").trim().toUpperCase() === items[i].name.toUpperCase()) {
                itemName = items[i].name;
                itemPrice = items[i].price;
                itemDesc = items[i].desc;
            }
        }

        if (itemName === '') {
            return message.channel.send(`**Item ${args.join(" ").trim()} not found.**`)
        }

        economy.fetchBalance(message.author.id + message.guild.id).then((i) => {
            if (i.money <= itemPrice) {

                return message.channel.send(`**You don't have enough money for this item.**`);
            }

            economy.updateBalance(message.author.id + message.guild.id, parseInt(`-${itemPrice}`)).then((i) => {

                message.channel.send('**You bought ' + itemName + '!**');

                if (itemName === 'Helper Role') {
                    message.guild.members.get(message.author.id).addRole(message.guild.roles.find("name", "Helper"));
                }

            })

        })

    }

    // Balance / Money

    if(msg === `${prefix}BALANCE` || msg === `${prefix}MONEY`) {
        economy.fetchBalance(message.author.id).then((i) => {
            const embed = new Discord.RichEmbed()
            .setDescription(`**${message.guild.name} Bank**`)
            .setColor(0x8bff00)
            .addField('Account Holder', message.author.username, true)
            .addField('Account Tokens', i.money, true)

            message.channel.send({embed});
        });
    }
    // Settoken [root only]
    if(msg.startsWith(`${prefix}SETTOKEN`))
    {
        if (!message.member.roles.find('name', modRole)) {
            message.channel.send('You need tehe role `' + modRole + '` to use this command');
            return;
        }
        if (!args[0]) {
            message.channel.send(`You need to define an amount. Usage: ${prefix}settoken <amount> <user>`);
            return;
        }
        if(isNaN(args[0])) {
            message.channel.send(`The ammount has to be a number. Usage: ${prefix}settoken <amount> <user>`);
            return;
        }
        let defineduser = '';
        if (!args[1]) {
            defineduser = message.author.id;
        } else {
            let firstMentioned = message.mentions.users.first();
            defineduser = firstMentioned.id;
        }
        economy.updateBalance(defineduser, parseInt(args[0])).then((i) => {
            message.channel.send(`User defined had ${args[0]} added/subtraction from their account.`);
        });

    }
});