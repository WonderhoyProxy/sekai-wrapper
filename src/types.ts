export type SekaiPlatform = 'android' | 'ios'

export type SekaiRegion = 'en' | 'jp' | 'kr' | 'tw' | 'cn'

export interface SekaiKeyset {
  key: string
  iv: string
}

export interface SekaiDevice {
  model: string
  osVersion: string
  id: string
}

export interface CreateSekaiClientOptions extends TransportTuningOptions {
  region: SekaiRegion
  platform: SekaiPlatform
  keyset?: SekaiKeyset
  baseUrlOverride?: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface TransportTuningOptions {
  retries?: number
  retryDelayMs?: number
  timeoutMs?: number
}

export interface RawRequestConfig<TReq = unknown> {
  method?: HttpMethod
  path: string
  params?: Record<string, string | number>
  query?: Record<string, string | number | boolean | null | undefined>
  json?: TReq
  encrypt?: boolean
  decrypt?: boolean
}

export interface SekaiSystemAppVersion {
  systemProfile: string
  appVersion: string
  multiPlayVersion: string
  dataVersion: string
  assetVersion: string
  appHash: string
  assetHash: string
  appVersionStatus: 'not_available' | 'available'
}

export interface SekaiSystemResponse {
  serverDate: number
  timezone: string
  profile: string
  maintenanceStatus: 'maintenance_out' | 'maintenance_in'
  appVersions: SekaiSystemAppVersion[]
}

export interface SekaiUserCreateResponse {
  userRegistration: {
    userId: string
    signature: string
    platform: string
    deviceModel: string
    operatingSystem: string
    registeredAt: string
  }
  credential: string
}

export interface SekaiUserInheritResponse {
  userInherit: {
    inheritId: string
  }
}
