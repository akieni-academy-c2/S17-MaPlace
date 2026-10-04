import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon, QueueStatusBadge, SectionHeader } from '@/components/ui'
import { EstablishmentVisual } from '@/components/establishment'
import { describeEstablishment } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { to } from '@/constants/routes'
import { plural } from '@/utils/format'
import styles from './NearbySection.module.css'

/** Positions des repères sur le plan illustré (en %). */
const PIN_SPOTS = [
  [28, 34],
  [62, 26],
  [48, 58],
  [76, 62],
  [22, 70],
  [56, 82],
]

/**
 * « Autour de vous » : établissements regroupés par quartier + plan illustré.
 * Pensé pour accueillir une vraie carte (les repères deviendront des marqueurs géolocalisés).
 */
export function NearbySection({ establishments }) {
  const districts = useMemo(() => {
    const groups = new Map()
    establishments.forEach((e) => {
      const info = describeEstablishment(e)
      const key = info.location
      if (!groups.has(key)) groups.set(key, { label: info.district ?? info.city, city: info.city, items: [] })
      groups.get(key).items.push(e)
    })
    return [...groups.values()].sort((a, b) => b.items.length - a.items.length)
  }, [establishments])

  if (establishments.length === 0) return null

  return (
    <section className={`container ${styles.section}`} aria-labelledby="autour-titre">
      <SectionHeader
        id="autour-titre"
        eyebrow="Localisation"
        title="Les établissements près de chez vous"
        text="Repérez les établissements par quartier et choisissez celui où l’attente est la plus courte."
      />
      <div className={styles.layout}>
        <div className={styles.map} aria-hidden="true">
          <svg className={styles.streets} viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M-10 90 C 80 70, 160 120, 410 80" />
            <path d="M-10 210 C 120 190, 250 240, 410 200" />
            <path d="M120 -10 C 110 90, 150 200, 130 310" />
            <path d="M290 -10 C 300 110, 260 200, 280 310" />
            <path className={styles.river} d="M-10 270 C 90 240, 180 300, 410 250" />
          </svg>
          {establishments.slice(0, PIN_SPOTS.length).map((e, i) => (
            <span
              key={e.id}
              className={`${styles.pin} ${e.queue_status === 'OPEN' ? styles.pinOpen : ''}`}
              style={{ left: `${PIN_SPOTS[i][0]}%`, top: `${PIN_SPOTS[i][1]}%` }}
            >
              <Icon name={ICONS.location} size={18} filled />
              <span className={styles.pinLabel}>{e.name}</span>
            </span>
          ))}
          <span className={styles.mapBadge}>
            <Icon name={ICONS.navigation} size={14} /> Brazzaville
          </span>
        </div>

        <div className={styles.districts}>
          {districts.map((d) => (
            <div key={`${d.label}-${d.city}`} className={styles.district}>
              <div className={styles.districtHead}>
                <span className={styles.districtIcon}>
                  <Icon name={ICONS.location} size={18} />
                </span>
                <span>
                  <strong>{d.label}</strong>
                  <small>
                    {d.city} · {plural(d.items.length, 'établissement')}
                  </small>
                </span>
              </div>
              <ul className={styles.places}>
                {d.items.map((e) => (
                  <li key={e.id}>
                    <Link to={to.establishment(e.id)} className={styles.place}>
                      <EstablishmentVisual establishment={e} size={34} />
                      <span className={styles.placeName}>{e.name}</span>
                      <QueueStatusBadge status={e.queue_status} short size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
