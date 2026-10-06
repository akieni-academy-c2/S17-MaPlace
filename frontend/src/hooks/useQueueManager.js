import { useMemo, useState } from 'react'
import { establishmentApi, queueApi, ticketApi } from '@/services/api'
import { AVERAGE_SERVICE_MINUTES } from '@/constants/establishments'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { usePolling } from './usePolling'

const byNumber = (a, b) => a.number - b.number

/** File de l'établissement connecté, rechargée en continu, et actions du gestionnaire. */
export function useQueueManager() {
  const { data, error, loading, refresh } = usePolling((signal) => queueApi.get({ signal }))
  const [pending, setPending] = useState(null)
  const [actionError, setActionError] = useState(null)

  const status = data?.queueStatus ?? data?.queue?.status ?? QUEUE_STATUS.CLOSED
  const tickets = useMemo(() => [...(data?.tickets ?? [])].sort(byNumber), [data])
  const serving = tickets.find((t) => t.status === TICKET_STATUS.SERVING) ?? null
  const waiting = useMemo(() => tickets.filter((t) => t.status === TICKET_STATUS.WAITING), [tickets])
  const lastNumber = data?.queue?.last_number ?? 0
  const pauseReason = data?.queue?.pause_reason ?? null
  const averageServiceMinutes = data?.averageServiceMinutes ?? AVERAGE_SERVICE_MINUTES

  // Exécute une action puis recharge la file ; l'erreur éventuelle est affichée sur la page.
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

  // Les deux actions suivantes laissent remonter l'erreur : elle s'affiche dans leur formulaire.
  const createTicket = async (payload) => {
    setPending('create')
    try {
      const { ticket } = await queueApi.createWalkInTicket(payload)
      await refresh()
      return ticket
    } finally {
      setPending(null)
    }
  }

  const setServiceTime = async (minutes) => {
    setPending('serviceTime')
    try {
      await establishmentApi.updateServiceTime(minutes)
      await refresh()
    } finally {
      setPending(null)
    }
  }

  const actions = {
    open: () => run('queue', queueApi.open),
    pause: () => run('queue', queueApi.pause),
    resume: () => run('queue', queueApi.resume),
    postpone: () => run('queue', queueApi.postpone),
    close: () => run('queue', queueApi.close),
    callNext: () => run('next', queueApi.callNext),
    complete: (id) => run(id, () => ticketApi.complete(id)),
    cancel: (id) => run(id, () => ticketApi.cancel(id)),
    createTicket,
    setServiceTime,
  }

  return {
    status,
    pauseReason,
    tickets,
    serving,
    waiting,
    lastNumber,
    averageServiceMinutes,
    loading,
    error: actionError ?? error?.message ?? null,
    pending,
    actions,
  }
}
