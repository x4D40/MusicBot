const { prefix } = require('../config.json');
const queue = require('../queue').queue;
const play = require('./play').play;

module.exports = {
    name: 'skip',
    description: `Skips the current song.`,
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);

        if(serverInfo && serverInfo.playing) {
            play(msg, serverInfo, serverInfo.songs.shift());
        }else{
            msg.channel.send('No song is currently playing.');
        }
    }
}