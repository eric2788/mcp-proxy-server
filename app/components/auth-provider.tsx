"use client"

import { LoginDialog } from "./login-dialog"
import { createContext, use, useEffect, useState } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => use(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("auth_token", newToken)
    setToken(newToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setToken(null)
    setIsAuthenticated(false)
  }

  // Show loading state
  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginDialog isOpen={true} onLogin={login} />
  }

  return (
    <AuthContext value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext>
  )
}