import { useCallback, useSyncExternalStore } from 'react'
import { setAndNotify, storage, STORAGE_KEYS, subscribeStorage } from '@/utils/storage'

const readTokens = () => storage.get(STORAGE_KEYS.cancelTokens) ?? {}

/** Jeton d'annulation d'un ticket pris depuis ce navigateur, ou null. */
export const getCancelToken = (ticketId) => readTokens()[ticketId] ?? null

/**
 * Ticket suivi depuis ce navigateur. Les clients n'ont pas de compte : l'identifiant du ticket
 * et son jeton d'annulation sont gardés dans le localStorage.
 *
 * @returns {{ ticketId: string | null, save: (id: string, cancelToken?: string) => void, clear: () => void }}
 */
export function useCurrentTicket() {
  const ticketId = useSyncExternalStore(subscribeStorage, () => storage.get(STORAGE_KEYS.currentTicket))

  const save = useCallback((id, cancelToken) => {
    if (cancelToken) storage.set(STORAGE_KEYS.cancelTokens, { ...readTokens(), [id]: cancelToken })
    setAndNotify(STORAGE_KEYS.currentTicket, id)
  }, [])

  const clear = useCallback(() => {
    const current = storage.get(STORAGE_KEYS.currentTicket)
    if (current) {
      const { [current]: _removed, ...rest } = readTokens()
      storage.set(STORAGE_KEYS.cancelTokens, rest)
    }
    setAndNotify(STORAGE_KEYS.currentTicket, undefined)
  }, [])

  return { ticketId, save, clear }
}
