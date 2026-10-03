/** Accès localStorage tolérant aux erreurs (navigation privée, stockage bloqué). */
const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const storage = {
  get: (key) => safe(() => JSON.parse(localStorage.getItem(key))),
  set: (key, value) => safe(() => localStorage.setItem(key, JSON.stringify(value))),
  remove: (key) => safe(() => localStorage.removeItem(key)),
}

export const STORAGE_KEYS = {
  token: 'ma-place:token',
  establishment: 'ma-place:establishment',
  currentTicket: 'ma-place:current-ticket',
  cancelTokens: 'ma-place:cancel-tokens',
  favorites: 'ma-place:favorites',
}
