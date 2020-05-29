const { prefix, ttv_token, ttv_id, host } = require('../config.json');
const { commands, db } = require('../bot');
const axios = require('axios');

module.exports = {
    name: 'ttv',
    description: `Configures alerts for twitch streams.`,
    async execute(msg, args) {

        console.log(args);

        if(args.length > 0) {

            if(args[0] === 'add') {
                const sql = 'select channel from servers where id = ?'
                db.get(sql, msg.guild.id, (err, res) => {
                    const channel = msg.guild.channels.resolve(res["channel"]);

                    if(channel) {
                        const config = {
                            headers: {
                                Authorization: `Bearer ${ttv_token}`,
                                'Client-ID': `${ttv_id}`
                            }
                        }

                        axios.get(`https://api.twitch.tv/helix/users?login=${args[1]}`, config).then(response => {
                            if(response.data.data[0]) {
                                const body = {
                                    "hub.callback": `http://${host}/callback`,
                                    "hub.mode": "subscribe",
                                    "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${response.data.data[0].id}`,
                                    "hub.lease_seconds": 864000
                                }

                                axios.post(`https://api.twitch.tv/helix/webhooks/hub`, body, config).then(res => {
                                    console.log('request sent')
                                }).catch(err => {
                                    console.log(err)
                                    msg.channel.send('An error (2) has occured, please try again.')
                                });

                            }else{
                                msg.channel.send('The username was not found.');
                            }
                        }).catch(err => {
                            console.log(err)
                            msg.channel.send('An error (1) has occured, please try again.')
                        });

                    }else{
                        msg.channel.send(`Could not find an associated text channel for notifications. Use '${prefix}ttv channel <channel name>' to set.`);
                    }

                });

            }else if(args[0] === 'channel') {

                const sql = 'replace into servers(id, channel) values(?,?)';
                let foundChannel = null;
                const a = msg.guild.channels.cache.array()

                a.forEach(channel => {
                    if(channel.name === args[1] && channel.type === 'text') {
                        console.log(channel);
                        foundChannel = channel;
                    }
                });
                
                if(foundChannel) {

                    db.run(sql, [msg.guild.id, foundChannel.id], (result, err) => {
                        if(!err) {
                            msg.channel.send(`Twitch notifications will be sent to the '${args[1]}' channel.`);
                        }else{
                            msg.channel.send('Could not use this text channel.');
                        }
                    });

                }else{
                    msg.channel.send('That channel name was not found. Make sure it is a text channel.');
                }

            }else if(args[0] === 'remove') {

            }else{
                console.log('send help here too')
            }
        }else{
            console.log('send help here')
        }
    }
}