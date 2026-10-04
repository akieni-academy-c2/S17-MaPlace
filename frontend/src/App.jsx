import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { Loader } from '@/components/ui'
import { TransitionProvider } from '@/components/feedback'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <TransitionProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </TransitionProvider>
    </AuthProvider>
  )
}
