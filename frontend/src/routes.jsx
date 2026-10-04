import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ClientLayout, ProLayout, ProtectedRoute } from '@/components/layout'
import { PATHS } from '@/constants/routes'

// Pages client
const HomePage = lazy(() => import('@/pages/client/HomePage'))
const EstablishmentsPage = lazy(() => import('@/pages/client/EstablishmentsPage'))
const FavoritesPage = lazy(() => import('@/pages/client/FavoritesPage'))
const MyTicketsPage = lazy(() => import('@/pages/client/MyTicketsPage'))
const InfoPage = lazy(() => import('@/pages/client/InfoPage'))
const EstablishmentPage = lazy(() => import('@/pages/client/EstablishmentPage'))
const JoinQueuePage = lazy(() => import('@/pages/client/JoinQueuePage'))
const TicketPage = lazy(() => import('@/pages/client/TicketPage'))
const TicketCalledPage = lazy(() => import('@/pages/client/TicketCalledPage'))
const TicketEndPage = lazy(() => import('@/pages/client/TicketEndPage'))

// Pages établissement
const LoginPage = lazy(() => import('@/pages/establishment/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/establishment/DashboardPage'))
const QueuePage = lazy(() => import('@/pages/establishment/QueuePage'))

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Table de routage de l'application (voir PATHS dans constants/routes.js). */
export const router = createBrowserRouter([
  {
    element: <ClientLayout />,
    children: [
      { path: PATHS.home, element: <HomePage /> },
      { path: PATHS.establishments, element: <EstablishmentsPage /> },
      { path: PATHS.favorites, element: <FavoritesPage /> },
      { path: PATHS.myTickets, element: <MyTicketsPage /> },
      { path: PATHS.info, element: <InfoPage /> },
      { path: PATHS.establishment, element: <EstablishmentPage /> },
      { path: PATHS.joinQueue, element: <JoinQueuePage /> },
      { path: PATHS.ticket, element: <TicketPage /> },
      { path: PATHS.ticketCalled, element: <TicketCalledPage /> },
      { path: PATHS.ticketEnd, element: <TicketEndPage /> },
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
