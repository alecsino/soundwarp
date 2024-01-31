let peerConnection = new RTCPeerConnection();

function onIceCandidate(event, ip) {
    if (event.candidate) {
        // Send the local ICE candidate to the peer
        const msg = {
            type: 'iceCandidate',
            to: ip,
            candidate: event.candidate
        };
        socket.send(JSON.stringify(msg));
    }
}

peerConnection.addEventListener('connectionstatechange', event => {
    console.log('Connection state change:', peerConnection.connectionState);
});

peerConnection.ondatachannel = event => {
    dataChannel = event.channel;
    console.log('data channel received', dataChannel);

    dataChannel.onmessage = function(event) {
        console.log('Received message:', event.data);
    };
};

peerConnection.ontrack = function(event) {
    console.log(event);

    let stream = new MediaStream();
    stream.addTrack(event.track);

    if (event.track.kind !== 'audio') {
        return;
    }

    let audioElement = document.getElementById('audioPlayer');
    audioElement.srcObject = stream;
    audioElement.muted = false;
    audioElement.autoplay = true;
    audioElement.playsinline = true;
    audioElement.play();
}

//TODO: make stuff async
function initiatePeerConnection(client) {

    //stream microphone using webrtc
    navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
        stream.getTracks().forEach(track => {
            console.log('adding track', track);
            peerConnection.addTrack(track, stream);
        }
    )}).catch(error => {
        console.error('Error streaming microphone:', error);
        alert('Error streaming microphone: ' + error);
    });

    peerConnection.addTransceiver('audio', {direction: 'sendonly'});

    peerConnection.onicecandidate = event => {
        onIceCandidate(event, client.ip);
    }

    // Create offer and set local description
    peerConnection.createOffer().then(offer => {
        return peerConnection.setLocalDescription(offer);
    }).then(() => {
        // Send the offer to the peer
        const msg = {
            type: 'offer',
            to: client.ip,
            offer: peerConnection.localDescription
        };
        socket.send(JSON.stringify(msg));
    }).catch(error => {
        console.error('Error creating offer:', error);
        alert('Error creating offer: ' + error);
    });
}

// Handle incoming ICE candidates
function handleIceCandidate(candidate) {
    // Add the received ICE candidate to the peer connection
    // console.log('handleIceCandidate');
    if(peerConnection.remoteDescription == null){
        return;
    }
    
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {
        console.error('Error adding ICE candidate:', error);
    });
}

function askPermissionOffer(offer, from) {
    let popup = document.getElementById('popup');
    // add ip to popupText
    let popupText = document.getElementById('popupIp');
    popupText.innerHTML = from;
    popup.style.display = 'block';

    let acceptButton = document.getElementById('acceptButton');
    acceptButton.onclick = function() {
        popup.style.display = 'none';
        handleOffer(offer, from);
    };

    let rejectButton = document.getElementById('rejectButton');
    rejectButton.onclick = function() {
        popup.style.display = 'none';
    };
}

// Handle incoming offer
function handleOffer(offer, from) {

    peerConnection.addTransceiver('audio', {direction: 'recvonly'});
    // peerConnection.addTransceiver('video', {direction: 'recvonly'});


    peerConnection.onicecandidate = event => {
        onIceCandidate(event, from);
    }
    
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
        return peerConnection.createAnswer();
    }).then(answer => {
        return peerConnection.setLocalDescription(answer);
    }).then(() => {
        // Send the answer to the peer
        const msg = {
            type: 'answer',
            to: from,
            answer: peerConnection.localDescription
        };
        socket.send(JSON.stringify(msg));
        console.log('Sent answer to peer:', msg);
    }).catch(error => {
        console.error('Error creating answer:', error);
    });
}

// Handle incoming answer
function handleAnswer(answer) {
    // Set remote description
    const remoteDesc = new RTCSessionDescription(answer);
    peerConnection.setRemoteDescription(remoteDesc).catch(error => {
        console.error('Error setting remote description:', error);
    });
}

function setupDataChannel() {
    dataChannel.onopen = function(event) {
        console.log('Data channel is open');
    };

    dataChannel.onclose = function(event) {
        console.log('Data channel is closed');
    };

    dataChannel.onmessage = function(event) {
        console.log('Received message:', event.data);
    };
}