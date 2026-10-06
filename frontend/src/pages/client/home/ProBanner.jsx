import { Button, Icon } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import styles from './ProBanner.module.css'

const FEATURES = [
  'Ouvrir, mettre en pause ou fermer la file',
  'Appeler le client suivant en un geste',
  'Créer et imprimer un ticket pour les clients sans smartphone',
  'Suivre l’affluence en direct',
]

/** Bandeau destiné aux gestionnaires d'établissements. */
export function ProBanner() {
  const { isAuthenticated } = useAuth()
  return (
    <section className="container" aria-labelledby="pro-titre">
      <div className={styles.banner}>
        <div className={styles.text}>
          <span className={styles.eyebrow}>Espace établissement</span>
          <h2 id="pro-titre" className={`text-h2 ${styles.title}`}>
            Vous gérez un établissement ?
          </h2>
          <p className={styles.lead}>Désengorgez votre salle d’attente : vos clients patientent où ils veulent et arrivent au bon moment.</p>
          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f}>
                <Icon name={ICONS.checkCircle} size={18} /> {f}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="secondary" size="lg" iconRight={ICONS.forward} to={isAuthenticated ? PATHS.proDashboard : PATHS.proLogin} className={styles.cta}>
          {isAuthenticated ? 'Ouvrir mon tableau de bord' : 'Accéder à l’espace pro'}
        </Button>
      </div>
    </section>
  )
}
