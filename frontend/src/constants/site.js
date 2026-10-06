import { ICONS } from './icons'
import { PATHS, to } from './routes'

/** Coordonnées affichées sur le site (à remplacer par les coordonnées officielles). */
export const CONTACT = {
  email: 'contact@maplace.cg',
  city: 'Brazzaville, République du Congo',
}

/** Navigation principale du parcours client (header, menu mobile, barre basse). */
export const CLIENT_NAV = [
  { key: 'home', to: PATHS.home, label: 'Accueil', icon: ICONS.home, isActive: (p) => p === '/' },
  { key: 'places', to: PATHS.establishments, label: 'Établissements', short: 'Lieux', icon: ICONS.places, isActive: (p) => p.startsWith('/etablissements') },
  { key: 'tickets', to: PATHS.myTickets, label: 'Mes tickets', short: 'Ticket', icon: ICONS.ticket, isActive: (p) => p.startsWith('/tickets') || p === PATHS.myTickets },
  { key: 'favorites', to: PATHS.favorites, label: 'Favoris', icon: ICONS.heart, isActive: (p) => p === PATHS.favorites },
]

export const INFO_LINKS = [
  { to: '/#comment-ca-marche', label: 'Comment ça marche' },
  { to: '/#faq', label: 'Questions fréquentes' },
  { to: to.info('a-propos'), label: 'À propos' },
  { to: to.info('conditions'), label: "Conditions d'utilisation" },
  { to: to.info('confidentialite'), label: 'Politique de confidentialité' },
]
