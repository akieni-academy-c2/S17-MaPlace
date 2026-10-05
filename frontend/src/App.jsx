import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { Loader } from '@/components/ui'
import { SplashScreen, TransitionProvider } from '@/components/feedback'
import { router } from './routes'

/** Racine de l'application : session, écrans de transition, routeur et écran d'ouverture. */
export default function App() {
  return (
    <AuthProvider>
      <TransitionProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
        <SplashScreen />
      </TransitionProvider>
    </AuthProvider>
  )
}
