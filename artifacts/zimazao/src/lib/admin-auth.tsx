import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "zimazao1234"
const SESSION_KEY = "ceo_session"
const TOKEN_KEY = "ceo_token"
const SESSION_DURATION = 8 * 60 * 60 * 1000

interface AdminSession {
  email: string
  loginAt: number
  expiresAt: number
}

interface AdminAuthContextType {
  session: AdminSession | null
  checked: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const s: AdminSession = JSON.parse(stored)
        if (s.expiresAt > Date.now()) {
          setSession(s)
        } else {
          localStorage.removeItem(SESSION_KEY)
          localStorage.removeItem(TOKEN_KEY)
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setChecked(true)
  }, [])

  const login = async (email: string, password: string) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { success: false, error: "Invalid admin credentials" }
    }
    try {
      const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.user?.isAdmin) {
        return { success: false, error: "Access denied — admin account required" }
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      const s: AdminSession = {
        email,
        loginAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
      setSession(s)
      return { success: true }
    } catch {
      return { success: false, error: "Connection error — try again" }
    }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setSession(null)
  }

  return (
    <AdminAuthContext.Provider value={{ session, checked, isAdmin: !!session, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}

// Separate request helper that uses ceo_token
export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) {
    const err: any = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data as T
}
