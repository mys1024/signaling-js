import { BSON } from 'bson'
import type {
  CloseSignal,
  ConfSignal,
  DataReceiptSignal,
  DataRecvSignal,
  DataSendSignal,
  RenewalSignal,
  SignalData,
  SignalDataReceiptStatus,
} from '../types/signal.js'
import {
  AgentSignalType,
  PeerSignalType,
} from '../types/signal.js'

export function bsonConfSignal(
  seq: number,
  pid: number,
  token: string,
  exp: Date,
) {
  const signal: ConfSignal = {
    typ: AgentSignalType.CONF,
    seq,
    pid,
    token,
    exp,
  }
  return BSON.serialize(signal)
}

export function bsonDataRecvSignal(
  seq: number,
  from: number,
  data: SignalData,
) {
  const signal: DataRecvSignal = {
    typ: AgentSignalType.DATA_RECV,
    seq,
    from,
    data,
  }
  return BSON.serialize(signal)
}

export function bsonDataReceiptSignal(
  seq: number,
  ack: number,
  sta: SignalDataReceiptStatus,
) {
  const signal: DataReceiptSignal = {
    typ: AgentSignalType.DATA_RECEIPT,
    seq,
    ack,
    sta,
  }
  return BSON.serialize(signal)
}

export function bsonCloseSignal(
  seq: number,
  deregister: boolean,
) {
  const signal: CloseSignal = {
    typ: PeerSignalType.CLOSE,
    seq,
    deregister,
  }
  return BSON.serialize(signal)
}

export function bsonRenewalSignal(
  seq: number,
) {
  const signal: RenewalSignal = {
    typ: PeerSignalType.RENEWAL,
    seq,
  }
  return BSON.serialize(signal)
}

export function bsonDataSendSignal(
  seq: number,
  to: number,
  data: SignalData,
) {
  const signal: DataSendSignal = {
    typ: PeerSignalType.DATA_SEND,
    seq,
    to,
    data,
  }
  return BSON.serialize(signal)
}
