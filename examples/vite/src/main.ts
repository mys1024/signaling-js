import { SignalingPeer } from 'signaling-peer-js'

import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div>
      <span>Your PID:</span>
      <span id="pid">Allocating...</span>
    </div>
    <div>
      <input id="another-pid" placeholder="Another PID" type="number" />
      <input id="msg" placeholder="Your message" />
      <button id="send-btn">Send</button>
    </div>
    <div id="logs"></div>
  </div>
`

const signalingAgentAddr = 'ws://localhost/ws'

const peer = new SignalingPeer(signalingAgentAddr)
peer.addDataSignalListener(({ from, data }) => {
  const logEl = document.createElement('div')
  logEl.innerText = `from: ${from}, data: ${data}`
  document.querySelector<HTMLInputElement>('#logs')!.appendChild(logEl)
})

document.querySelector<HTMLButtonElement>('#send-btn')!.addEventListener('click', async () => {
  const anotherPid = Number(document.querySelector<HTMLInputElement>('#another-pid')!.value)
  const msg = document.querySelector<HTMLInputElement>('#msg')!.value
  const res = await peer.send(anotherPid, msg)
  const logEl = document.createElement('div')
  logEl.innerText = `to: ${anotherPid}, res: ${res}, data: ${msg}`
  document.querySelector<HTMLInputElement>('#logs')!.appendChild(logEl)
})

const pid = await peer.getPid()
document.querySelector<HTMLDivElement>('#pid')!.innerText = `${pid}`
