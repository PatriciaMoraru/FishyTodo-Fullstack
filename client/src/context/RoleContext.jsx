import { createContext, useContext, useState, useCallback } from 'react'
import { getDemoRole, logout as apiLogout } from '../utils/taskApi'

const RoleContext = createContext()

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => getDemoRole())

  const refreshRole = useCallback(() => {
    setRole(getDemoRole())
  }, [])

  const canRead   = true
  const canWrite  = role === 'WRITER' || role === 'ADMIN'
  const canDelete = role === 'ADMIN'

  function logoutRole() {
    apiLogout()
    setRole(null)
  }

  return (
    <RoleContext.Provider value={{ role, canRead, canWrite, canDelete, refreshRole, logoutRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
