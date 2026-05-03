import { useTaskContext } from '../context/TaskContext'
import './TaskApiStatus.css'

export default function TaskApiStatus() {
  const { tasksLoading, tasksError, reloadTasks } = useTaskContext()
  if (!tasksLoading && !tasksError) return null
  return (
    <div className="task-api-status" role="status">
      {tasksLoading && <span className="task-api-status__msg">Loading tasks…</span>}
      {!tasksLoading && tasksError && (
        <>
          <span className="task-api-status__msg task-api-status__err" role="alert">
            {tasksError}
          </span>
          <button type="button" className="task-api-status__retry" onClick={() => reloadTasks()}>
            Retry
          </button>
        </>
      )}
    </div>
  )
}
