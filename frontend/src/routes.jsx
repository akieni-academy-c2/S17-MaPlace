import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ClientLayout, ProLayout, ProtectedRoute } from '@/components/layout'
import { PATHS } from '@/constants/routes'

// Pages client (6)
const HomePage = lazy(() => import('@/pages/client/HomePage'))
const EstablishmentPage = lazy(() => import('@/pages/client/EstablishmentPage'))
const JoinQueuePage = lazy(() => import('@/pages/client/JoinQueuePage'))
const TicketPage = lazy(() => import('@/pages/client/TicketPage'))
const TicketCalledPage = lazy(() => import('@/pages/client/TicketCalledPage'))
const TicketEndPage = lazy(() => import('@/pages/client/TicketEndPage'))

// Pages établissement (3)
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
