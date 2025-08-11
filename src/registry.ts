import type { HttpMethod, RawRequestConfig } from './types.js'

export interface EndpointConfig<_TReq, _TRes> {
  method: HttpMethod
  path: string
  encrypt?: boolean
  decrypt?: boolean
}

export type ModuleEndpoints = Record<string, EndpointConfig<any, any>>

export interface ModuleDescriptor<M extends ModuleEndpoints> {
  name: string
  endpoints: M
}

export function defineModule<M extends ModuleEndpoints>(name: string, endpoints: M) {
  return { name, endpoints } as const satisfies ModuleDescriptor<M>
}

type ArgsForEndpoint<E extends EndpointConfig<any, any>>
  = undefined extends E['method']
    ? never
    : {
        params?: NonNullable<RawRequestConfig['params']>
        query?: NonNullable<RawRequestConfig['query']>
        json?: E extends EndpointConfig<infer TReq, any> ? TReq : unknown
      }

type ResultForEndpoint<E extends EndpointConfig<any, any>> = Promise<E extends EndpointConfig<any, infer TRes> ? TRes | null : unknown>

export type ModuleApi<M extends ModuleEndpoints> = {
  [K in keyof M]: (args?: ArgsForEndpoint<M[K]>) => ResultForEndpoint<M[K]>
}
