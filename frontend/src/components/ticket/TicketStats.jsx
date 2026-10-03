import { StatCard } from '@/components/ui'
import { formatTicketNumber } from '@/utils/format'
import styles from './TicketStats.module.css'

/** Trio Appelé / Devant vous / Position du ticket client. */
export function TicketStats({ currentNumber, peopleAhead, position }) {
  return (
    <div className={styles.grid}>
      <StatCard compact label="Appelé" value={formatTicketNumber(currentNumber)} caption="Actuellement" />
      <StatCard compact label="Devant vous" value={peopleAhead ?? '—'} caption={peopleAhead > 1 ? 'Personnes' : 'Personne'} />
      <StatCard compact tone="primary" label="Position" value={position ?? '—'} caption="Dans la file" />
    </div>
  )
}
