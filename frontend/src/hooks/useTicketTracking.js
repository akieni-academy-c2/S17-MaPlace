import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '@/services/api'
import { TICKET_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import { usePolling } from './usePolling'

const routeForStatus = {
  [TICKET_STATUS.WAITING]: to.ticket,
  [TICKET_STATUS.SERVING]: to.ticketCalled,
  [TICKET_STATUS.COMPLETED]: to.ticketEnd,
  [TICKET_STATUS.CANCELLED]: to.ticketEnd,
}

/** Suit un ticket en direct et redirige vers la page qui correspond à son statut. */
export function useTicketTracking(ticketId, { poll = true } = {}) {
  const navigate = useNavigate()
  const { data, error, loading } = usePolling((signal) => ticketApi.get(ticketId, { signal }), {
    interval: poll ? undefined : 0,
    deps: [ticketId],
  })

  const ticket = data?.ticket ?? null

  useEffect(() => {
    if (!ticket) return
    const target = routeForStatus[ticket.status]?.(ticketId)
    if (target && target !== window.location.pathname) navigate(target, { replace: true })
  }, [ticket, ticketId, navigate])

  return { ticket, error, loading }
}
