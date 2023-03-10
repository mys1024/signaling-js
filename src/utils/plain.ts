export async function toUint8Array(data: unknown): Promise<Uint8Array | undefined> {
  if (data instanceof Uint8Array)
    return data
  else if (data instanceof ArrayBuffer)
    return new Uint8Array(data)
  else if (data instanceof Blob)
    return new Uint8Array(await data.arrayBuffer())
}
