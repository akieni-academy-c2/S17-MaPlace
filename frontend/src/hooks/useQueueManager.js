import { useMemo, useState } from 'react'
import * as queueService from '@/services/queueService'
import { cancelTicket, completeTicket } from '@/services/ticketService'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { usePolling } from './usePolling'

const byNumber = (a, b) => a.number - b.number

/**
 * État de la file de l'établissement connecté (GET /api/queue en polling) + actions JWT.
 * Partagé par le tableau de bord et l'onglet « File d'attente ».
 */
export function useQueueManager() {
  const { data, error, loading, refresh } = usePolling((signal) => queueService.getQueue({ signal }))
  const [pending, setPending] = useState(null) // action en cours : 'queue' | 'next' | ticketId
  const [actionError, setActionError] = useState(null)

  const status = data?.queueStatus ?? data?.queue?.status ?? QUEUE_STATUS.CLOSED
  const tickets = useMemo(() => [...(data?.tickets ?? [])].sort(byNumber), [data])
  const serving = tickets.find((t) => t.status === TICKET_STATUS.SERVING) ?? null
  const waiting = useMemo(() => tickets.filter((t) => t.status === TICKET_STATUS.WAITING), [tickets])
  const lastNumber = data?.queue?.last_number ?? 0

  /** Exécute une action API puis recharge la file. */
  const run = async (key, action) => {
    setPending(key)
    setActionError(null)
    try {
      await action()
      await refresh()
      return true
    } catch (err) {
      setActionError(err.message)
      return false
    } finally {
      setPending(null)
    }
  }

  /** Ticket créé au guichet (client sans smartphone). Renvoie le ticket ; les erreurs sont levées pour le formulaire. */
  const createTicket = async (payload) => {
    setPending('create')
    try {
      const { ticket } = await queueService.createTicket(payload)
      await refresh()
      return ticket
    } finally {
      setPending(null)
    }
  }

  const actions = {
    open: () => run('queue', queueService.openQueue),
    pause: () => run('queue', queueService.pauseQueue),
    resume: () => run('queue', queueService.resumeQueue),
    close: () => run('queue', queueService.closeQueue),
    callNext: () => run('next', queueService.callNext),
    complete: (id) => run(id, () => completeTicket(id)),
    cancel: (id) => run(id, () => cancelTicket(id)),
    createTicket,
  }

  return {
    status,
    tickets,
    serving,
    waiting,
    lastNumber,
    loading,
    error: actionError ?? error?.message ?? null,
    pending,
    actions,
  }
}
