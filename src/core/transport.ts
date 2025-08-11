import type { Ffetch, FfetchOptions } from '@fuman/fetch'
import { createFfetch } from '@fuman/fetch'
import { randomUUID } from 'node:crypto'
import type { CreateSekaiClientOptions, SekaiDevice, SekaiSystemAppVersion } from '../types.js'
import { GAME_ENDPOINT, PLATFORM_HEADER, SEKAI_UNITY_VERSION, SIGNATURE_ENDPOINT, USER_AGENT } from '../util/constants.js'
import { MsgpackCodec } from './msgpack.js'

export interface TransportContext {
  device?: SekaiDevice
  sessionToken?: string
  userId?: string
  version?: Partial<SekaiSystemAppVersion>
}

export class SekaiTransport {
  readonly codec: MsgpackCodec
  readonly http: Ffetch<object, object>
  readonly signature?: Ffetch<object, object>
  readonly options: CreateSekaiClientOptions

  private ctx: TransportContext = {}

  constructor(options: CreateSekaiClientOptions) {
    this.options = options

    const baseUrl = options.baseUrlOverride ?? GAME_ENDPOINT.get(options.region)
    if (!baseUrl)
      throw new Error(`Game endpoint not found for region "${options.region}"`)

    const userAgent = USER_AGENT.get(options.platform)?.get(options.region)
    if (!userAgent)
      throw new Error(`User-Agent not found for region "${options.region}" on platform "${options.platform}"`)

    const sigBase = SIGNATURE_ENDPOINT.get(options.region)
    if (sigBase) {
      this.signature = createFfetch({
        baseUrl: `${sigBase}/api`,
        headers: {
          'Accept': 'application/octet-stream',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/octet-stream',
          'User-Agent': userAgent,
          'x-unity-version': SEKAI_UNITY_VERSION,
        },
      })
    }

    this.http = createFfetch({
      baseUrl: `${baseUrl}/api`,
      headers: {
        'Accept': 'application/octet-stream',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/octet-stream',
        'User-Agent': userAgent,
        'x-unity-version': SEKAI_UNITY_VERSION,
      },
    })

    const keyset = options.keyset
    if (!keyset)
      throw new Error('Missing AES keyset')
    this.codec = new MsgpackCodec(keyset)
  }

  setContext(patch: Partial<TransportContext>): void {
    this.ctx = { ...this.ctx, ...patch }
  }

  getContext(): TransportContext {
    return this.ctx
  }

  private buildHeaders(cookie?: string): Record<string, string> {
    const map = new Map<string, string>()
    if (cookie)
      map.set('Cookie', cookie)

    map.set('x-platform', PLATFORM_HEADER[this.options.platform])
    map.set('x-request-id', randomUUID())
    map.set('x-install-id', randomUUID())

    // @todo: check these headers
    map.set('x-ai', '')
    map.set('x-ga', '')
    map.set('x-kc', '')
    map.set('x-if', '')
    map.set('x-ma', '')

    if (this.ctx.sessionToken)
      map.set('x-session-token', this.ctx.sessionToken)
    if (this.ctx.version) {
      map.set('x-app-version', this.ctx.version.appVersion!)
      if (this.ctx.version.assetVersion)
        map.set('x-asset-version', this.ctx.version.assetVersion)
      if (this.ctx.version.dataVersion)
        map.set('x-data-version', this.ctx.version.dataVersion)
      map.set('x-app-hash', this.ctx.version.appHash!)
    }
    if (this.ctx.device) {
      map.set('x-devicemodel', this.ctx.device.model)
      map.set('x-operatingsystem', this.ctx.device.osVersion)
    }

    return Object.fromEntries(map)
  }

  async request<T = unknown>(url: string, options?: FfetchOptions & { json?: unknown, decrypt?: boolean, encrypt?: boolean }): Promise<T | null> {
    let body: BodyInit | undefined
    if (options?.json !== undefined) {
      const buf = this.codec.serialize(options.json, options.encrypt ?? true)
      body = buf
      options.json = undefined
    }

    let cookie = ''
    if (this.signature) {
      const response = await this.signature.post('/signature').raw()
      if (response.ok) {
        const setCookie = response.headers.getSetCookie()
        if (setCookie)
          cookie = setCookie.join('; ')
      }
    }

    const execute = async () => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeoutPromise = new Promise<never>((_, reject) => {
        if (this.options.timeoutMs && this.options.timeoutMs > 0)
          timeoutId = setTimeout(() => reject(new Error('Request timed out')), this.options.timeoutMs)
      })

      const fetchPromise = this.http(url, {
        ...options,
        body,
        headers: this.buildHeaders(cookie),
        validateResponse: () => true,
      })

      try {
        return await Promise.race([fetchPromise, timeoutPromise])
      }
      finally {
        if (timeoutId)
          clearTimeout(timeoutId)
      }
    }

    const maxRetries = Math.max(0, this.options.retries ?? 0)
    const delayMs = Math.max(0, this.options.retryDelayMs ?? 250)
    let lastError: unknown
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await execute()
        const nextSession = response.headers.get('x-session-token')
        if (nextSession)
          this.ctx.sessionToken = nextSession

        if (!response.ok)
          return null
        const hasBody = response.headers.get('content-length') && response.headers.get('content-length') !== '0'
        if (!hasBody)
          return null

        const buf = await response.arrayBuffer()
        return this.codec.deserialize<T>(buf, options?.decrypt ?? true)
      }
      catch (err) {
        lastError = err
        if (attempt === maxRetries)
          throw err
        await new Promise(res => setTimeout(res, delayMs))
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Unknown transport error')
  }
}
