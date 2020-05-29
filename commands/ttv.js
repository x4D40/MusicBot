const { prefix, ttv_token, ttv_id, host } = require('../config.json');
const { commands, db } = require('../bot');
const axios = require('axios');

module.exports = {
    name: 'ttv',
    description: `Configures alerts for twitch streams.`,
    async execute(msg, args) {

        console.log(args);

        // if given an argument
        if(args.length > 0) {

            // if arg is add
            if(args[0] === 'add') {
                const sql1 = 'select channel from servers where id = ?'

                // get the guild channgel
                db.get(sql1, msg.guild.id, (err, res) => {

                    // if not setup yet
                    if(!res) {
                        msg.channel.send(`Could not find an associated text channel for notifications. Use '${prefix}ttv channel <channel name>' to set.`);
                        return;
                    }

                    const channel = msg.guild.channels.resolve(res["channel"]);

                    if(!channel) {
                        msg.channel.send(`Could not find an associated text channel for notifications. Use '${prefix}ttv channel <channel name>' to set.`);
                        return;
                    }

                    // channel has been found

                    // check for the streamer in the cache
                    const sql2 = 'select id from streams where name = ?'
                    db.get(sql2, args[1], (err, res) => {

                        const config = {
                            headers: {
                                Authorization: `Bearer ${ttv_token}`,
                                'Client-ID': `${ttv_id}`
                            }
                        }

                        // not cached
                        if(!res) {
                            axios.get(`https://api.twitch.tv/helix/users?login=${args[1]}`, config).then(response => {
                                if(response.data.data[0] && response.data.data[0].id) {
                                    // add streamer into the database
                                    db.run('insert into streams(id, name) values(?,?)', [response.data.data[0].id, args[1]], (err) => {
                                        if(err){
                                            console.log(err);
                                        }else {
                                            console.log('stored streamer id')
                                        }
                                    });

                                    // make post request to webhook endpoint

                                    const body = {
                                        "hub.callback": `http://${host}/callback`,
                                        "hub.mode": "subscribe",
                                        "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${response.data.data[0].id}`,
                                        "hub.lease_seconds": 864000
                                    }

                                    axios.post(`https://api.twitch.tv/helix/webhooks/hub`, body, config).then(res => {
                                        // since they werent in the database, mark the alert as not valid
                                        db.run('insert into alerts(server_id, streamer_id, valid) values (?,?,0)', [msg.guild.id, args[1]], (err) => {
                                            if(err){
                                                console.log(err);
                                            }else {
                                                console.log(res);
                                                msg.channel.send('You should see an alert in the notification channel shortly, if you do not recieve a notification please try again.');
                                            }
                                        });
                                    }).catch(err => {
                                        msg.channel.send('An error occured while trying to listen for this stream.');
                                    })
                                }
                                // didnt get the twitch id for some reason
                                else{
                                    msg.channel.send('An unknown error has occured while trying to get this twitch id.');
                                }
                            }).catch(error => {
                                msg.channel.send('An unknown error has occured. Please try again.');
                            })
                        }
                        // else streamer was in cache
                        else{
                            // since the streamer was found, there is already a webhook for this, make it as valid
                            db.run('insert into alerts(server_id, streamer_id, valid) values (?,?,1)', [msg.guild.id, args[1]], (err) => {
                                if(err){
                                    console.log(err);
                                }else {
                                    msg.channel.send('Alert configured.');
                                }
                            });
                        }
                    })
                });

            }
            // if arg is channel
            else if(args[0] === 'channel') {

                const sql = 'replace into servers(id, channel) values(?,?)';
                let foundChannel = null;

                // get the channels
                const a = msg.guild.channels.cache.array()

                a.forEach(channel => {
                    if(channel.name === args[1] && channel.type === 'text') {
                        foundChannel = channel;
                    }
                });
                
                // if we found the channel
                if(foundChannel) {

                    // store in db as the callback channel
                    db.run(sql, [msg.guild.id, foundChannel.id], (err) => {
                        if(!err) {
                            msg.channel.send(`Twitch notifications will be sent to the '${args[1]}' channel.`);
                        }else{
                            msg.channel.send('Could not use this text channel.');
                        }
                    });

                }
                // else channel was not found
                else{
                    msg.channel.send('That channel name was not found. Make sure it is a text channel.');
                }

            }
            // if arg is remove
            else if(args[0] === 'remove') {

            }
            // else invalid arg
            else{
                console.log('send help here too')
            }
        }else{
            console.log('send help here')
        }
    }
}