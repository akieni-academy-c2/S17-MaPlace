import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ClientLayout, ProLayout, ProtectedRoute } from '@/components/layout'
import { PATHS } from '@/constants/routes'

const HomePage = lazy(() => import('@/pages/client/HomePage'))
// 🚧 FT-4 — Tâche 4.1 : importer FavoritesPage et NotFoundPage
const EstablishmentsPage = lazy(() => import('@/pages/client/EstablishmentsPage'))
// 🚧 FT-3 — Tâche 3.1 : importer MyTicketsPage
const InfoPage = lazy(() => import('@/pages/client/InfoPage'))
// 🚧 FT-1 — Tâche 1.1 : importer JoinQueuePage et TicketEndPage
const EstablishmentPage = lazy(() => import('@/pages/client/EstablishmentPage'))
// 🚧 FT-2 — Tâche 2.1 : importer TicketPage et TicketCalledPage

const LoginPage = lazy(() => import('@/pages/establishment/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/establishment/DashboardPage'))
const QueuePage = lazy(() => import('@/pages/establishment/QueuePage'))
const MyTicketsPage = lazy(() => import('@/pages/client/MyTicketsPage'))


/** Pages client dans ClientLayout, pages établissement protégées par ProtectedRoute. */
export const router = createBrowserRouter([
  {
    element: <ClientLayout />,
    children: [
      { path: PATHS.home, element: <HomePage /> },
      // 🚧 FT-4 — Tâche 4.1 : déclarer la route des favoris
      { path: PATHS.establishments, element: <EstablishmentsPage /> },
      // 🚧 FT-3 — Tâche 3.1 : déclarer la route « Mes tickets »
      { path: PATHS.info, element: <InfoPage /> },
      // 🚧 FT-1 — Tâche 1.1 : déclarer les routes « Prendre un ticket » et « Ticket terminé »
      { path: PATHS.establishment, element: <EstablishmentPage /> },
      // 🚧 FT-2 — Tâche 2.1 : déclarer les routes « Mon ticket » et « C'est votre tour »
      { path: PATHS.myTickets, element: <MyTicketsPage /> },
    ],
  },
  { path: PATHS.proLogin, element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProLayout />,
        children: [
          { path: PATHS.proDashboard, element: <DashboardPage /> },
          { path: PATHS.proQueue, element: <QueuePage /> },
        ],
      },
    ],
  },
  // 🚧 FT-4 — Tâche 4.3 : déclarer la page 404 (toute URL inconnue)
])
