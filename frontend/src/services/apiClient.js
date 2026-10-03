import { storage, STORAGE_KEYS } from '@/utils/storage'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

/**
 * Client HTTP minimal autour de fetch.
 * - Ajoute `Authorization: Bearer <token>` si `auth: true`
 * - Renvoie directement `data` des réponses { status: 'success', data }
 * - Lève une ApiError (status 400/401/404/409…) sinon
 */
export async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = storage.get(STORAGE_KEYS.token)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Impossible de joindre le serveur.', 0)
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event('ma-place:unauthorized'))
    }
    throw new ApiError(payload?.message ?? `Erreur ${response.status}`, response.status, payload)
  }

  return payload?.data ?? payload
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
}
