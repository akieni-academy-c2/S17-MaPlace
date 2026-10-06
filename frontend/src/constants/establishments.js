import { ICONS } from './icons'

/**
 * Catégories d'établissements : identifiants de l'enum `establishment_category` renvoyés par l'API.
 * Le frontend ne fait qu'y associer un libellé, une icône et une couleur.
 * `accent` : 'green' | 'orange' - couleur du visuel des cartes (pas d'image requise).
 */
export const CATEGORIES = [
  { id: 'ADMINISTRATION', label: 'Administration', icon: ICONS.administration, accent: 'green' },
  { id: 'SANTE', label: 'Santé', icon: ICONS.health, accent: 'green' },
  { id: 'BANQUE', label: 'Banque', icon: ICONS.bank, accent: 'orange' },
  { id: 'TELECOM', label: 'Télécom', icon: ICONS.telecom, accent: 'green' },
  { id: 'BEAUTE', label: 'Esthétique & Beauté', icon: ICONS.beauty, accent: 'orange' },
]

/** Affichage de repli si l'API renvoie une catégorie inconnue du frontend. */
const UNKNOWN_CATEGORY = { id: null, label: 'Établissement', icon: ICONS.services, accent: 'green' }

/**
 * Durée moyenne d'un passage (en minutes) utilisée par défaut pour l'estimation d'attente.
 * Chaque établissement peut renseigner la sienne depuis son tableau de bord.
 */
export const AVERAGE_SERVICE_MINUTES = 5
export const MIN_SERVICE_MINUTES = 1
export const MAX_SERVICE_MINUTES = 240

/** Texte comparable pour la recherche : sans accents ni majuscules. */
export const normalizeText = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** Catégorie d'un établissement (champ `category` de l'API). */
export const getCategory = (establishment) => CATEGORIES.find((c) => c.id === establishment?.category) ?? UNKNOWN_CATEGORY

/** Durée moyenne de passage d'un établissement (API), ou la valeur par défaut. */
export const serviceMinutesOf = (establishment) =>
  establishment?.averageServiceMinutes ?? establishment?.average_service_minutes ?? AVERAGE_SERVICE_MINUTES

/** Attente estimée en minutes : personnes devant x durée d'un passage. */
export const estimateWaitMinutes = (peopleAhead, serviceMinutes = AVERAGE_SERVICE_MINUTES) =>
  peopleAhead > 0 ? Math.round(peopleAhead * serviceMinutes) : peopleAhead === 0 ? 0 : null

/**
 * Affiche une attente : "< 5 min", "~ 15 min" ou "~ 1 h 10".
 * En dessous d'un passage, on affiche "< durée d'un passage".
 */
export const formatWait = (minutes, serviceMinutes = AVERAGE_SERVICE_MINUTES) => {
  if (minutes == null) return '—'
  if (minutes < serviceMinutes) return `< ${serviceMinutes} min`
  if (minutes < 60) return `≈ ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `≈ ${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}`
}

/** Initiales pour l'avatar ("Mairie de Bacongo" -> "MB"). */
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase()

/** Informations d'affichage d'un établissement : catégorie, localisation, horaires, attente. */
export function describeEstablishment(establishment) {
  if (!establishment) return null
  const serviceMinutes = serviceMinutesOf(establishment)

  return {
    category: getCategory(establishment),
    district: establishment.district ?? null,
    city: establishment.city ?? null,
    address: establishment.address ?? null,
    location: [establishment.district, establishment.city].filter(Boolean).join(', '),
    description: establishment.description ?? null,
    hours: establishment.opening_hours ?? null,
    serviceMinutes,
    waitMinutes: estimateWaitMinutes(establishment.waiting_count ?? null, serviceMinutes),
  }
}
