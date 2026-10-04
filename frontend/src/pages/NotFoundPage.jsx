import { Link } from 'react-router-dom'
import { Button, EmptyState, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 'var(--gutter)', background: 'var(--surface)' }}>
      <div className="stack" style={{ alignItems: 'center', width: '100%', maxWidth: 480, '--stack-gap': 'var(--space-6)' }}>
        <Link to={PATHS.home} aria-label="Ma Place — accueil">
          <Logo size={48} />
        </Link>
        <EmptyState
          icon={ICONS.searchOff}
          title="Page introuvable"
          action={
            <Button icon={ICONS.home} to={PATHS.home}>
              Retour à l&apos;accueil
            </Button>
          }
        >
          Le lien que vous avez suivi n&apos;existe pas ou plus.
        </EmptyState>
      </div>
    </main>
  )
}
