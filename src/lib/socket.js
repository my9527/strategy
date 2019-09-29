

import io from 'socket.io-client';
import httpIns from './http';

const generateId = () => '_e_' + Date.now() + (Math.random() * 365).toString(16).slice(4,14) + 'yl';

export default class SocketIo {

    async getToken(isPrivate = false) {
        const bulletSrc = isPrivate ? '/api/v1/bullet-private' :
        '/api/v1/bullet-public';
        // console.log(bulletSrc)
        const res = await httpIns.post(bulletSrc)
        return res;
    }

    async _connect(config) {
        const server = config.server;
        const connectId = config.connectId;
        const {
            instanceServers,
            token,
        } = server;
        const endpoint = instanceServers[0].endpoint;
        console.log(endpoint)
        const url = `${instanceServers[0].endpoint}?token=${encodeURIComponent(token)}&acceptUserMessage=true&connectId=${connectId}`;
        // return io(`${endpoint}?token=${encodeURIComponent(token)}&format=json&acceptUserMessage=true&connectId=${connectId}`, {
        //     reconnectionAttempts: 5,
        //     reconnectionDelay: 3000,
        //     forceNew: true,
        //     transports: ['websocket'],
        //   });
        return io('wss://push-private.kumex.com/endpoint',{
            // path:'/endpoint',
            // path: endpoint,
            query: {
                token,
                format: 'json',
                acceptUserMessage: 'true',
                connectId,
            },
            transports: ['websocket', 'polling'],
            rejectUnauthorized: false,
            forceNew: true,
        })
        // return io(url, {
        //     transports: ['websocket'],
        //     rejectUnauthorized: false,
        //     // origins:"*",
        //     // jsonp: false,
        // });
    }

    async connect() {
        const config = await this.getToken()
        // console.log(JSON.stringify(config))
        return this._connect({
            server: config.data,
            connectId: generateId(),
        });
    }
    async main() {
        const socket = await this.connect();

        // console.log(socket);

        // return;

        socket.on('connect', () => {
            console.log('socket.connected'); // true
            console.log(socket.id)
            const id = generateId();
            socket.send('bullet', JSON.stringify({
                id,
                type: 'subscribe',
                topic: "/contractMarket/ticker:XBTUSDM",
                private: false,
                response: true
            }))
          });
        socket.on('event', function(data){
            console.log(data);
        });
        socket.on('bullet', function(data){
            console.log('bullet', data);
        });
        socket.on('disconnect', function(){});

        socket.on('connect_error', function(err){
            console.log(err);
        });
        // cl.on('connection', (socket) => {

        // });
        // cl.on('message', )
    }
}