# SoundWarp 🎶

This is a side-project I've been wanting to undertake for some time. The primary goal is to enable **low latency** streaming of PC audio to your phone, allowing you to connect a pair of Bluetooth headphones without the need for a dongle. 
The second goal will be to allow the phone to be used as a microphone for the PC, allowing you to use your phone's microphone for voice chat.

I decided to make it web-based to avoid the overhead of building an app, and to make it more accessible. At the same time, achieving low latency is the main priority. To accomplish so, I based everything around the WebRTC API, streaming everything through UDP.

## How to use 📖

The current version is really barebones, and only supports streaming audio from the PC to the phone. To use it, you'll just need to run the signaling server on your PC. You can do so by running the following commands:

```bash
cd signaling-server
npm install
node app.js
```

## Roadmap 🛣️

* [x] Basic audio streaming
* [x] Basic UI
* [x] Use mobile device as speaker for PC
* [ ] Use mobile device as microphone on PC
* [ ] Create a hosted version