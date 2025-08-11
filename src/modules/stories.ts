import { defineModule } from '../registry.js'

export const storiesModule = defineModule('stories', {
  startStory: { method: 'POST', path: '/user/:userId/story/:type/episode/:episodeId', encrypt: true, decrypt: true },
  markStoryAsRead: { method: 'POST', path: '/user/:userId/story/:type/episode/:episodeId/log', encrypt: true, decrypt: true },
  unlockStory: { method: 'POST', path: '/user/:userId/story/:type/episode/:episodeId/cost', encrypt: true, decrypt: true },
})
