import type { SekaiKeyset } from '../types.js'
import { Buffer } from 'node:buffer'
import { createCipheriv, createDecipheriv } from 'node:crypto'
import { decode, encode } from '@msgpack/msgpack'

export class MsgpackCodec {
  private readonly iv: Buffer
  private readonly key: Buffer

  constructor(keyset: SekaiKeyset) {
    this.key = Buffer.from(keyset.key, 'hex')
    this.iv = Buffer.from(keyset.iv, 'hex')
  }

  deserialize<T = unknown>(data: ArrayBuffer, decrypt: boolean = true): T {
    let payload: Buffer
    if (decrypt) {
      const decipher = createDecipheriv('aes-128-cbc', this.key, this.iv)
      const decrypted = decipher.update(Buffer.from(data))
      payload = Buffer.concat([decrypted, decipher.final()])
    }
    else {
      payload = Buffer.from(data)
    }
    return decode(payload, { useBigInt64: true }) as T
  }

  serialize(data: unknown, encrypt: boolean = true): Buffer {
    const encoded = encode(data, { useBigInt64: true, forceFloat32: true })
    if (!encrypt)
      return Buffer.from(encoded)

    const cipher = createCipheriv('aes-128-cbc', this.key, this.iv)
    const encrypted = cipher.update(encoded)
    return Buffer.concat([encrypted, cipher.final()])
  }
}
