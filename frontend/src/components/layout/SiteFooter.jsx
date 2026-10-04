import { Link } from 'react-router-dom'
import { Icon, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { CLIENT_NAV, CONTACT, INFO_LINKS } from '@/constants/site'
import styles from './SiteFooter.module.css'

/** Pied de page client. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo size={44} subtitle="File d'attente en ligne" />
          <p>
            Moins d&apos;attente, plus de temps pour vous. Ma Place permet de prendre un ticket à distance et de suivre son tour
            en direct dans les pharmacies, administrations, banques et commerces de Brazzaville.
          </p>
        </div>

        <nav className={styles.column} aria-label="Navigation du pied de page">
          <h2 className={styles.heading}>Navigation</h2>
          {CLIENT_NAV.map((item) => (
            <Link key={item.key} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.column} aria-label="Informations">
          <h2 className={styles.heading}>Informations</h2>
          {INFO_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Contact</h2>
          <a href={`mailto:${CONTACT.email}`} className={styles.contact}>
            <Icon name={ICONS.mail} size={16} /> {CONTACT.email}
          </a>
          <p className={styles.contact}>
            <Icon name={ICONS.location} size={16} /> {CONTACT.city}
          </p>
          <Link to={PATHS.proLogin} className={styles.contact}>
            <Icon name={ICONS.store} size={16} /> Espace établissement
          </Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>© {new Date().getFullYear()} Ma Place. Tous droits réservés.</p>
          <p className={styles.tagline}>
            <Icon name={ICONS.heart} size={14} filled /> Une solution pour une ville plus fluide.
          </p>
        </div>
      </div>
    </footer>
  )
}
