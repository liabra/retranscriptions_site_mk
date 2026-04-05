import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { getErrorMessage } from '../services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(email, password)
      navigate('/espace-prestataire')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(90,138,114,.18) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'white',
        borderRadius: 6,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--navy)', padding: '2rem',
          textAlign: 'center', borderBottom: '3px solid var(--sky)',
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.8rem', fontWeight: 600, color: 'white',
            letterSpacing: '.04em', marginBottom: '.3rem',
          }}>
            A2C <sup style={{
              fontSize: '.5em', color: 'var(--accent)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 500,
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}>retranscription</sup>
          </div>
          <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.45)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Espace prestataire
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Connectez-vous avec les identifiants fournis par Mme Kpodar Muriel pour accéder à vos missions.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="fg">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr" required autoFocus
              />
            </div>
            <div className="fg">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '.9rem', marginTop: '.5rem', fontSize: '.9rem' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <a href="/" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
