import { useContext } from 'react'
import { TransitionContext } from '@/components/feedback/transitionContext'

/** Écran de transition plein écran : `const { show } = useTransitionScreen()`. */
export function useTransitionScreen() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransitionScreen doit être utilisé dans <TransitionProvider>')
  return ctx
}
