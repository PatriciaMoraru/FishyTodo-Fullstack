import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCompletedTasks } from '../utils/taskApi'
import { getFishImage } from '../utils/fishImages'
import './HistoryView.css'

function formatCompletedAt(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

export default function HistoryView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    fetchCompletedTasks(ac.signal)
      .then(list => {
        const sorted = [...list].sort((a, b) => {
          const ta = a.completedAt ? new Date(a.completedAt) : 0
          const tb = b.completedAt ? new Date(b.completedAt) : 0
          return tb - ta
        })
        setTasks(sorted)
        setError(null)
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message ?? 'Could not load history')
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  return (
    <div className="list-view screen">
      <div className="list-inner">
        <div className="history-header">
          <h2 className="history-title">Completed Tasks</h2>
          <Link to="/tank" className="history-back">← back to tank</Link>
        </div>

        {loading && <p className="history-status">loading history…</p>}
        {error   && <p className="history-status history-status--error">{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <p className="history-status">no completed tasks yet</p>
        )}

        <ul className="history-list">
          {tasks.map(task => (
            <li key={task.id} className="history-item">
              <img
                src={getFishImage(task.priority)}
                className="history-fish"
                alt=""
                aria-hidden="true"
              />
              <span className="history-task-title">{task.title}</span>
              <span className="history-date">{formatCompletedAt(task.completedAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
