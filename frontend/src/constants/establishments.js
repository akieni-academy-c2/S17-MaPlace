import { ICONS } from './icons'

/**
 * Catégories d'établissements.
 * L'API n'expose pas (encore) de catégorie : elle est déduite du nom via `keywords`.
 * Pour ajouter une catégorie, il suffit d'ajouter une entrée ici.
 * `accent` : 'green' | 'orange' — couleur du visuel des cartes (pas d'image requise).
 */
export const CATEGORIES = [
  { id: 'pharmacie', label: 'Pharmacie', icon: ICONS.pharmacy, accent: 'green', keywords: ['pharmacie', 'pharma', 'parapharmacie'] },
  {
    id: 'sante',
    label: 'Santé & Bien-être',
    icon: ICONS.health,
    accent: 'green',
    keywords: ['clinique', 'hopital', 'hôpital', 'cabinet', 'medical', 'médical', 'sante', 'santé', 'laboratoire', 'dentiste', 'chu'],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: ICONS.administration,
    accent: 'green',
    keywords: ['administratif', 'administration', 'mairie', 'prefecture', 'préfecture', 'ministere', 'ministère', 'impots', 'impôts', 'etat civil', 'état civil', 'cnss'],
  },
  {
    id: 'banque',
    label: 'Banque',
    icon: ICONS.bank,
    accent: 'orange',
    keywords: ['banque', 'bank', 'credit', 'crédit', 'microfinance', 'mutuelle', 'transfert', 'mobile money'],
  },
  {
    id: 'beaute',
    label: 'Beauté',
    icon: ICONS.beauty,
    accent: 'orange',
    keywords: ['salon', 'coiffure', 'coiffeur', 'beaute', 'beauté', 'barber', 'esthetique', 'esthétique', 'spa', 'onglerie'],
  },
  { id: 'services', label: 'Services', icon: ICONS.services, accent: 'green', keywords: [] },
]

const DEFAULT_CATEGORY = CATEGORIES[CATEGORIES.length - 1]

/** Durée moyenne de passage utilisée pour l'estimation d'attente (en minutes). */
export const AVERAGE_SERVICE_MINUTES = 5

export const DEFAULT_CITY = 'Brazzaville'

/**
 * Contenu de présentation des établissements de démonstration (seed).
 * L'API ne fournit pas encore ces champs : dès qu'elle les expose
 * (category, district, city, address, description, opening_hours), ils sont prioritaires.
 * Clé : nom de l'établissement normalisé (minuscules, sans accents).
 */
const PROFILES = {
  'pharmacie centrale': {
    district: 'Centre-ville',
    address: 'Avenue Amilcar Cabral',
    description:
      "Officine du centre-ville : délivrance d'ordonnances, conseils pharmaceutiques et produits de parapharmacie. Prenez votre ticket avant de vous déplacer.",
    hours: 'Lun – Sam · 8h00 – 20h00',
  },
  'salon elegance': {
    district: 'Plateau des 15 ans',
    description: 'Salon de coiffure et de beauté. Coupes, tresses, soins et mise en beauté, sans rendez-vous grâce à la file en ligne.',
    hours: 'Mar – Sam · 9h00 – 19h00',
  },
  'centre administratif': {
    district: 'Centre-ville',
    description:
      'Accueil administratif : retrait et dépôt de dossiers, légalisations et renseignements. Pensez à préparer vos pièces justificatives.',
    hours: 'Lun – Ven · 8h00 – 15h30',
  },
}

export const normalizeText = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export const getCategory = (idOrLabel) =>
  CATEGORIES.find((c) => c.id === idOrLabel || normalizeText(c.label) === normalizeText(idOrLabel ?? '')) ?? null

/** Catégorie d'un établissement : champ API si présent, sinon déduction depuis le nom. */
export function inferCategory(establishment) {
  const fromApi = establishment?.category && getCategory(establishment.category)
  if (fromApi) return fromApi
  const name = normalizeText(establishment?.name)
  return CATEGORIES.find((c) => c.keywords.some((k) => name.includes(normalizeText(k)))) ?? DEFAULT_CATEGORY
}

/** Estimation de l'attente en minutes (null si personne n'attend). */
export const estimateWaitMinutes = (peopleAhead) =>
  peopleAhead > 0 ? Math.round(peopleAhead * AVERAGE_SERVICE_MINUTES) : peopleAhead === 0 ? 0 : null

/** « ≈ 15 min », « < 5 min », « 1 h 10 » */
export const formatWait = (minutes) => {
  if (minutes == null) return '—'
  if (minutes < AVERAGE_SERVICE_MINUTES) return `< ${AVERAGE_SERVICE_MINUTES} min`
  if (minutes < 60) return `≈ ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `≈ ${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}`
}

/** Initiales pour l'avatar (« Pharmacie Centrale » → « PC »). */
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase()

/**
 * Vue « présentation » d'un établissement : données API + catégorie, localisation,
 * horaires et estimation. Tous les champs optionnels peuvent être null.
 */
export function describeEstablishment(establishment) {
  if (!establishment) return null
  const profile = PROFILES[normalizeText(establishment.name)] ?? {}
  const category = inferCategory(establishment)
  const district = establishment.district ?? profile.district ?? null
  const city = establishment.city ?? profile.city ?? DEFAULT_CITY
  const waiting = establishment.waiting_count ?? null

  return {
    category,
    district,
    city,
    address: establishment.address ?? profile.address ?? null,
    location: [district, city].filter(Boolean).join(', '),
    description: establishment.description ?? profile.description ?? null,
    hours: establishment.opening_hours ?? profile.hours ?? null,
    waitMinutes: estimateWaitMinutes(waiting),
  }
}
