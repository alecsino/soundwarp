const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const MessageHandler = require('./messageHandler');

class SignalingServer {

    LOGGING = true;

    constructor(port = 3000) {
        this.clients = {};
        this.messageHandler = new MessageHandler(this);
        this.initWss(port);
    }

    initWss(port) {
        const server = https.createServer({
            cert: fs.readFileSync('./fullchain.pem'),
            key: fs.readFileSync('./privkey.pem')
        });

        this.wss = new WebSocket.Server({ server });

        server.listen(port, () => {
            console.log('WebSocket server is listening on port', port);
        });

        this.wss.on('connection', ws => {
            if(this.LOGGING)
                console.log('connection', ws._socket.remoteAddress);

            ws.on('message', message => {
                this.messageHandler.handleMessage(message, ws);
            });

            ws.on('close', () => {
                console.log('connection closed', ws._socket.remoteAddress);
                this.removeClient(ws._socket.remoteAddress);
            });
        });
    }

    sendMessage(to, message) {
        this.clients[to].ws.send(message);
    }

    addClient(client) {
        this.clients[client.ip] = client;
        this.broadcast({type: 'newClient', data: client}, c => c !== client.ip);
    }

    removeClient(ip) {
        delete this.clients[ip];
        this.broadcast({type: 'disconnectClient', data: {ip: ip}});
    }

    sendClientList(ws) {
        let clientsCopy = Object.keys(this.clients).map( c => {
            return {
                ip: this.clients[c].ip,
                deviceType: this.clients[c].deviceType,
                self: c === ws._socket.remoteAddress
            }
        })
        ws.send(JSON.stringify({type: 'clients', data: clientsCopy}));
    }

    broadcast(message, filter = c => true){
        Object.keys(this.clients).forEach( c => {
            if (filter(c)){
                this.clients[c].ws.send(JSON.stringify(message));
            }
        })
    }

}

module.exports = SignalingServer;