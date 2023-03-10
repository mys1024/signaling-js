import type { BSON } from 'bson'

export enum AgentSignalType {
  CONF = 100,
  DATA_RECV,
  DATA_RECEIPT,
}

export enum PeerSignalType {
  CLOSE = 200,
  RENEWAL,
  DATA_SEND,
}

export type SignalData =
  | string
  | number
  | boolean
  | null
  | BSON.Binary
  | BSON.Document
  | BSON.Document[]

export enum SignalDataReceiptStatus {
  SENDED,
  RECEIVER_OFFLINE,
  RECEIVER_NOTFOUND,
}

export interface BasicAgentSignal {
  typ: AgentSignalType
  seq: number // signal sequence number
}

export interface BasicPeerSignal {
  typ: PeerSignalType
  seq: number // signal sequence number
}

export interface ConfSignal extends BasicAgentSignal {
  typ: AgentSignalType.CONF
  pid: number
  token: string
  exp: Date
}

export interface DataRecvSignal extends BasicAgentSignal {
  typ: AgentSignalType.DATA_RECV
  from: number // sender pid
  data: SignalData
}

export interface DataReceiptSignal extends BasicAgentSignal {
  typ: AgentSignalType.DATA_RECEIPT
  ack: number
  sta: SignalDataReceiptStatus
}

export interface CloseSignal extends BasicPeerSignal {
  typ: PeerSignalType.CLOSE
  deregister: boolean
}

export interface RenewalSignal extends BasicPeerSignal {
  typ: PeerSignalType.RENEWAL
}

export interface DataSendSignal extends BasicPeerSignal {
  typ: PeerSignalType.DATA_SEND
  to: number // receiver pid
  data: SignalData
}

export type AgentSignal =
  | ConfSignal
  | DataRecvSignal
  | DataReceiptSignal

export type PeerSignal =
  | CloseSignal
  | RenewalSignal
  | DataSendSignal

export type Signal = AgentSignal | PeerSignal
