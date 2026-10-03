import { QUEUE_STATUS_META, TICKET_STATUS_META } from '@/constants/status'
import { StatusBadge } from './StatusBadge'

/** Badge d'état d'une file (OPEN / PAUSED / CLOSED). */
export function QueueStatusBadge({ status, ...rest }) {
  const meta = QUEUE_STATUS_META[status] ?? QUEUE_STATUS_META.CLOSED
  return (
    <StatusBadge tone={meta.tone} dot pulse={status === 'OPEN'} {...rest}>
      {meta.label}
    </StatusBadge>
  )
}

/** Badge d'état d'un ticket (WAITING / SERVING / COMPLETED / CANCELLED). */
export function TicketStatusBadge({ status, ...rest }) {
  const meta = TICKET_STATUS_META[status] ?? TICKET_STATUS_META.WAITING
  return (
    <StatusBadge tone={meta.tone} dot={status === 'SERVING'} pulse={status === 'SERVING'} {...rest}>
      {meta.label}
    </StatusBadge>
  )
}
