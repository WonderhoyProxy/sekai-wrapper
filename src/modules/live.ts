import { defineModule } from '../registry.js'

export const liveModule = defineModule('live', {
  start: { method: 'POST', path: '/user/:userId/live', encrypt: true, decrypt: true },
  end: { method: 'PUT', path: '/user/:userId/live/:id', encrypt: true, decrypt: true },
})
