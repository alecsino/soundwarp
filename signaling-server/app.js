// use websocket and not socket.io

const SignalingServer = require('./src/signalingServer');
const HTTPServer = require('./src/httpServer');

new SignalingServer();
new HTTPServer();