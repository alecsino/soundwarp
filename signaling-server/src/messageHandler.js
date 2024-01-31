const { userAgentToDevice } = require('./utils/userAgents');

class MessageHandler {

    messageTypes = {
        hello: (message, ws) =>  {

            let newClient = {
                userAgent: message.data,
                deviceType: userAgentToDevice(message.data),
                ip: ws._socket.remoteAddress,
                ws: ws
            };

            this.signalingServer.addClient(newClient);
            this.signalingServer.sendClientList(ws);
        },
        offer: (message, ws) => this.withFromMessage(message, ws),
        iceCandidate: (message, ws) => this.withFromMessage(message, ws),
        answer: (message, ws) => this.withFromMessage(message, ws),
    }

    constructor(signalingServer) {
        this.signalingServer = signalingServer;
        this.LOGGING = this.signalingServer.LOGGING;
    }

    handleMessage(message, ws) {
        message = JSON.parse(message);

        if(this.LOGGING) {
            console.log('received message type: ', message.type);
            console.log(message);
        }

        if(!message.type || !(message.type in this.messageTypes)) {
            console.log('unknown message type received');
            return;
        }

        this.messageTypes[message.type](message, ws);
    }

    withFromMessage(message, ws) {
        message.from = ws._socket.remoteAddress;
        this.signalingServer.sendMessage(message.to, JSON.stringify(message));
    }
}

module.exports = MessageHandler;
