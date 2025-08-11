import { defineModule } from '../registry.js'

export const userModule = defineModule('user', {
  create: { method: 'POST', path: '/user', encrypt: true, decrypt: true },
  auth: { method: 'PUT', path: '/user/:userId/auth', encrypt: true, decrypt: true },
  edit: { method: 'PATCH', path: '/user/:userId', encrypt: true, decrypt: true },
  suite: { method: 'GET', path: '/suite/user/:userId' },
  inherit: { method: 'PUT', path: '/user/:userId/inherit', encrypt: true, decrypt: true },
  setTutorialStatus: { method: 'PATCH', path: '/user/:userId/tutorial', encrypt: true, decrypt: true },
  readActionSet: { method: 'PUT', path: '/user/:userId/action-set/:id', encrypt: true, decrypt: true },
  takePresents: { method: 'POST', path: '/user/:userId/present', encrypt: true, decrypt: true },
})
