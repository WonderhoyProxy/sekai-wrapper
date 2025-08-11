import { defineModule } from '../registry.js'

export const systemModule = defineModule('system', {
  get: { method: 'GET', path: '/system' },
})
