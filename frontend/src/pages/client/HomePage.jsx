import { useMemo } from 'react'
import { Button, SectionHeader } from '@/components/ui'
import { EstablishmentBrowser } from '@/components/establishment'
import { listEstablishments } from '@/services/establishmentService'
import { usePolling } from '@/hooks/usePolling'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { HeroSection } from './home/HeroSection'
import { QuickAccess } from './home/QuickAccess'
import { TicketCycle } from './home/TicketCycle'
import { HowItWorks } from './home/HowItWorks'
import { FaqSection } from './home/FaqSection'
import { ProBanner } from './home/ProBanner'
import styles from './HomePage.module.css'

/** Nombre d'établissements affichés sur l'accueil, après filtres (la liste complète est sur /etablissements). */
const HOME_LIMIT = 4

/** Client — Accueil (GET /api/establishments). */
export default function HomePage() {
  const { data, error, loading } = usePolling((signal) => listEstablishments({ signal }), { interval: 15000 })
  const establishments = useMemo(() => data?.establishments ?? [], [data])

  return (
    <main className={styles.page}>
      <HeroSection />
      <QuickAccess />

      <section id="etablissements" className={`container ${styles.section}`} aria-labelledby="etablissements-titre">
        <SectionHeader
          id="etablissements-titre"
          eyebrow="En direct"
          title="Établissements disponibles"
          text="Consultez l’état des files en temps réel et prenez votre ticket là où l’attente est la plus courte."
          action={
            <Button variant="ghost" iconRight={ICONS.forward} to={PATHS.establishments}>
              Tout voir
            </Button>
          }
        />
        <EstablishmentBrowser
          establishments={establishments}
          loading={loading}
          error={error}
          limit={HOME_LIMIT}
          footer={
            <Button variant="outline" iconRight={ICONS.forward} to={PATHS.establishments} className={styles.more}>
              Voir tous les établissements
            </Button>
          }
        />
      </section>

      <TicketCycle />
      <HowItWorks />
      <FaqSection />
      <ProBanner />
    </main>
  )
}
