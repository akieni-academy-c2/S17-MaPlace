import { useContext } from 'react'
import { TransitionContext } from '@/components/feedback/transitionContext'

/** Accès à l'écran de transition : `const { show } = useTransitionScreen()`. */
export function useTransitionScreen() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransitionScreen doit être utilisé dans <TransitionProvider>')
  return ctx
}
