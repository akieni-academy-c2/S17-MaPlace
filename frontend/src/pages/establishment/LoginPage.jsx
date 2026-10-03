import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Icon, InfoNote, Logo, StatusBadge, TextField } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import styles from './LoginPage.module.css'

/** Établissement 1/2 — Connexion gestionnaire (POST /api/auth/login). */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={PATHS.proDashboard} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from?.pathname ?? PATHS.proDashboard, { replace: true })
    } catch (err) {
      setError(err.status === 401 || err.status === 400 ? 'Email ou mot de passe incorrect.' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.wrapper}>
        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.brand}>
              <span className={styles.logo}>
                <Logo size={80} />
              </span>
              <StatusBadge tone="waiting" icon={ICONS.store}>
                Portail pro
              </StatusBadge>
              <h1 className="text-headline-lg">Connexion établissement</h1>
              <p className="text-body-md text-muted">Accédez à votre espace pour gérer votre file d&apos;attente.</p>
            </div>

            <TextField
              label="Email professionnel"
              aside={<span className="text-body-sm text-muted">Requis</span>}
              icon={ICONS.mail}
              type="email"
              autoComplete="email"
              placeholder="contact@pharmacie-centrale.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Mot de passe"
              icon={ICONS.lock}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Icon name={showPassword ? ICONS.visibilityOff : ICONS.visibility} />
                </button>
              }
            />

            {error && (
              <InfoNote tone="error" icon={ICONS.warning}>
                {error}
              </InfoNote>
            )}

            <Button type="submit" fullWidth iconRight={ICONS.forward} loading={submitting}>
              Se connecter
            </Button>
          </form>
          <p className={styles.secure}>
            <Icon name={ICONS.shield} size={20} /> Accès sécurisé pour gestionnaires d&apos;accueil
          </p>
        </div>

        <InfoNote tone="plain" icon={ICONS.info} className={styles.after}>
          Après connexion, vous accédez directement à la gestion de file de votre établissement.
        </InfoNote>
        <nav className={styles.links}>
          <Button variant="ghost" size="sm" to={PATHS.home}>
            Retour à l&apos;accueil client
          </Button>
        </nav>
      </main>
    </div>
  )
}
