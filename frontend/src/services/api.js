import { storage, STORAGE_KEYS } from '@/utils/storage'


export const API_URL = 'https://s17-maplace.onrender.com/api'

/** Erreur renvoyée par l'API : `status` contient le code HTTP (0 si le serveur est injoignable). */
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

/** Appelle l'API et renvoie `data` ; lève une ApiError en cas d'échec. `auth` ajoute le jeton. */
async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = storage.get(STORAGE_KEYS.token)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
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
    // Jeton expiré ou invalide : AuthProvider écoute cet événement et déconnecte l'établissement.
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event('ma-place:unauthorized'))
    }
    throw new ApiError(payload?.message ?? `Erreur ${response.status}`, response.status, payload)
  }

  return payload?.data ?? payload
}

const withAuth = { auth: true }

export const authApi = {
  /** Connexion d'un établissement -> { token, establishment } */
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
}

export const establishmentApi = {
  /** Liste publique -> { establishments } */
  list: (options) => request('/establishments', options),

  /** Fiche publique -> { establishment } */
  get: (id, options) => request(`/establishments/${id}`, options),

  /** Durée moyenne d'un passage de l'établissement connecté (1 à 240 min) -> { establishment } */
  updateServiceTime: (averageServiceMinutes) =>
    request('/establishments/me', { method: 'PATCH', body: { averageServiceMinutes }, ...withAuth }),
}

export const ticketApi = {
  /** Prise de ticket par un client -> { ticket } (avec cancelToken) */
  create: ({ establishmentId, name, phone }) =>
    request('/tickets', { method: 'POST', body: { establishmentId, name, phone } }),

  /** Suivi d'un ticket -> { ticket } (position, personnes devant, état de la file) */
  get: (id, options) => request(`/tickets/${id}`, options),

  /** Fin de passage au guichet (établissement) */
  complete: (id) => request(`/tickets/${id}/complete`, { method: 'POST', ...withAuth }),

  /** Annulation par l'établissement */
  cancel: (id) => request(`/tickets/${id}/cancel`, { method: 'POST', ...withAuth }),

  /** Annulation par le client, prouvée par le cancelToken reçu à la création */
  cancelByClient: (id, cancelToken) =>
    request(`/tickets/${id}/cancel-by-client`, { method: 'POST', body: { cancelToken } }),
}

export const queueApi = {
  /** File en cours de l'établissement connecté -> { queue, queueStatus, averageServiceMinutes, tickets } */
  get: (options) => request('/queue', { ...options, ...withAuth }),

  open: () => request('/queue/open', { method: 'POST', ...withAuth }),
  pause: () => request('/queue/pause', { method: 'POST', ...withAuth }),
  resume: () => request('/queue/resume', { method: 'POST', ...withAuth }),

  /** Report au lendemain : la file passe en pause, les tickets en attente gardent leur numéro */
  postpone: () => request('/queue/postpone', { method: 'POST', ...withAuth }),

  close: () => request('/queue/close', { method: 'POST', ...withAuth }),

  /** Appelle le client suivant (le client au guichet est terminé automatiquement) -> { ticket } */
  callNext: () => request('/queue/next', { method: 'POST', ...withAuth }),

  /** Ticket créé au guichet pour un client sans smartphone (téléphone facultatif) -> { ticket } */
  createWalkInTicket: ({ name, phone }) =>
    request('/queue/tickets', { method: 'POST', body: { name, phone }, ...withAuth }),
}
