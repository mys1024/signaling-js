import type {
  DataSendSignal,
  SignalData,
} from '../types'
import { SignalType } from '../types'

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
