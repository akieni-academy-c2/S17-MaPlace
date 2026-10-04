import { Button, Icon, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import styles from './HeroSection.module.css'

const PROMISES = ['Sans inscription', 'Suivi en direct', 'Annulation en un clic']

/** Composition illustrée (aucune photo) : téléphone avec ticket, notifications flottantes. */
function HeroVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.blob} />
      <span className={styles.ring} />
      <span className={styles.sun} />

      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.screenTop}>
            <Logo size={22} />
            <Icon name={ICONS.bell} size={14} />
          </div>
          <div className={styles.screenPlace}>
            <span className={styles.screenAvatar}>
              <Icon name={ICONS.pharmacy} size={14} />
            </span>
            <span>
              <strong>Pharmacie Centrale</strong>
              <small>Centre-ville, Brazzaville</small>
            </span>
          </div>
          <div className={styles.screenTicket}>
            <small>Votre ticket</small>
            <strong>#3</strong>
            <span className={styles.screenBadge}>
              <span /> En attente
            </span>
          </div>
          <div className={styles.screenStats}>
            <span>
              <strong>2</strong>
              <small>devant vous</small>
            </span>
            <span>
              <strong>≈ 10 min</strong>
              <small>d’attente</small>
            </span>
          </div>
          <div className={styles.screenBar}>
            <span />
          </div>
        </div>
      </div>

      <div className={`${styles.float} ${styles.floatTurn}`}>
        <span className={styles.floatIcon}>
          <Icon name={ICONS.check} size={18} weight={600} />
        </span>
        <span>
          <strong>C’est votre tour !</strong>
          <small>Rendez-vous au guichet</small>
        </span>
      </div>

      <div className={`${styles.float} ${styles.floatLive}`}>
        <span className={styles.liveDot} />
        <span>
          <strong>File ouverte</strong>
          <small>Mise à jour en direct</small>
        </span>
      </div>

      <p className={styles.note}>
        Votre ticket
        <br />
        en quelques clics !
      </p>
    </div>
  )
}

/** Section d'accroche de l'accueil. */
export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            <Icon name={ICONS.bolt} size={14} /> Gagnez du temps, simplifiez vos démarches
          </span>
          <h1 className={`text-display ${styles.title}`}>
            Rejoignez votre file d’attente à distance et <span className={styles.highlight}>économisez du temps&nbsp;!</span>
          </h1>
          <p className={styles.lead}>
            Avec Ma Place, prenez votre ticket en ligne, suivez votre tour en temps réel et ne vous présentez qu’au bon moment.
            Pharmacies, administrations, banques ou salons : fini les longues heures debout.
          </p>
          <div className={styles.actions}>
            <Button size="lg" icon={ICONS.search} iconRight={ICONS.forward} to={`${PATHS.establishments}#recherche`}>
              Rechercher une file
            </Button>
            <Button size="lg" variant="outline" icon={ICONS.ticket} to={PATHS.myTickets}>
              Mes tickets
            </Button>
          </div>
          <ul className={styles.promises}>
            {PROMISES.map((p) => (
              <li key={p}>
                <Icon name={ICONS.checkCircle} size={16} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
