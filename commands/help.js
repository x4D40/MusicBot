const { prefix } = require('../config.json');
const { commands } = require('../bot');

module.exports = {
    name: 'help',
    description: `Gives help for all commands.`,
    async execute(msg, args) {

        let str = '';

        for(let cmd of commands.values()) {
            str += `${prefix+cmd.name}: ${cmd.description}\n`;
        }

        msg.channel.send(str);

    }
}