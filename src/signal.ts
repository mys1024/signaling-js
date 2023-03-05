import type {
  DataSendSignal,
  SignalData,
} from './types.js'
import { SignalType } from './types.js'

export function newDataSendSignal(
  seq: number,
  to: number,
  data: SignalData,
): DataSendSignal {
  return {
    typ: SignalType.DATA_SEND,
    seq,
    to,
    data,
  }
}
