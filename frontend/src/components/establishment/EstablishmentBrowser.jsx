import { useMemo, useState } from 'react'
import { Button, EmptyState, FilterChips, Icon, InfoNote, Loader, SearchBar } from '@/components/ui'
import { useFavorites } from '@/hooks/useFavorites'
import { CATEGORIES, describeEstablishment, inferCategory, normalizeText } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import { plural } from '@/utils/format'
import { EstablishmentCard } from './EstablishmentCard'
import styles from './EstablishmentBrowser.module.css'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: QUEUE_STATUS.OPEN, label: 'Ouverts', dot: 'var(--success)' },
  { value: QUEUE_STATUS.PAUSED, label: 'En pause', dot: 'var(--orange)' },
  { value: QUEUE_STATUS.CLOSED, label: 'Fermés', dot: 'var(--neutral)' },
]

const STATUS_ORDER = { OPEN: 0, PAUSED: 1, CLOSED: 2 }

const SORTS = {
  status: { label: 'Ouverts en premier', compare: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name, 'fr') },
  wait: {
    label: 'Moins d’attente',
    compare: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.waiting_count ?? 0) - (b.waiting_count ?? 0),
  },
  name: { label: 'Nom (A → Z)', compare: (a, b) => a.name.localeCompare(b.name, 'fr') },
}

/**
 * Recherche + filtres (état, catégorie) + tri + grille de cartes.
 * `limit` : nombre maximal de cartes affichées (accueil) ; `footer` s'affiche alors sous la grille.
 */
export function EstablishmentBrowser({ establishments, loading, error, initialQuery = '', limit, footer, searchId }) {
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState('ALL')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('status')
  const { isFavorite, toggle } = useFavorites()

  const items = useMemo(
    () =>
      establishments.map((e) => {
        const info = describeEstablishment(e)
        return {
          ...e,
          status: e.queue_status ?? QUEUE_STATUS.CLOSED,
          categoryId: inferCategory(e).id,
          haystack: normalizeText([e.name, info.category.label, info.location, info.address].filter(Boolean).join(' ')),
        }
      }),
    [establishments],
  )

  const statusOptions = STATUS_FILTERS.map((f) => ({
    ...f,
    count: f.value === 'ALL' ? items.length : items.filter((e) => e.status === f.value).length,
  }))

  // N'affiche que les catégories réellement présentes dans les données
  const categoryOptions = useMemo(() => {
    const present = CATEGORIES.filter((c) => items.some((e) => e.categoryId === c.id))
    return [{ value: 'ALL', label: 'Toutes les catégories', icon: ICONS.places }, ...present.map((c) => ({ value: c.id, label: c.label, icon: c.icon }))]
  }, [items])

  const visible = useMemo(() => {
    const q = normalizeText(query)
    return items
      .filter((e) => (status === 'ALL' || e.status === status) && (category === 'ALL' || e.categoryId === category) && (!q || e.haystack.includes(q)))
      .sort(SORTS[sort].compare)
  }, [items, status, category, query, sort])

  const shown = limit ? visible.slice(0, limit) : visible
  const hasFilters = query || status !== 'ALL' || category !== 'ALL'
  const reset = () => {
    setQuery('')
    setStatus('ALL')
    setCategory('ALL')
  }

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <div className={styles.searchRow}>
          <SearchBar
            id={searchId}
            value={query}
            onChange={setQuery}
            placeholder="Nom, catégorie ou quartier…"
            label="Rechercher un établissement"
            className={styles.search}
          />
          <label className={styles.sort}>
            <span className={styles.sortLabel}>
              <Icon name={ICONS.filters} size={16} /> Trier par
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon name={ICONS.chevronDown} size={16} className={styles.sortChevron} />
          </label>
        </div>
        <FilterChips options={statusOptions} value={status} onChange={setStatus} label="Filtrer par état de la file" />
        {categoryOptions.length > 2 && (
          <FilterChips options={categoryOptions} value={category} onChange={setCategory} label="Filtrer par catégorie" className={styles.categories} />
        )}
      </div>

      <div className={styles.resultBar}>
        <span>{loading ? 'Chargement…' : `${plural(visible.length, 'établissement')} ${visible.length > 1 ? 'trouvés' : 'trouvé'}`}</span>
        {hasFilters && (
          <button type="button" className={styles.reset} onClick={reset}>
            <Icon name={ICONS.close} size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {loading && <Loader label="Chargement des établissements…" />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning} title="Impossible de charger les établissements">
          {error.message}
        </InfoNote>
      )}
      {!loading && !error && visible.length === 0 && (
        <EmptyState
          title="Aucun établissement trouvé"
          action={
            hasFilters && (
              <Button variant="outline" icon={ICONS.sync} onClick={reset}>
                Réinitialiser les filtres
              </Button>
            )
          }
        >
          {hasFilters
            ? 'Essayez un autre mot-clé, une autre catégorie ou un autre état de file.'
            : 'Aucun établissement n’est encore inscrit sur Ma Place.'}
        </EmptyState>
      )}

      {shown.length > 0 && (
        <div className={styles.grid}>
          {shown.map((e) => (
            <EstablishmentCard key={e.id} establishment={e} isFavorite={isFavorite(e.id)} onToggleFavorite={toggle} />
          ))}
        </div>
      )}

      {footer && limit && visible.length > limit && footer}
    </div>
  )
}
