import { useRef, useState } from 'react'
import { Button, Icon, IconButton, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import waitingRoomUrl from '@/assets/hero/waiting-room.svg'
import remoteQueueUrl from '@/assets/hero/remote-queue.svg'
import styles from './HeroSection.module.css'

const PROMISES = ['Sans inscription', 'Suivi en direct', 'Annulation en un clic']

/** Durée d'affichage d'une diapositive (ms), pilotée par l'animation de la barre de progression. */
const SLIDE_DURATION = 6500
const SWIPE_THRESHOLD = 50

/**
 * Diapositives du carrousel. La première reprend la composition illustrée historique ;
 * les suivantes sont des illustrations cadrées au centre de la scène, avec une légende.
 */
const SLIDES = [
  { key: 'app', label: 'Votre ticket dans la poche' },
  {
    key: 'room',
    image: waitingRoomUrl,
    label: 'Une salle d’attente apaisée',
    text: 'Le numéro appelé s’affiche en direct : chacun patiente assis, sans bousculade au guichet.',
  },
  {
    key: 'remote',
    image: remoteQueueUrl,
    label: 'Attendez où vous voulez',
    text: 'Suivez votre position depuis votre téléphone et rejoignez l’établissement au bon moment.',
  },
]

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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
              <Icon name={ICONS.telecom} size={14} />
            </span>
            <span>
              <strong>MTN Congo — Agence centrale</strong>
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

/** Section d'accroche de l'accueil : texte fixe + carrousel d'illustrations (défilement automatique, swipe, clavier). */
export function HeroSection() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [held, setHeld] = useState(false) // survol ou focus : pause temporaire
  const pointerStart = useRef(null)

  const count = SLIDES.length
  const goTo = (next) => setIndex((next + count) % count)
  const running = playing && !held

  const handlePointerDown = (e) => {
    if (e.pointerType !== 'mouse') pointerStart.current = e.clientX
  }
  const handlePointerUp = (e) => {
    if (pointerStart.current === null) return
    const delta = e.clientX - pointerStart.current
    pointerStart.current = null
    if (Math.abs(delta) > SWIPE_THRESHOLD) goTo(index + (delta < 0 ? 1 : -1))
  }

  return (
    <section
      className={styles.hero}
      aria-roledescription="carrousel"
      aria-label="Ma Place en images"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false)
      }}
    >
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
            Administrations, hôpitaux, banques, agences télécoms ou salons : fini les longues heures debout.
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

        <div className={styles.stage} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => (pointerStart.current = null)}>
          <div className={styles.slides} aria-live={running ? 'off' : 'polite'}>
            {SLIDES.map((slide, i) => (
              <div
                key={slide.key}
                className={`${styles.slide} ${i === index ? styles.slideActive : ''}`}
                role="group"
                aria-roledescription="diapositive"
                aria-label={`${i + 1} sur ${count} : ${slide.label}`}
                aria-hidden={i !== index}
              >
                {slide.image ? (
                  <div className={styles.frame}>
                    {/* Illustration entière, centrée dans la scène comme le visuel du téléphone */}
                    <img src={slide.image} alt="" className={styles.slideImage} loading="lazy" decoding="async" />
                    <div className={styles.caption}>
                      <span className={styles.captionIndex}>
                        {String(i + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                      </span>
                      <strong>{slide.label}</strong>
                      <p>{slide.text}</p>
                    </div>
                  </div>
                ) : (
                  <HeroVisual />
                )}
              </div>
            ))}
          </div>

          <div className={styles.controls}>
            <IconButton icon={ICONS.back} label="Illustration précédente" size={38} variant="outline" className={styles.arrow} onClick={() => goTo(index - 1)} />
            <div className={styles.dots}>
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                  aria-label={`Afficher l’illustration ${i + 1} : ${slide.label}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => goTo(i)}
                >
                  {i === index && (
                    <span
                      key={index}
                      className={styles.dotProgress}
                      style={{ animationDuration: `${SLIDE_DURATION}ms`, animationPlayState: running ? 'running' : 'paused' }}
                      onAnimationEnd={() => playing && goTo(index + 1)}
                    />
                  )}
                </button>
              ))}
            </div>
            <IconButton icon={ICONS.forward} label="Illustration suivante" size={38} variant="outline" className={styles.arrow} onClick={() => goTo(index + 1)} />
            <IconButton
              icon={playing ? ICONS.pause : ICONS.play}
              label={playing ? 'Mettre le défilement en pause' : 'Lancer le défilement'}
              size={38}
              className={styles.arrow}
              onClick={() => setPlaying((p) => !p)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
