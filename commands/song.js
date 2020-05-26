const { prefix } = require('../config.json');
const queue = require('../queue').queue;

module.exports = {
    name: 'song',
    description: `Displays current song name.`,
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);
        
        if(serverInfo && serverInfo.currentSong) {
            msg.channel.send(`Now Playing: ${serverInfo.currentSong.title} ${serverInfo.paused ? '`paused`' : ''}`)
        }else{
            msg.channel.send('No song is currently playing.');
        }
    }
}