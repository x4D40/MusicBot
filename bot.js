const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const  ytdl = require('ytdl-core');

let voiceConnection = null;
let audioStream = null;
let playing = false;
let queue = [];
let currentSong = '';
let paused = false;

play = async (msg, song) => {

    if(!song) {
        msg.channel.send("The end of the queue has been reached.");
        audioStream.destroy();
        playing = false;
        currentSong = '';
        return;
    }

    playing = true;
    audioStream = voiceConnection.play(ytdl(song.video_url, {filter: 'audioonly', highWaterMark: 1<<25, quality: 'highestaudio'}), {highWaterMark: 1});
    msg.channel.send(`Now playing ${song.title}.`);
    currentSong = song.title;

    audioStream.on('finish', () => {
        console.log('finish');
        if(queue.length == 0) {
            playing = false;
        }else{
            play(msg, queue.shift());
        }
    });

    audioStream.on('error', (error) => {
        console.log('error', error);
    })
};

client.on('message', async msg => {
    if(msg.content.startsWith('!play')) {
        const args = msg.content.split(' ');
        let info = null;

        try{
            info = await ytdl.getInfo(args[1]);
        }catch {
            msg.channel.send('No video found.');
            return;
        }

        if(!playing){
            voiceConnection = await msg.member.voice.channel.join();
            play(msg, info);
        }else{
            queue.push(info);
            msg.channel.send(`Added ${info.title} to the queue.`);
        }

    }else if(msg.content === '!leave') {
        if(voiceConnection) {
            voiceConnection.disconnect();
        }
        queue = [];
        paused = false;
        playing = false;
        currentSong = '';
    }else if(msg.content === '!skip') {
        if(!playing) {
            msg.channel.send('No song is currently playing.');
        }else if(queue) {
            play(msg, queue.shift());
        }
    }else if(msg.content === '!pause') {
        if(!playing && !paused)  {
            msg.channel.send('No song is currently playing.');
        }else{
            audioStream.pause();
            paused = true;
        }
    }else if(msg.content === '!resume') {
        if(!paused) {
            msg.channel.send('No song is currently paused.');
        }else {
            audioStream.resume();
            paused = false;
        }
    }else if(msg.content === '!queue') {
        let songs = `Current Song: ${currentSong}\n`;
        let i = 1;

        if(queue){
            queue.map(song => songs += `${i++}) ${song.title}\n`);
        }else{
            songs += 'There are no songs in the queue.';
        }

        msg.channel.send(songs);

    }else if(msg.content === '!help') {
        msg.channel.send('Commands:\n!play <youtube link>: adds the song to the queue.\n!leave.\n!skip\n!pause\n!resume\n!queue: shows the song queue.')
    }

});

client.on('ready', () => {
    console.log('ready');
});

client.login(config.token);