import NodeWebSocket from 'ws'
import { BSON } from 'bson'

import type {
  AgentSignal,
  DataRecvSignal,
  InitSignal,
  ResSignal,
  SignalData,
  SignalRes,
} from './types'
import { SignalType } from './types'
import { newDataSendSignal } from './dao/signal'

type InitSignalListener = (signal: InitSignal) => void
type ResSignalListener = (signal: ResSignal) => void
type DataListener = (data: DataRecvSignal['data'], from: number) => void

export class SignalingPeer {
  #seq = 1
  #ws: NodeWebSocket
  #wsReady: Promise<void>
  #pid: Promise<number>
  #initSignalListeners = new Set<InitSignalListener>()
  #resSignalListeners = new Set<ResSignalListener>()
  #dataListeners = new Set<DataListener>()

  constructor(agentAddr: string) {
    this.#ws = new NodeWebSocket(agentAddr)
    this.#wsReady = new Promise<void>(resolve => this.#ws.on('open', () => resolve()))
    this.#pid = new Promise<number>((resolve) => {
      const listener = (signal: InitSignal) => {
        this.#removeInitSignalListener(listener)
        resolve(signal.pid)
      }
      this.#addInitSignalListener(listener)
    })
    this.#ws.on('message', (data) => {
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
    await this.#wsReady
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
