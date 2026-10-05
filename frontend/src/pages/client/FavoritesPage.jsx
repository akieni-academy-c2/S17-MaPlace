import { PageContent, PageTitle } from '@/components/layout'
import { Button, EmptyState, InfoNote, Loader } from '@/components/ui'
import { establishmentApi } from '@/services/api'
import { usePolling } from '@/hooks/usePolling'
import { useFavorites } from '@/hooks/useFavorites'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { plural } from '@/utils/format'
// 🚧 FT-4 — Tâche 4.2 : importer les styles de la page (FavoritesPage.module.css)

/** Établissements mis en favoris sur cet appareil. */
export default function FavoritesPage() {
  const { isFavorite, favorites } = useFavorites() // 🚧 FT-4 — Tâche 4.2 : récupérer aussi toggle
  const { data, error, loading } = usePolling((signal) => establishmentApi.list({ signal }), { interval: 15000 })
  const items = (data?.establishments ?? []).filter((e) => isFavorite(e.id))

  return (
    <PageContent>
      <PageTitle
        eyebrow="Accès rapide"
        title="Mes favoris"
        text={
          favorites.length
            ? `${plural(items.length || favorites.length, 'établissement enregistré', 'établissements enregistrés')} sur cet appareil.`
            : 'Retrouvez ici les établissements que vous fréquentez souvent.'
        }
      />

      {loading && <Loader />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error.message}
        </InfoNote>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={ICONS.heart}
          title="Aucun favori pour le moment"
          action={
            <Button icon={ICONS.search} to={PATHS.establishments}>
              Parcourir les établissements
            </Button>
          }
        >
          Appuyez sur le cœur d’un établissement pour l’ajouter à vos favoris et suivre son affluence en un coup d’œil.
        </EmptyState>
      )}

      {/* 🚧 FT-4 — Tâche 4.2 : afficher la grille des établissements favoris (voir docs/TACHES_FRONTEND.md) */}

      <InfoNote icon={ICONS.shield}>Vos favoris sont enregistrés uniquement dans ce navigateur : aucun compte n’est nécessaire.</InfoNote>
    </PageContent>
  )
}
