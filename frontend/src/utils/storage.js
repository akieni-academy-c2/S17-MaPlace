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

/* ---------- Abonnement aux changements (synchronise les composants et les onglets) ---------- */
const listeners = new Set()

/** Écrit une valeur puis prévient les composants abonnés (useSyncExternalStore). */
export const setAndNotify = (key, value) => {
  if (value === undefined) storage.remove(key)
  else storage.set(key, value)
  listeners.forEach((listener) => listener())
}

export const subscribeStorage = (listener) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/** Lecture brute (chaîne) : identité stable pour useSyncExternalStore. */
export const readRaw = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
