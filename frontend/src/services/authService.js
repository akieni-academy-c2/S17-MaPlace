import { api } from './apiClient'

/** POST /api/auth/login → { token, establishment } */
export const login = (email, password) => api.post('/api/auth/login', { email, password })

/** GET /api/auth/me → { establishment } */
export const getMe = () => api.get('/api/auth/me', { auth: true })
