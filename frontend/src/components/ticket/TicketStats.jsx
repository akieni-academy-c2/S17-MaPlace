import { StatCard } from '@/components/ui'
import { estimateWaitMinutes, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { formatTicketNumber } from '@/utils/format'
import styles from './TicketStats.module.css'

/** Indicateurs du ticket client : devant moi, position, numéro appelé, attente estimée. */
export function TicketStats({ currentNumber, peopleAhead, position }) {
  return (
    <div className={styles.grid}>
      <StatCard compact tone="primary" label="Devant moi" value={peopleAhead ?? '—'} caption={peopleAhead > 1 ? 'personnes' : 'personne'} icon={ICONS.groups} />
      <StatCard compact label="Ma position" value={position ?? '—'} caption="dans la file" icon={ICONS.queue} />
      <StatCard compact label="Numéro appelé" value={formatTicketNumber(currentNumber)} caption="au guichet" icon={ICONS.campaign} />
      <StatCard compact tone="accent" label="Attente estimée" value={formatWait(estimateWaitMinutes(peopleAhead))} caption="estimation" icon={ICONS.timer} />
    </div>
  )
}
