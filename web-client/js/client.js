const socket = new WebSocket('wss://' + window.location.hostname + ':3000');
let clients = {};

function updateStatus(status) {
    document.getElementById('status').innerText = 'Status: ' + status;
}

function updateClientList() {
    //TODO: make it css based
    const clientList = document.getElementById('clientList');
    clientList.innerHTML = '';
    Object.keys(clients).forEach( c => {
        let li = document.createElement('li');
        li.innerText = clients[c].ip + ' - ' + clients[c].deviceType;
        if (clients[c].self){
            li.style.color = '#83a4fc';
            li.innerText += ' (you)';
        } else {
            // add a clickable text that will send a message to the client
            let sendText = document.createElement('span');
            sendText.innerText = ' connect';
            sendText.classList.add('sendBtn');

            sendText.addEventListener('click', () => {
                initiatePeerConnection(clients[c]);
            })
            li.appendChild(sendText);
        }
        clientList.appendChild(li);
    })
}

//introduce to socket, send navigator object
// Connection opened
socket.addEventListener('open', (event) => {
    console.log('Connected to the WebSocket server');
    updateStatus('Connected');
    //create msg object
    let msg = {
        type: 'hello',
        data: navigator.userAgent
    }
    socket.send(JSON.stringify(msg));
});

// Listen for messages
socket.addEventListener('message', (event) => {
    //TODO: better handler
    let msg = JSON.parse(event.data);
    switch (msg.type) {
        case 'clients':
            for (let c of msg.data){
                clients[c.ip] = c;
            }
            updateClientList();
            break;
        case 'newClient':
            clients[msg.data.ip] = msg.data;
            updateClientList();
            break;
        case 'disconnectClient':
            delete clients[msg.data.ip];
            updateClientList();
            break;
        case 'iceCandidate':
            handleIceCandidate(msg.candidate);
            break;
        case 'offer':
            askPermissionOffer(msg.offer, msg.from);
            break;
        case 'answer':
            handleAnswer(msg.answer);
            break;
        default:
            console.log('unknown message type received');
    }
});

// Connection closed
socket.addEventListener('close', (event) => {
    console.log('Disconnected from the WebSocket server');
    updateStatus('Disconnected');
});

// Connection error
socket.addEventListener('error', (event) => {
    console.log('Error: ', event);
});