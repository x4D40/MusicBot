const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
const fs = require('fs');
const commands =  new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

module.exports = {
    commands
}

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

client.on('message', async msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    const cmd = commands.get(command);
    if(cmd){
        cmd.execute(msg, args);
    }else{
        msg.channel.send(`Command not found. Type ${prefix}help for help.`);
    }

    
});

client.on('ready', () => {
    console.log('ready');
    client.user.setPresence({
        activity: {
            name: '!help'
        },
        status: 'online'
    });
});

client.login(token);