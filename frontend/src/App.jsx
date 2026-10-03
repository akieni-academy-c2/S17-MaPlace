import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { Loader } from '@/components/ui'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  )
}
