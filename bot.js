const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
const fs = require('fs');
const commands =  new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const express = require('express');
const app = express();
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./bot.db', (err) => { 
    if(err) process.exit(111)
    else {
        db.exec('create table if not exists servers (id text primary key, channel text)' , (err) => {
            if(err) {
                console.log(err);
                process.exit(222);
            }
        });
    }
});

app.use(express.json());

module.exports = {
    commands,
    db
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

app.post('/callback', (req, res) => {
    console.log(req.body)
    const chall = req.body["hub.challenge"];

    if(chall) {
        res.type('text/plain');
        res.send(chall);
    }else {
        res.end();
    }
});

app.listen(3000, () => {
    console.log('server up')
});

