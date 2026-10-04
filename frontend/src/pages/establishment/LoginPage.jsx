import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Icon, InfoNote, Logo, TextField } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useTransitionScreen } from '@/hooks/useTransitionScreen'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import styles from './LoginPage.module.css'

const BENEFITS = [
  { icon: ICONS.play, text: 'Ouvrez, mettez en pause ou fermez votre file en un geste.' },
  { icon: ICONS.bell, text: 'Appelez le client suivant : son écran affiche « C’est votre tour ! ».' },
  { icon: ICONS.print, text: 'Créez et imprimez un ticket pour les clients sans smartphone.' },
  { icon: ICONS.activity, text: 'Suivez l’affluence et l’historique de la journée en direct.' },
]

/** Établissement — Connexion gestionnaire (POST /api/auth/login). */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { show } = useTransitionScreen()

  if (isAuthenticated) return <Navigate to={PATHS.proDashboard} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { establishment } = await login(email.trim(), password)
      show({ title: 'Bienvenue,', name: establishment?.name, text: 'Votre espace de gestion est prêt.' })
      navigate(location.state?.from?.pathname ?? PATHS.proDashboard, { replace: true })
    } catch (err) {
      setError(err.status === 401 || err.status === 400 ? 'Email ou mot de passe incorrect.' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Panneau de marque (desktop) */}
      <aside className={styles.brandPanel}>
        <Link to={PATHS.home} aria-label="Ma Place — accueil">
          <Logo size={48} subtitle="Espace établissement" tone="white" />
        </Link>
        <div className={styles.brandText}>
          <h2 className={styles.brandTitle}>Gérez votre file d’attente, simplement.</h2>
          <p>Vos clients patientent où ils veulent et se présentent au bon moment. Vous gardez la maîtrise de votre accueil.</p>
          <ul className={styles.benefits}>
            {BENEFITS.map((b) => (
              <li key={b.text}>
                <span>
                  <Icon name={b.icon} size={18} />
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.brandFoot}>© {new Date().getFullYear()} Ma Place · Brazzaville</p>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.topLinks}>
          <Link to={PATHS.home} className={styles.mobileLogo} aria-label="Ma Place — accueil">
            <Logo size={40} subtitle="Espace pro" />
          </Link>
          <Button variant="ghost" size="sm" icon={ICONS.back} to={PATHS.home}>
            Retour au site
          </Button>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.head}>
              <span className={styles.eyebrow}>
                <Icon name={ICONS.store} size={14} /> Portail gestionnaire
              </span>
              <h1 className="text-h1">Connexion établissement</h1>
              <p className="text-muted">Accédez à votre espace pour gérer votre file d&apos;attente.</p>
            </div>

            <TextField
              label="Email professionnel"
              icon={ICONS.mail}
              type="email"
              autoComplete="email"
              placeholder="contact@pharmacie-centrale.cg"
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
                  <Icon name={showPassword ? ICONS.visibilityOff : ICONS.visibility} size={20} />
                </button>
              }
            />

            {error && (
              <InfoNote tone="error" icon={ICONS.warning}>
                {error}
              </InfoNote>
            )}

            <Button type="submit" size="lg" fullWidth iconRight={ICONS.forward} loading={submitting}>
              Se connecter
            </Button>
          </form>
          <p className={styles.secure}>
            <Icon name={ICONS.shield} size={16} /> Accès sécurisé réservé aux gestionnaires d&apos;accueil
          </p>
        </div>

        <p className={styles.note}>
          Vous êtes un client ? Aucun compte n’est nécessaire :{' '}
          <Link to={PATHS.establishments}>prenez directement votre ticket</Link>.
        </p>
      </main>
    </div>
  )
}
