import { api } from './apiClient'

const auth = { auth: true }

/** GET /api/queue → { queue, queueStatus, tickets } */
export const getQueue = (options) => api.get('/api/queue', { ...options, ...auth })

/** POST /api/queue/open → { queue } (409 si file déjà OPEN/PAUSED) */
export const openQueue = () => api.post('/api/queue/open', undefined, auth)

/** POST /api/queue/pause → { queue } (OPEN → PAUSED) */
export const pauseQueue = () => api.post('/api/queue/pause', undefined, auth)

/** POST /api/queue/resume → { queue } (PAUSED → OPEN) */
export const resumeQueue = () => api.post('/api/queue/resume', undefined, auth)

/** POST /api/queue/close → { queue } */
export const closeQueue = () => api.post('/api/queue/close', undefined, auth)

/** POST /api/queue/next → { ticket } (404 si aucun WAITING, 409 si PAUSED/CLOSED) */
export const callNext = () => api.post('/api/queue/next', undefined, auth)
