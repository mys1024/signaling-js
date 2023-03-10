export interface ConstrainedWebSocket {
  send(data: Uint8Array): void
  addMessageListener(listener: (message: Uint8Array) => void): void
}

export type ConstrainedWebSocketConstructor = (wsAddr: string) => ConstrainedWebSocket
