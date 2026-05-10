import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { APP_TITLE } from '../branding.js'
import { logout, getDemoRole } from '../utils/taskApi'
import './Navbar.css'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const role = getDemoRole()

  function handleLogout() {
    logout()
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