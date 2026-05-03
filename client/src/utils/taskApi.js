/** Lab 7 demo: API origin when `VITE_API_BASE_URL` is not set */
export const DEMO_API_BASE_URL = 'http://localhost:5112'

/** Lab 7 demo role for `/token` when env / localStorage role not set (full CRUD) */
export const DEMO_JWT_ROLE = 'ADMIN'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? DEMO_API_BASE_URL
const TOKEN_STORAGE = 'fishytodo_jwt'
const ROLE_STORAGE = 'fishytodo_jwt_role'

const DEFAULT_ROLE = import.meta.env.VITE_DEMO_JWT_ROLE ?? DEMO_JWT_ROLE

export function getDemoRole() {
  return localStorage.getItem(ROLE_STORAGE) || DEFAULT_ROLE
}

/**
 * Lab 7 demo: switch role and clear token so the next request mints a fresh JWT.
 * Valid roles: VISITOR, WRITER, ADMIN
 */
export function setDemoJwtRole(role) {
  if (!role) return
  localStorage.setItem(ROLE_STORAGE, String(role).toUpperCase())
  localStorage.removeItem(TOKEN_STORAGE)
}

function ensureDemoRoleStored() {
  if (localStorage.getItem(ROLE_STORAGE) == null) {
    localStorage.setItem(ROLE_STORAGE, DEFAULT_ROLE)
  }
}

export function clearJwt() {
  localStorage.removeItem(TOKEN_STORAGE)
}

async function fetchToken(role) {
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Could not get token (${res.status})`)
  }
  const data = await res.json()
  if (!data.token) throw new Error('Token response missing token field')
  return data.token
}

export async function ensureJwt() {
  ensureDemoRoleStored()
  let token = localStorage.getItem(TOKEN_STORAGE)
  if (token) return token
  const role = getDemoRole()
  token = await fetchToken(role)
  localStorage.setItem(TOKEN_STORAGE, token)
  return token
}

async function parseError(res) {
  try {
    const j = await res.json()
    return j.error || j.title || j.message || JSON.stringify(j)
  } catch {
    return `${res.status} ${res.statusText}`
  }
}

async function authorizedFetch(path, init = {}, retryOn401 = true) {
  const token = await ensureJwt()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  if (res.status === 401 && retryOn401) {
    clearJwt()
    return authorizedFetch(path, init, false)
  }
  return res
}

export function mapTaskFromApi(raw) {
  return {
    id: String(raw.id),
    title: raw.title,
    priority: raw.priority,
    completed: raw.completed,
    createdAt: raw.createdAt,
  }
}

async function fetchTasksPage(page, pageSize = 100, signal) {
  const res = await authorizedFetch(`/api/tasks?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    signal,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchAllTasks(signal) {
  const pageSize = 100
  let page = 1
  const tasks = []
  while (true) {
    const data = await fetchTasksPage(page, pageSize, signal)
    const slice = Array.isArray(data.items) ? data.items : []
    for (const t of slice) {
      tasks.push(mapTaskFromApi(t))
    }
    const totalPages = data.totalPages ?? 1
    if (page >= totalPages || slice.length === 0) break
    page += 1
  }
  return tasks
}

export async function apiCreateTask({ title, priority }) {
  const res = await authorizedFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, priority, completed: false }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return mapTaskFromApi(data)
}

export async function apiUpdateTask(task) {
  const res = await authorizedFetch(`/api/tasks/${task.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: task.title,
      priority: task.priority,
      completed: task.completed,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return mapTaskFromApi(data)
}

export async function apiDeleteTask(id) {
  const res = await authorizedFetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  })
  if (res.status === 404) throw new Error('Task not found')
  if (!res.ok) throw new Error(await parseError(res))
}
