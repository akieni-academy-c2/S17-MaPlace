import { api } from './apiClient'

/** POST /api/tickets (public) → { ticket } */
export const createTicket = ({ establishmentId, name, phone }) =>
  api.post('/api/tickets', { establishmentId, name, phone })

/** GET /api/tickets/:id (public) → { ticket } avec position, peopleAhead, queueStatus, establishment */
export const getTicket = (id, options) => api.get(`/api/tickets/${id}`, options)

/** POST /api/tickets/:id/complete (JWT) — SERVING → COMPLETED */
export const completeTicket = (id) => api.post(`/api/tickets/${id}/complete`, undefined, { auth: true })

/** POST /api/tickets/:id/cancel (JWT) — WAITING → CANCELLED */
export const cancelTicket = (id) => api.post(`/api/tickets/${id}/cancel`, undefined, { auth: true })

/** POST /api/tickets/:id/cancel-by-client (public, cancelToken) — WAITING → CANCELLED */
export const cancelTicketByClient = (id, cancelToken) =>
  api.post(`/api/tickets/${id}/cancel-by-client`, { cancelToken })
