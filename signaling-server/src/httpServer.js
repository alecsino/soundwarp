const fs = require('fs');
const https = require('https');

class HTTPServer {
    constructor(port = 443) {
        this.port = port;
        this.express = require('express');
        this.app = this.express();
        this.path = require('path');
        this.app.use(this.express.static(this.path.join(__dirname, '../../web-client')));
        this.start();
    }

    start() {
        const options = {
            key: fs.readFileSync('./privkey.pem'),
            cert: fs.readFileSync('./fullchain.pem')
        };

        https.createServer(options, this.app).listen(this.port, '0.0.0.0', () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}

module.exports = HTTPServer;