import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  fetchAllTasks,
  apiCreateTask,
  apiUpdateTask,
  apiDeleteTask,
} from '../utils/taskApi'

const TaskContext = createContext()

function sameId(a, b) {
  return String(a) === String(b)
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)

  const reloadTasks = useCallback(async signal => {
    try {
      setTasksError(null)
      setTasksLoading(true)
      const list = await fetchAllTasks(signal)
      setTasks(list)
    } catch (e) {
      if (e.name === 'AbortError') return
      setTasksError(e.message ?? 'Could not load tasks')
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    queueMicrotask(() => {
      reloadTasks(ac.signal)
    })
    return () => ac.abort()
  }, [reloadTasks])

  const addTask = useCallback(async (title, priority) => {
    setTasksError(null)
    try {
      const created = await apiCreateTask({ title, priority })
      setTasks(current => [...current, created])
    } catch (e) {
      setTasksError(e.message ?? 'Could not add task')
      throw e
    }
  }, [])

  const completeTask = useCallback(async task => {
    if (!task) return
    setTasksError(null)
    try {
      const updated = await apiUpdateTask({ ...task, completed: true })
      setTasks(current =>
        current.map(t => (sameId(t.id, task.id) ? updated : t)),
      )
    } catch (e) {
      setTasksError(e.message ?? 'Could not complete task')
      throw e
    }
  }, [])

  const removeTask = useCallback(async id => {
    setTasksError(null)
    try {
      await apiDeleteTask(id)
      setTasks(current => current.filter(t => !sameId(t.id, id)))
    } catch (e) {
      setTasksError(e.message ?? 'Could not remove task')
      throw e
    }
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tasksLoading,
        tasksError,
        reloadTasks: () => reloadTasks(),
        addTask,
        completeTask,
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  return useContext(TaskContext)
}
