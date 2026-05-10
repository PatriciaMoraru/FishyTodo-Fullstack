import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import fish1 from '../assets/fish1.png'
import fish2 from '../assets/fish2.png'
import fish3 from '../assets/fish3.png'
import fish4 from '../assets/fish4.png'
import { setDemoJwtRole } from '../utils/taskApi'
import { APP_TITLE } from '../branding.js'
import './LoginView.css'

const ROLES = [
  {
    id: 'VISITOR',
    icon: '👁️',
    name: 'visitor',
    desc: 'browse tasks, read-only',
  },
  {
    id: 'WRITER',
    icon: '✏️',
    name: 'writer',
    desc: 'add & complete tasks',
  },
  {
    id: 'ADMIN',
    icon: '🐡',
    name: 'admin',
    desc: 'full access, delete too',
  },
]

export default function LoginView() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('ADMIN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleDiveIn() {
    setError(null)
    setLoading(true)
    try {
      setDemoJwtRole(selected)
      navigate('/tank')
    } catch (e) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="dashed-frame" aria-hidden="true" />

      <img src={fish1} className="ambient-fish f1" alt="" aria-hidden="true" />
      <img src={fish2} className="ambient-fish f2" alt="" aria-hidden="true" />
      <img src={fish3} className="ambient-fish f3" alt="" aria-hidden="true" />
      <img src={fish4} className="ambient-fish f4" alt="" aria-hidden="true" />

      <div className="login-card" role="main">
        <div className="login-brand">
          <div className="logo">{APP_TITLE}</div>
          <div className="tagline">welcome back to your tank</div>
        </div>

        <span className="role-label">swim in as…</span>
        <div className="role-picker" role="radiogroup" aria-label="Select role">
          {ROLES.map(role => (
            <button
              key={role.id}
              className={`role-card${selected === role.id ? ' selected' : ''}`}
              onClick={() => setSelected(role.id)}
              role="radio"
              aria-checked={selected === role.id}
              aria-label={`${role.name} — ${role.desc}`}
            >
              <span className="role-icon" aria-hidden="true">{role.icon}</span>
              <span className="role-name">{role.name}</span>
              <span className="role-desc">{role.desc}</span>
            </button>
          ))}
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          className="login-btn"
          onClick={handleDiveIn}
          disabled={loading}
        >
          {loading ? 'diving in…' : 'dive in →'}
        </button>
      </div>

      <svg
        className="bottom-waves"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 50 Q 80 15 160 50 T 320 50 T 480 50 T 640 50 T 800 50 T 960 50 T 1120 50 T 1200 50"
          stroke="var(--tert)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0 60 Q 80 30 160 60 T 320 60 T 480 60 T 640 60 T 800 60 T 960 60 T 1120 60 T 1200 60"
          stroke="var(--sec)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
