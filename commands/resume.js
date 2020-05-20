const { prefix } = require('../config.json');
const queue = require('../queue').queue;

module.exports = {
    name: 'resume',
    description: 'Resumes the currently paused song.',
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);

        if(serverInfo && serverInfo.paused && serverInfo.voice) {
            serverInfo.voice.resume();
            serverInfo.paused = false;
        }else{
            msg.channel.send('No song is currently paused.');
        }
    }
}