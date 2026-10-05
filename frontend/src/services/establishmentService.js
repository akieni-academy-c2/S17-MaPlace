import { api } from './apiClient'

/** GET /api/establishments → { establishments: [] } */
export const listEstablishments = (options) => api.get('/api/establishments', options)

/** GET /api/establishments/:id → { establishment } */
export const getEstablishment = (id, options) => api.get(`/api/establishments/${id}`, options)

/** PATCH /api/establishments/me → { establishment } — durée moyenne d'un passage (minutes, 1–240) */
export const updateServiceTime = (averageServiceMinutes) =>
  api.patch('/api/establishments/me', { averageServiceMinutes }, { auth: true })
