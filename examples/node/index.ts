import { SignalingPeer } from 'signaling-peer-js/node'

const signalingAgentAddr = 'ws://127.0.0.1/ws'

const peer1 = new SignalingPeer(signalingAgentAddr)
const pid1 = await peer1.getPid()
console.log('peer1', pid1, await peer1.getToken(), await peer1.getExp())
peer1.addDataSignalListener(({ from, data }) => {
  console.log(`peer1 recv from ${from}:`, data)
})

const peer2 = new SignalingPeer(signalingAgentAddr)
const pid2 = await peer2.getPid()
console.log('peer2', pid2, await peer2.getToken(), await peer1.getExp())
peer2.addDataSignalListener(({ from, data }) => {
  console.log(`peer2 recv from ${from}:`, data)
})

await peer1.send(pid2, 'Hello!')
await peer2.send(pid1, 'Hi!')

await new Promise<void>(resolve => setTimeout(resolve, 2000))

await peer1.renewal()
console.log('peer1', await peer1.getPid(), await peer1.getToken(), await peer1.getExp())
await peer2.renewal()
console.log('peer2', await peer2.getPid(), await peer2.getToken(), await peer2.getExp())

console.log('peer1 isClosed', peer1.isClosed())
console.log('peer2 isClosed', peer2.isClosed())
await peer1.close()
await peer2.close()
console.log('peer1 isClosed', peer1.isClosed())
console.log('peer2 isClosed', peer2.isClosed())
