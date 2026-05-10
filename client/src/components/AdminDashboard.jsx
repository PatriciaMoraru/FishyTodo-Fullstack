import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Fish, CheckCheck, ListTodo, ShieldCheck } from 'lucide-react'
import { fetchAllTasksAdmin } from '../utils/taskApi'
import './AdminDashboard.css'

const PRIORITY_ORDER = ['whale', 'big', 'medium', 'small', 'tiny']
const PRIORITY_LABELS = { whale: 'Whale', big: 'Big', medium: 'Medium', small: 'Small', tiny: 'Tiny' }
const PRIORITY_COLORS = {
  whale:  '#c85a3a',
  big:    '#e08868',
  medium: '#a890c4',
  small:  '#7bbfb5',
  tiny:   '#f0b89c',
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="dash-tooltip">
      <span className="dash-tooltip-name">{PRIORITY_LABELS[name]}</span>
      <span className="dash-tooltip-value">{value} task{value !== 1 ? 's' : ''}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ac = new AbortController()
    fetchAllTasksAdmin(ac.signal)
      .then(setTasks)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active    = total - completed

  const byPriority = PRIORITY_ORDER.map(p => ({
    name:  p,
    value: tasks.filter(t => !t.completed && t.priority === p).length,
  }))

  return (
    <div className="dash screen">
      <div className="dash-inner">

        <header className="dash-header">
          <ShieldCheck size={28} strokeWidth={1.8} className="dash-header-icon" />
          <div>
            <h1 className="dash-title">admin dashboard</h1>
            <p className="dash-subtitle">tank overview · all tasks</p>
          </div>
        </header>

        {loading && <p className="dash-loading">loading tank data…</p>}
        {error   && <p className="dash-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="dash-stats">
              <StatCard
                icon={<Fish size={22} strokeWidth={1.8} />}
                label="total tasks"
                value={total}
              />
              <StatCard
                icon={<ListTodo size={22} strokeWidth={1.8} />}
                label="swimming"
                value={active}
                sub="active in tank"
              />
              <StatCard
                icon={<CheckCheck size={22} strokeWidth={1.8} />}
                label="completed"
                value={completed}
                sub={total > 0 ? `${Math.round((completed / total) * 100)}% done` : '—'}
              />
            </div>

            <div className="dash-chart-card">
              <h2 className="dash-chart-title">active tasks by priority</h2>
              {active === 0 ? (
                <p className="dash-empty">no active tasks in the tank right now</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byPriority} barSize={36} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tickFormatter={n => PRIORITY_LABELS[n]}
                      tick={{ fontFamily: 'Patrick Hand, cursive', fontSize: 13, fill: '#6e4e3a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontFamily: 'Patrick Hand, cursive', fontSize: 12, fill: '#6e4e3a' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(110,78,58,0.06)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {byPriority.map(entry => (
                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
