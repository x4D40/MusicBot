const { prefix } = require('../config.json');
const queue = require('../queue').queue;

module.exports = {
    name: 'leave',
    description: 'Clears the queue and makes the bot leave the voice channel.',
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);
        this.disconnect(serverInfo);
    },
    disconnect(serverInfo) {
        if(serverInfo && serverInfo.voice){
            serverInfo.playing = false;
            serverInfo.paused = false;
            serverInfo.currentSong = null;
            serverInfo.voice.disconnect();
            serverInfo.voice = null;
            serverInfo.audio = null;
        }
    }
}