import { BSON } from 'bson'

import type {
  ConstrainedWebSocket,
  ConstrainedWebSocketConstructor,
} from './types/ws.js'
import type {
  AgentSignal,
  ConfSignal,
  Signal,
  SignalData,
  SignalDataReceiptStatus,
} from './types/signal.js'
import { AgentSignalType } from './types/signal.js'
import { bsonCloseSignal, bsonDataSendSignal, bsonRenewalSignal } from './utils/signal.js'

type AgentSignalListener<T extends AgentSignalType> = (signal: Extract<Signal, { typ: T }>) => void
type RemovableAgentSignalListener<T extends AgentSignalType> = (signal: Extract<Signal, { typ: T }>) => boolean
type AgentSignalListenerRegistry = {
  [T in AgentSignalType]: Set<AgentSignalListener<T>>
}

export class SignalingPeer {
  static _wsConstructor: ConstrainedWebSocketConstructor | undefined

  #listenerRegistry: AgentSignalListenerRegistry = {
    [AgentSignalType.CONF]: new Set(),
    [AgentSignalType.DATA_RECV]: new Set(),
    [AgentSignalType.DATA_RECEIPT]: new Set(),
  }

  #seq = 1
  #ws: ConstrainedWebSocket
  #pid: number | Promise<number>
  #token: string | Promise<string>
  #exp: Date | Promise<Date>
  #closed = false

  constructor(agentAddr: string) {
    const wsConstructor = SignalingPeer._wsConstructor
    if (!wsConstructor)
      throw new Error('Please define SignalingPeer._wsConstructor before creating instances.')

    this.#ws = wsConstructor(agentAddr)

    const firstConfSignal = new Promise<ConfSignal>((resolve) => {
      this.#addRemovableAgentSignalListener(AgentSignalType.CONF, (signal) => {
        resolve(signal)
        return true
      })
    })

    this.#pid = new Promise(resolve => firstConfSignal.then(s => resolve(s.pid)))
    this.#token = new Promise(resolve => firstConfSignal.then(s => resolve(s.token)))
    this.#exp = new Promise(resolve => firstConfSignal.then(s => resolve(s.exp)))

    this.#ws.addMessageListener(async (data) => {
      const agentSignal = BSON.deserialize(data) as AgentSignal // TODO: type check
      for (const listener of this.#listenerRegistry[agentSignal.typ]) {
        // @ts-expect-error it's ok
        listener(agentSignal)
      }
    })
  }

  async send(to: number, data: SignalData): Promise<SignalDataReceiptStatus> {
    // wait until ready
    await this.#pid
    // send data
    const seq = this.#seq++
    this.#ws.send(bsonDataSendSignal(seq, to, data))
    // listen for receipt
    return new Promise<SignalDataReceiptStatus>((resolve) => {
      this.#addRemovableAgentSignalListener(AgentSignalType.DATA_RECEIPT, (signal) => {
        if (signal.ack !== seq)
          return false
        resolve(signal.sta)
        return true
      })
    })
  }

  async renewal() {
    this.#ws.send(bsonRenewalSignal(this.#seq++))
    const confSignal = await new Promise<ConfSignal>((resolve) => {
      this.#addRemovableAgentSignalListener(AgentSignalType.CONF, (signal) => {
        resolve(signal)
        return true
      })
    })
    this.#pid = confSignal.pid
    this.#token = confSignal.token
    this.#exp = confSignal.exp
  }

  async close(deregister = true) {
    this.#ws.send(bsonCloseSignal(this.#seq++, deregister))
    await new Promise<void>((resolve) => {
      this.#ws.addCloseListener(() => resolve())
    })
    this.#closed = true
  }

  async getPid() {
    return await this.#pid
  }

  async getToken() {
    return await this.#token
  }

  async getExp() {
    return await this.#exp
  }

  isClosed() {
    return this.#closed
  }

  addDataSignalListener(listener: AgentSignalListener<AgentSignalType.DATA_RECV>) {
    this.#addAgentSignalListener(AgentSignalType.DATA_RECV, listener)
  }

  removeDataSignalListener(listener: AgentSignalListener<AgentSignalType.DATA_RECV>) {
    this.#removeAgentSignalListener(AgentSignalType.DATA_RECV, listener)
  }

  #addAgentSignalListener<T extends AgentSignalType>(type: T, listener: AgentSignalListener<T>) {
    this.#listenerRegistry[type].add(listener)
  }

  #removeAgentSignalListener<T extends AgentSignalType>(type: T, listener: AgentSignalListener<T>) {
    this.#listenerRegistry[type].delete(listener)
  }

  #addRemovableAgentSignalListener<T extends AgentSignalType>(type: T, listener: RemovableAgentSignalListener<T>) {
    const _listener: AgentSignalListener<T> = (signal) => {
      const shouldRemove = listener(signal)
      if (shouldRemove)
        this.#removeAgentSignalListener(type, _listener)
    }
    this.#addAgentSignalListener(type, _listener)
  }
}
