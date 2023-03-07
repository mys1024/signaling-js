import { SignalingPeer } from 'signaling-peer-js/node'

const signalingAgentAddr = 'ws://127.0.0.1/ws'

const peer1 = new SignalingPeer(signalingAgentAddr)
const pid1 = await peer1.getPid()
const token1 = await peer1.getToken()
console.log('peer1', pid1, token1)
peer1.addDataListener((data, from) => {
  console.log(`peer1 recv from ${from}:`, data)
})

const peer2 = new SignalingPeer(signalingAgentAddr)
const pid2 = await peer2.getPid()
const token2 = await peer2.getToken()
console.log('peer2', pid2, token2)
peer2.addDataListener((data, from) => {
  console.log(`peer2 recv from ${from}:`, data)
})

console.log('res to peer1:', await peer1.send(pid2, 'Hello!'))
console.log('res to peer2', await peer2.send(pid1, 'Hi!'))
