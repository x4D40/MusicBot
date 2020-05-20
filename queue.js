class Queue {

    constructor(){
        this.queue = new Map();
    }

    enqueue(server, song) {
        const serverQueue = this.queue.get(server);

        if(serverQueue) {
            serverQueue.songs.push(song);
        }else{
            this.queue.set(server, {
                songs: [song],
                playing: false,
                paused: false
            });
        }
    }

    dequeue(server) {
        const serverQueue = this.queue.get(server);

        if(serverQueue) {

            return ;
        }else{
            return null;
        }
    }

    isEmpty(server) {
        const serverQueue = this.queue.get(server);

        if(serverQueue) {
            return !!serverQueue.songs;
        }else{
            return true;
        }
    }

    getServerInfo(server) {
        return this.queue.get(server);
    }
}

const queue = new Queue();
exports.queue = queue;