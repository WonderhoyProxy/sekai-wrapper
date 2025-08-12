import { ffetchBase } from '@fuman/fetch'
import { SekaiTransport } from './core/transport.js'
import { liveModule } from './modules/live.js'
import { storiesModule } from './modules/stories.js'
import { systemModule } from './modules/system.js'
import { userModule } from './modules/user.js'
import type { EndpointConfig, ModuleApi, ModuleDescriptor, ModuleEndpoints } from './registry.js'
import type { CreateSekaiClientOptions, RawRequestConfig, SekaiDevice, SekaiPlatform, SekaiRegion, SekaiSystemAppVersion } from './types.js'
import { APP_HASH_URL, DEFAULT_KEYSETS } from './util/constants.js'

export class SekaiClient {
  private readonly transport: SekaiTransport
  private readonly modules = new Map<string, ModuleDescriptor<Record<string, EndpointConfig<any, any>>>>()

  constructor(options: CreateSekaiClientOptions) {
    const keyset = options.keyset ?? DEFAULT_KEYSETS.get(options.region)
    if (!keyset)
      throw new Error(`Keyset for ${options.region} not found`)
    this.transport = new SekaiTransport({ ...options, keyset })
  }

  get userId(): string | undefined {
    return this.transport.getContext().userId
  }

  set userId(userId: string) {
    this.transport.setContext({ userId })
  }

  setDevice(device: SekaiDevice): void {
    this.transport.setContext({ device })
  }

  setVersion(version: Partial<SekaiSystemAppVersion>): void {
    this.transport.setContext({ version })
  }

  async fetchLatestVersion (region: SekaiRegion, platform: SekaiPlatform) {
    const url = APP_HASH_URL.replace('{{ REGION }}', region)
    const response = await ffetchBase(url).json<any>()

    const appKey = `production_${platform}`
    const appData = response[appKey]
    if (!appData)
      throw new Error(`App data for ${platform} not found`)

    return {
      appVersion: appData.app_version,
      appHash: appData.app_hash,
    }
  }

  $raw<TReq = unknown, TRes = unknown>(config: RawRequestConfig<TReq>) {
    const {
      method = 'GET',
      path,
      params = {},
      query = {},
      json,
      encrypt = true,
      decrypt = true,
    } = config

    const userId = this.transport.getContext().userId
    const expandedPath = path.replace(':userId', userId ?? '')
      .replace(/:(\w+)/g, (_: string, key: string) => String((params as any)[key] ?? ''))

    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')

    const url = qs.length ? `${expandedPath}?${qs}` : expandedPath

    return this.transport.request<TRes>(url, {
      method,
      json,
      encrypt,
      decrypt,
    } as any)
  }

  registerModule<M extends ModuleEndpoints>(descriptor: ModuleDescriptor<M>) {
    this.modules.set(descriptor.name, descriptor)
  }

  module<M extends ModuleEndpoints>(name: string): ModuleApi<M> {
    const descriptor = this.modules.get(name)
    if (!descriptor)
      throw new Error(`Module "${name}" is not registered`)

    const api: Record<string, any> = {}
    for (const [key, ep] of Object.entries(descriptor.endpoints as Record<string, EndpointConfig<any, any>>)) {
      api[key] = (args?: { params?: Record<string, any>, query?: Record<string, any>, json?: any }) => {
        return this.$raw<any, any>({
          method: ep.method,
          path: ep.path,
          params: args?.params,
          query: args?.query,
          json: args?.json,
          encrypt: ep.encrypt,
          decrypt: ep.decrypt,
        })
      }
    }
    return api as ModuleApi<M>
  }
}

const builtinModules = {
  system: systemModule,
  user: userModule,
  live: liveModule,
  stories: storiesModule,
} as const

type DescriptorMap = Record<string, ModuleDescriptor<ModuleEndpoints>>
type ClientModules<TMap extends DescriptorMap> = { [K in keyof TMap]: ModuleApi<TMap[K]['endpoints']> }

export function createSekaiClient<M extends DescriptorMap = typeof builtinModules>(
  options: CreateSekaiClientOptions,
  modules?: M,
): SekaiClient & ClientModules<M> {
  const client = new SekaiClient(options)
  const mods = (modules ?? (builtinModules as unknown as M))
  for (const [name, descriptor] of Object.entries(mods)) {
    client.registerModule(descriptor as ModuleDescriptor<ModuleEndpoints>)
    const api = client.module(name)
    Object.defineProperty(client as any, name, { value: api, enumerable: true, configurable: false })
  }
  return client as SekaiClient & ClientModules<M>
}
