import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, Module } from '@/types'
import { DEFAULT_PERMISSIONS, getPortalPath } from './permissions'
import { USER_MOCK_LIST } from '@/data/userMockData'

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => { success: boolean; redirectTo: string }
  logout: () => void
  hasPermission: (module: Module, action: 'read' | 'write' | 'delete') => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  function login(email: string, _password: string) {
    const user = USER_MOCK_LIST.find(u => u.email === email)
    if (!user) return { success: false, redirectTo: '/login' }
    setCurrentUser(user)
    return { success: true, redirectTo: getPortalPath(user.role) }
  }

  function logout() {
    setCurrentUser(null)
  }

  function hasPermission(module: Module, action: 'read' | 'write' | 'delete') {
    if (!currentUser) return false
    return DEFAULT_PERMISSIONS[currentUser.role][module][action]
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
