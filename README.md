# signaling-peer-js

A JavaScript peer-side library of [Signaling](https://github.com/mys1024/signaling).

## Install

```shell
npm i signaling-peer-js
```

## Import

```javascript
// for browser:
import { SignalingPeer } from 'signaling-peer-js'
// for Node.js:
import { SignalingPeer } from 'signaling-peer-js/node'
```

## Usage

```javascript
const signalingAgentAddr = 'ws://127.0.0.1/ws'

const peer1 = new SignalingPeer(signalingAgentAddr)
const pid1 = await peer1.getPid()
peer1.addDataSignalListener(({ from, data }) => {
  console.log(`peer1 recv from ${from}:`, data)
})

const peer2 = new SignalingPeer(signalingAgentAddr)
const pid2 = await peer2.getPid()
peer2.addDataSignalListener(({ from, data }) => {
  console.log(`peer2 recv from ${from}:`, data)
})

await peer1.send(pid2, 'Hello!')
await peer2.send(pid1, 'Hi!')
```

## License

MIT
