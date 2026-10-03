import { useMemo, useState } from 'react'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, EmptyState, FilterChips, Icon, InfoNote, Loader, QueueStatusBadge, SearchBar, TicketNumber } from '@/components/ui'
import { EstablishmentCard } from '@/components/establishment'
import { listEstablishments } from '@/services/establishmentService'
import { usePolling } from '@/hooks/usePolling'
import { useFavorites } from '@/hooks/useFavorites'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { plural } from '@/utils/format'
import styles from './HomePage.module.css'

const FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'OPEN', label: 'Ouvertes', dot: 'var(--color-status-open)' },
  { value: 'PAUSED', label: 'En pause', dot: 'var(--color-status-paused)' },
  { value: 'CLOSED', label: 'Fermées', dot: 'var(--color-status-closed)' },
]

const normalize = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Client 1/6 — Accueil + recherche des établissements (GET /api/establishments). */
export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const { isFavorite, toggle } = useFavorites()
  const { data, error, loading } = usePolling((signal) => listEstablishments({ signal }), { interval: 15000 })

  const establishments = useMemo(() => data?.establishments ?? [], [data])
  const visible = useMemo(
    () =>
      establishments.filter((e) => {
        const status = e.queue_status ?? 'CLOSED'
        return (filter === 'ALL' || status === filter) && normalize(e.name).includes(normalize(query.trim()))
      }),
    [establishments, filter, query],
  )
  const favorites = establishments.filter((e) => isFavorite(e.id))

  return (
    <>
      <AppHeader
        section="Accueil"
        actions={
          <Button variant="secondary" size="sm" icon={ICONS.store} to={PATHS.proLogin} title="Espace gestionnaire">
            <span className={styles.proLabel}>Mon établissement</span>
          </Button>
        }
      />
      <PageContent width="wide">
        <section className={styles.hero}>
          <span className={styles.kicker}>
            <Icon name={ICONS.bolt} size={18} filled /> Votre file d&apos;attente, simplement.
          </span>
          <h1 className={styles.heroTitle}>Ne perdez plus votre temps debout.</h1>
          <p className={styles.heroText}>
            Rejoignez votre file à distance sans créer de compte et suivez votre tour en direct sur votre mobile.
          </p>
          <Button href="#etablissements" iconRight={ICONS.down} className={styles.heroCta}>
            Trouver un établissement
          </Button>

          {/* Aperçu décoratif d'un ticket (desktop uniquement) */}
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.previewTicket}>
              <div className={styles.previewHead}>
                <span className="text-overline">Votre ticket</span>
                <QueueStatusBadge status="OPEN" />
              </div>
              <TicketNumber number={12} size="xl" />
              <div className={styles.previewStats}>
                <span>
                  <strong>3</strong> devant vous
                </span>
                <span>
                  <Icon name={ICONS.sync} size={16} /> En direct
                </span>
              </div>
            </div>
          </div>
        </section>

        {favorites.length > 0 && (
          <section className="stack" style={{ '--stack-gap': 'var(--space-sm)' }}>
            <h2 className={styles.sectionTitle}>
              <Icon name={ICONS.star} filled className={styles.star} /> Mes favoris
            </h2>
            <div className={styles.grid}>
              {favorites.map((e) => (
                <EstablishmentCard key={e.id} establishment={e} isFavorite onToggleFavorite={toggle} />
              ))}
            </div>
          </section>
        )}

        <section id="etablissements" className={styles.list}>
          <div className={styles.listHeader}>
            <h2 className={styles.sectionTitle}>Établissements</h2>
            <span className="text-label-md text-muted">{plural(visible.length, 'disponible')}</span>
          </div>
          <div className={styles.filters}>
            <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un établissement..." />
            <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrer par état de la file" />
          </div>

          {loading && <Loader />}
          {error && <InfoNote tone="error" icon={ICONS.warning}>{error.message}</InfoNote>}
          {!loading && !error && visible.length === 0 && (
            <EmptyState title="Aucun établissement trouvé">
              Essayez de modifier votre mot-clé ou de réinitialiser les filtres.
            </EmptyState>
          )}
          <div className={styles.grid}>
            {visible.map((e) => (
              <EstablishmentCard key={e.id} establishment={e} isFavorite={isFavorite(e.id)} onToggleFavorite={toggle} />
            ))}
          </div>
        </section>
      </PageContent>
    </>
  )
}
