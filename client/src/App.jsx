import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import TankView from './components/TankView'
import ListView from './components/ListView'
import SettingsView from './components/SettingsView'
import LandingView from './components/LandingView'
import LoginView from './components/LoginView'
import MoodReefView from './components/MoodReefView'
import AdminDashboard from './components/AdminDashboard'
import { TaskProvider } from './context/TaskContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { MoodProvider } from './context/MoodContext'
import { RoleProvider } from './context/RoleContext'
import { isLoggedIn, getDemoRole } from './utils/taskApi'
import './App.css'
import './style.css'

function ProtectedRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (getDemoRole() !== 'ADMIN') return <Navigate to="/tank" replace />
  return <Outlet />
}

function HomeView() {
  const { listView } = useTheme()
  return listView ? <ListView /> : <TankView />
}

function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <ThemeProvider>
    <RoleProvider>
    <TaskProvider>
    <MoodProvider>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/login" element={<LoginView />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/tank" element={<HomeView />} />
              <Route path="/mood" element={<MoodReefView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </MoodProvider>
    </TaskProvider>
    </RoleProvider>
    </ThemeProvider>
  )
}