import { BSON } from 'bson'

import { SignalingPeer } from './peer.js'
import { toUint8Array } from './utils/plain.js'

SignalingPeer._wsConstructor = (wsAddr) => {
  const ws = new WebSocket(wsAddr)
  return {
    send(data) {
      ws.send(data)
    },
    addMessageListener(listener) {
      ws.addEventListener('message', async (event) => {
        const data = await toUint8Array(event.data)
        if (!data)
          throw new Error('Cannot convert message event\' data to Uint8Array.')
        listener(data)
      })
    },
  }
}

export { SignalingPeer, BSON }
