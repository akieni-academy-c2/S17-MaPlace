import { api } from './apiClient'

/** GET /api/establishments → { establishments: [] } */
export const listEstablishments = (options) => api.get('/api/establishments', options)

/** GET /api/establishments/:id → { establishment } */
export const getEstablishment = (id, options) => api.get(`/api/establishments/${id}`, options)
