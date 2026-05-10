import { NavLink, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useRole } from '../context/RoleContext'
import { APP_TITLE } from '../branding.js'
import './Navbar.css'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { role, logoutRole } = useRole()
  const navigate = useNavigate()

  function handleLogout() {
    logoutRole()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/tank" className="navbar-title">{APP_TITLE}</NavLink>
      </div>
      <div className="navbar-links">
        <NavLink to="/tank" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Tank
        </NavLink>
        <NavLink to="/mood" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Mood Reef
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Settings
        </NavLink>
        {role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active nav-link--admin' : 'nav-link nav-link--admin'}>
            <ShieldCheck size={15} strokeWidth={2} />
            Admin
          </NavLink>
        )}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '☾' : '☀'}
        </button>
        <button className="nav-logout" onClick={handleLogout} title={`Logged in as ${role}`}>
          {role.toLowerCase()} ✕
        </button>
      </div>
    </nav>
  )
}