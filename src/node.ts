import NodeWebSocket from 'ws'
import { BSON } from 'bson'

import type {
  AgentSignal,
  DataListener,
  InitSignal,
  InitSignalListener,
  ResSignal,
  ResSignalListener,
  SignalData,
  SignalRes,
} from './types.js'
import { SignalType } from './types.js'
import { newDataSendSignal } from './signal.js'

export { BSON } from 'bson'

export class SignalingPeer {
  #seq = 1
  #ws: NodeWebSocket
  #pid: Promise<number>
  #token: Promise<string>
  #initSignalListeners = new Set<InitSignalListener>()
  #resSignalListeners = new Set<ResSignalListener>()
  #dataListeners = new Set<DataListener>()

  constructor(agentAddr: string) {
    const initSig = new Promise<InitSignal>((resolve) => {
      const listener = (signal: InitSignal) => {
        this.#removeInitSignalListener(listener)
        resolve(signal)
      }
      this.#addInitSignalListener(listener)
    })

    this.#pid = new Promise(resolve => initSig.then(s => resolve(s.pid)))
    this.#token = new Promise(resolve => initSig.then(s => resolve(s.token)))

    this.#ws = new NodeWebSocket(agentAddr)
    this.#ws.addEventListener('message', (e) => {
      const data = e.data
      // deserialize agent signal
      if (!(data instanceof Uint8Array))
        throw new Error('Invalid agent signal.')
      const agentSignal = BSON.deserialize(data) as AgentSignal
      // handle init signal
      if (agentSignal.typ === SignalType.INIT) {
        for (const listener of this.#initSignalListeners)
          listener(agentSignal)
      }
      // handle data_recv signal
      if (agentSignal.typ === SignalType.DATA_RECV) {
        for (const listener of this.#dataListeners)
          listener(agentSignal.data, agentSignal.from)
      }
      // handle res signal
      if (agentSignal.typ === SignalType.RES) {
        for (const listener of this.#resSignalListeners)
          listener(agentSignal)
      }
    })
  }

  async send(to: number, data: SignalData): Promise<SignalRes> {
    await this.#pid // wait before receiving init signal
    const seq = this.#seq++
    this.#ws.send(BSON.serialize(
      newDataSendSignal(seq, to, data),
    ))
    return new Promise<SignalRes>((resolve) => {
      const resSigListener = (signal: ResSignal) => {
        if (signal.ack !== seq)
          return
        this.#removeResSignalListener(resSigListener)
        resolve(signal.res)
      }
      this.#addResSignalListener(resSigListener)
    })
  }

  async getPid() {
    return await this.#pid
  }

  async getToken() {
    return await this.#token
  }

  addDataListener(listener: DataListener) {
    this.#dataListeners.add(listener)
  }

  removeDataListener(listener: DataListener) {
    this.#dataListeners.delete(listener)
  }

  #addInitSignalListener(listener: InitSignalListener) {
    this.#initSignalListeners.add(listener)
  }

  #removeInitSignalListener(listener: InitSignalListener) {
    this.#initSignalListeners.delete(listener)
  }

  #addResSignalListener(listener: ResSignalListener) {
    this.#resSignalListeners.add(listener)
  }

  #removeResSignalListener(listener: ResSignalListener) {
    this.#resSignalListeners.delete(listener)
  }
}
