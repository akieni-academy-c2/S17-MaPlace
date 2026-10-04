import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TransitionScreen } from './TransitionScreen'
import { TransitionContext } from './transitionContext'

/** Durée d'affichage par défaut (ms) et durée du fondu de sortie. */
const DEFAULT_DURATION = 2000
const EXIT_DURATION = 320

/**
 * Fournit `show(options)` à toute l'application. Placé au-dessus du routeur :
 * l'écran reste affiché pendant la navigation qui suit l'action, puis s'efface en fondu.
 * `show` renvoie une promesse résolue à la fin de l'animation.
 */
export function TransitionProvider({ children }) {
  const [screen, setScreen] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  const show = useCallback(({ duration = DEFAULT_DURATION, ...options }) => {
    clearTimers()
    setLeaving(false)
    setScreen({ ...options, duration, id: Date.now() })
    return new Promise((resolve) => {
      timers.current.push(
        setTimeout(() => setLeaving(true), duration),
        setTimeout(() => {
          setScreen(null)
          setLeaving(false)
          resolve()
        }, duration + EXIT_DURATION),
      )
    })
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <TransitionContext.Provider value={value}>
      {children}
      {screen && <TransitionScreen key={screen.id} {...screen} leaving={leaving} />}
    </TransitionContext.Provider>
  )
}
