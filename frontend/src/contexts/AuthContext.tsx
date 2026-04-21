'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/lib/api-client'
import type { LoginRequest, SignupRequest, UpdateProfileRequest, User } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  signup: (data: SignupRequest) => Promise<void>
  logout: () => void
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const userData = await authApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    localStorage.setItem('auth_token', response.access_token)
    setUser(response.user)
  }

  const signup = async (data: SignupRequest) => {
    const response = await authApi.signup(data)
    localStorage.setItem('auth_token', response.access_token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const updateProfile = async (data: UpdateProfileRequest) => {
    const updated = await authApi.updateProfile(data)
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
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
