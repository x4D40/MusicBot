const { prefix } = require('../config.json');
const queue = require('../queue').queue;

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports = {
    name: 'shuffle',
    description: 'Shuffles the current queue.',
    async execute(msg, args) {
        const serverInfo = queue.getServerInfo(msg.guild.id);

        if(serverInfo && serverInfo.songs && serverInfo.songs.length >= 2) {
            serverInfo.songs = shuffle(serverInfo.songs);
        }else{
            msg.channel.send('Cannot shuffle the queue.');
        }
    }
}