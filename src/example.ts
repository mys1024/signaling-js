import { SignalingPeer } from './index'

async function example() {
  const peer1 = new SignalingPeer('ws://127.0.0.1/ws')
  const pid1 = await peer1.getPid()
  console.log('peer1:', pid1)
  peer1.addDataListener((data, from) => {
    console.log('peer1 recv:', from, data)
  })

  const peer2 = new SignalingPeer('ws://127.0.0.1/ws')
  const pid2 = await peer2.getPid()
  console.log('peer2:', pid2)
  peer2.addDataListener((data, from) => {
    console.log('peer2 recv:', from, data)
  })

  console.log(await peer1.send(pid2, { name: 'Li', time: new Date() }))
  console.log(await peer2.send(pid1, true))
}

example()
