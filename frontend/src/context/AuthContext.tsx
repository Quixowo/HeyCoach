/**
 * AuthContext — bootstraps via GET /auth/me on load.
 * A 401 there means logged-out (no error banner).
 * Exposes { user, login, register, logout, status }.
 *
 * The 'auth:expired' CustomEvent from client.ts triggers a redirect to /login.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import type { User, LoginPayload, RegisterPayload } from '../api/auth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const navigate = useNavigate()

  // Bootstrap: check if already logged in.
  useEffect(() => {
    authApi.getMe().then((me) => {
      setUser(me)
      setStatus(me ? 'authenticated' : 'unauthenticated')
    })
  }, [])

  // Listen for auth:expired events from the 401 interceptor.
  useEffect(() => {
    const handler = () => {
      setUser(null)
      setStatus('unauthenticated')
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [navigate])

  const login = useCallback(async (payload: LoginPayload) => {
    const me = await authApi.login(payload)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const me = await authApi.register(payload)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setStatus('unauthenticated')
    navigate('/login', { replace: true })
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
