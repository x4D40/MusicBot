const { prefix } = require('../config.json');
const queue = require('../queue').queue;
const ytdl = require('ytdl-core');
const disconnect = require('./leave').disconnect;

module.exports = {
    name: 'play',
    description: `Attempts to play the song from YouTube. If a song is currently playing the song will be added to the queue. Example: ${prefix}play <song link>`,
    async execute(msg, args){

        const serverName = msg.guild.id;
        let info = null;

        // try to get song info
        try{
            info = await ytdl.getInfo(args[0]);
        }catch {
            msg.channel.send('Couldnt find that song.');
            return;
        }

        // if the server name exists
        if(serverName) {

            // enqueue the song
            queue.enqueue(serverName, info);

            // get the serverInfo object
            const serverInfo = queue.getServerInfo(serverName);

            // if that server has no song playing rn, start playing
            if(!serverInfo.playing) {

                // if they are in a channel
                if(msg.member.voice.channel) {
                    // join
                    serverInfo.voice = await msg.member.voice.channel.join();
                    this.play(msg, serverInfo, serverInfo.songs.shift());
                }else {
                    msg.channel.send('You need to join a voice channel first.');
                }
            }else{
                // already playing, just add to queue
                msg.channel.send(`Added ${info.title} to the queue.`);
            }
        }else{
            console.log('no id');
        }

    },
    play(msg, serverInfo, songInfo) {
        if(!songInfo) {
            msg.channel.send('The end of the queue has been reached.');
            disconnect(serverInfo);
            return;
        }
    
        serverInfo.playing = true;
        serverInfo.audio = serverInfo.voice.play(ytdl(songInfo.video_url, {filter: 'audioonly', highWaterMark: 1<<25, quality: 'highestaudio'}), {highWaterMark: 1});
        msg.channel.send(`Now playing ${songInfo.title}`);
        serverInfo.currentSong = songInfo;
    
        serverInfo.audio.on('finish', () => {
            if(serverInfo.songs.length == 0) {
                msg.channel.send('The end of the queue has been reached.');
                disconnect(serverInfo);
            }else{
                this.play(msg, serverInfo, serverInfo.songs.shift());
            }
        });
    
        serverInfo.audio.on('error', error => {
            console.log(error);
        })
    }
}