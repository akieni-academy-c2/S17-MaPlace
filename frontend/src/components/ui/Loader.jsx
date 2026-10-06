import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './Loader.module.css'

export function Loader({ label = 'Chargement…' }) {
  return (
    <div className={styles.loader} role="status">
      <Icon name={ICONS.spinner} size={32} className={styles.spin} />
      <span>{label}</span>
    </div>
  )
}
