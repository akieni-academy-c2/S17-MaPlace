// localStorage peut lever une erreur (navigation privée, stockage bloqué) : on l'ignore.
const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

/** Lecture / écriture JSON dans le localStorage, sans jamais planter. */
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

const listeners = new Set()

/**
 * Écrit une valeur (ou la supprime si `undefined`) puis prévient les composants abonnés,
 * pour que tous les écrans affichent la même donnée (ticket suivi, favoris).
 */
export const setAndNotify = (key, value) => {
  if (value === undefined) storage.remove(key)
  else storage.set(key, value)
  listeners.forEach((listener) => listener())
}

/** Abonne un composant aux changements, y compris ceux faits dans un autre onglet. */
export const subscribeStorage = (listener) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/** Valeur brute (texte) : useSyncExternalStore a besoin d'une valeur comparable avec ===. */
export const readRaw = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
