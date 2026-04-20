'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getToken, getUser, logout, getCurrentUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    const cachedUser = getUser()
    if (cachedUser) {
      setUser(cachedUser)
    }

    try {
      const result = await getCurrentUser()
      if (result.success && result.user) {
        setUser(result.user)
      } else {
        setUser(null)
        logout()
      }
    } catch {
      if (!cachedUser) {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        setUser,
        checkAuth,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
