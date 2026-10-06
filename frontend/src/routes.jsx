import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ClientLayout, ProLayout, ProtectedRoute } from '@/components/layout'
import { PATHS } from '@/constants/routes'

const HomePage = lazy(() => import('@/pages/client/HomePage'))
const FavoritesPage = lazy(() => import('@/pages/client/FavoritesPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const EstablishmentsPage = lazy(() => import('@/pages/client/EstablishmentsPage'))
// 🚧 FT-3 — Tâche 3.1 : importer MyTicketsPage
const InfoPage = lazy(() => import('@/pages/client/InfoPage'))
const JoinQueuePage = lazy (() => import ('@/pages/client/JoinQueuePage'))
const TicketEndPage = lazy (() => import('@/pages/client/TicketEndPage'))
const EstablishmentPage = lazy(() => import('@/pages/client/EstablishmentPage'))

const TicketPage = lazy(() => import('@/pages/client/TicketPage'))
const TicketCalledPage = lazy(() => import('@/pages/client/TicketCalledPage'))

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
      { path: PATHS.favorites, element: <FavoritesPage /> },
      { path: PATHS.establishments, element: <EstablishmentsPage /> },
      // 🚧 FT-3 — Tâche 3.1 : déclarer la route « Mes tickets »
      { path: PATHS.info, element: <InfoPage /> },
      { path: PATHS.joinQueue, element: <JoinQueuePage/> },
      { path: PATHS.ticketEnd, element: <TicketEndPage/> },
      { path: PATHS.establishment, element: <EstablishmentPage /> },

       { path: PATHS.ticket, element: <TicketPage /> },
      { path: PATHS.ticketCalled, element: <TicketCalledPage /> },

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
  { path: '*', element: <NotFoundPage /> },
])
