import { Button, EmptyState, Logo } from '@/components/ui'
import { PATHS } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 'var(--space-lg)' }}>
      <div className="stack" style={{ alignItems: 'center' }}>
        <Logo />
        <EmptyState icon="search_off" title="Page introuvable" action={<Button to={PATHS.home}>Retour à l&apos;accueil</Button>}>
          Le lien que vous avez suivi n&apos;existe pas ou plus.
        </EmptyState>
      </div>
    </main>
  )
}
