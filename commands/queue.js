const { prefix } = require('../config.json');
const queue = require('../queue').queue;
const ytdl = require('ytdl-core');

function format(time)
{   
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

module.exports = {
    name: 'queue',
    description: 'Lists the current queue.',
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);

        if(serverInfo && serverInfo.songs && serverInfo.currentSong) {
            let length = serverInfo.currentSong.length_seconds;
            let title = serverInfo.currentSong.title;
            let songList = `Currently playing: ${title} [${format(length)}]\n`;
            let i = 1;
            serverInfo.songs.map(song => {
                length = song.length_seconds;
                title = song.title;
                songList += `${i}) ${title} [${format(length)}]\n`
                i++;
            });

            msg.channel.send(songList);
        }else{
            msg.channel.send('The queue is empty.');
        }
    }
}