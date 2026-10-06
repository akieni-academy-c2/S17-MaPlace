import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { PageContent, PageTitle } from '@/components/layout'
import { EstablishmentBrowser } from '@/components/establishment'
import { establishmentApi } from '@/services/api'
import { usePolling } from '@/hooks/usePolling'

const PAGE_SIZE = 8

/** Annuaire de tous les établissements. Le paramètre d'URL `?q=` pré-remplit la recherche. */
export default function EstablishmentsPage() {
  const [params] = useSearchParams()
  const { hash } = useLocation()
  const { data, error, loading } = usePolling((signal) => establishmentApi.list({ signal }), { interval: 15000 })

  // Depuis l'icône "recherche" du header : focus direct sur le champ
  useEffect(() => {
    if (hash === '#recherche') document.getElementById('recherche')?.focus({ preventScroll: true })
  }, [hash])

  return (
    <PageContent>
      <PageTitle
        eyebrow="Annuaire"
        title="Établissements"
        text="Administrations, santé, banques, télécoms, beauté… Consultez l’affluence en direct et prenez votre ticket à distance."
      />
      <EstablishmentBrowser
        key={params.get('q') ?? ''}
        establishments={data?.establishments ?? []}
        loading={loading}
        error={error}
        initialQuery={params.get('q') ?? ''}
        searchId="recherche"
        pageSize={PAGE_SIZE}
      />
    </PageContent>
  )
}
