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

        db.exec('create table if not exists alerts (server_id text, streamer_id text, valid integer, primary key(server_id, streamer_id))' , (err) => {
            if(err) {
                console.log(err);
                process.exit(333);
            }
        });

        db.exec('create table if not exists streams (id text primary key, name text)', err => {
            if(err) {
                console.log(err);
                process.exit(444);
            }
        })
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

app.get('/callback', (req, res) => {
    const chall = req.query["hub.challenge"];

    if(!req.query["hub.topic"]) {
        res.end();
    }

    const id = req.query["hub.topic"].split('=')[1];

    // call db to get the channel
    if(chall) {
        //  mark the alerts table as 1 for all entries where streamerid is found in the request, send to channel its setup
        console.log('yes');
        res.type('text/plain');
        res.send(chall);

        // get the channel and server id for the webhook if they are waiting on webhook confirm
        db.all('select server_id, channel from alerts, servers where streamer_id = ? and valid = 0 and server_id=id', id, (err, res) => {
            if(!err){

                db.run('update alerts set valid = 1 where streamer_id = ?', id, (err) => {
                    if(!err) {
                        console.log('from database ->', res) // todo loop over these channels and sent message that it is good
                        res.forEach(entry => {

                            const guild = client.guilds.resolve(entry.server_id);
                            const channel = guild.channels.resolve(entry.channel);

                            channel.send(`Stream configured.`)
                        });
                    }else {
                        console.log('update alerts error', err)
                    }
                })

            }else{
                console.log('finding server error:', err);
            }
        })

    } else {
        // cant send message back, assume failed
        console.log('no', req);
        res.end();
    }
});

app.post('/callback', (req, res) => {
    // body will have the user id, and username, get all guild channels where the user id was found, and send them a message
    console.log('webhook ->', req.body.data);


    if(req.body.data[0]) {
        const id = req.body.data[0].user_id;
        const name = req.body.data[0].user_name;

        // select all of the alert channels
        db.all('select server_id, channel from alerts, servers where streamer_id = ? and valid = 1 and server_id=id', id, (err, res) => {
            res.forEach(entry => {

                const guild = client.guilds.resolve(entry.server_id);
                const channel = guild.channels.resolve(entry.channel);

                channel.send(`Hey, ${name} just went live here: https://twitch.tv/${name}`);
            });
        });
    }

    res.end();
});


app.listen(3000, () => {
    console.log('server up')
});

