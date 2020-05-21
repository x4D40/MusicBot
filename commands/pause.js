const { prefix } = require('../config.json');
const queue = require('../queue').queue;

module.exports = {
    name: 'pause',
    description: 'Pauses the current song.',
    help: `Example: ${prefix}pause`,
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);

        if(serverInfo && !serverInfo.paused && serverInfo.audio) {
            serverInfo.audio.pause();
            serverInfo.paused = true;
        }else{
            msg.channel.send('No song is currently playing.');
        }
    }
}