import { SignalingPeer } from '../src/node'

async function example() {
  const peer1 = new SignalingPeer('ws://127.0.0.1/ws')
  const pid1 = await peer1.getPid()
  console.log('peer1 pid:', pid1)
  peer1.addDataListener((data, from) => {
    console.log(`peer1 recv from ${from}:`, data)
  })

  const peer2 = new SignalingPeer('ws://127.0.0.1/ws')
  const pid2 = await peer2.getPid()
  console.log('peer2 pid:', pid2)
  peer2.addDataListener((data, from) => {
    console.log(`peer2 recv from ${from}:`, data)
  })

  console.log('res to peer1:', await peer1.send(pid2, { name: 'Li', time: new Date() }))
  console.log('res to peer2', await peer2.send(pid1, 'Hi!'))
}

example()
