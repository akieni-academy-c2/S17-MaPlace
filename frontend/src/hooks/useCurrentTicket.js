import { useCallback, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/utils/storage'

/** Ticket actif du visiteur (pas de compte client : on le garde dans le navigateur). */
export function useCurrentTicket() {
  const [ticketId, setTicketId] = useState(() => storage.get(STORAGE_KEYS.currentTicket))

  const save = useCallback((id) => {
    storage.set(STORAGE_KEYS.currentTicket, id)
    setTicketId(id)
  }, [])

  const clear = useCallback(() => {
    storage.remove(STORAGE_KEYS.currentTicket)
    setTicketId(null)
  }, [])

  return { ticketId, save, clear }
}
