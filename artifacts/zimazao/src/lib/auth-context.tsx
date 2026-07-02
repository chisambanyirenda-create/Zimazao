import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api, type ApiUser } from "./api"

interface User {
  id: string
  name: string
  email: string
  phone: string
  location: string
  userType: "farmer" | "buyer"
  walletBalance: number
  avatar?: string | null
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "walletBalance"> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string; location?: string; oldPassword?: string; newPassword?: string }) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
  switchMode: (targetMode: "farmer" | "buyer") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function apiUserToUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    location: u.location ?? "",
    userType: u.userType,
    walletBalance: u.walletBalance ?? 0,
    avatar: u.profilePicture ?? null,
    createdAt: u.createdAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("zimazao_user") : null
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed.walletBalance == null) parsed.walletBalance = 0
        setUser(parsed)
      } catch {
        localStorage.removeItem("zimazao_user")
        localStorage.removeItem("zimazao_token")
      }
    }
    setIsLoading(false)

    // The API client fires this when a request comes back 401 with a stale
    // token — reflect the logout in React state so guarded pages redirect.
    const onSessionExpired = () => setUser(null)
    window.addEventListener("zimazao:session-expired", onSessionExpired)
    return () => window.removeEventListener("zimazao:session-expired", onSessionExpired)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { token, user: apiUser } = await api.auth.login(email, password)
      const u = apiUserToUser(apiUser)
      localStorage.setItem("zimazao_token", token)
      localStorage.setItem("zimazao_user", JSON.stringify(u))
      setUser(u)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Omit<User, "id" | "walletBalance"> & { password: string }): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { token, user: apiUser } = await api.auth.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        location: userData.location,
        userType: userData.userType,
      })
      const u = apiUserToUser(apiUser)
      localStorage.setItem("zimazao_token", token)
      localStorage.setItem("zimazao_user", JSON.stringify(u))
      setUser(u)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("zimazao_user")
    localStorage.removeItem("zimazao_token")
  }

  const updateProfile = async (data: {
    name?: string
    phone?: string
    location?: string
    oldPassword?: string
    newPassword?: string
  }) => {
    const updated = await api.auth.updateProfile(data)
    const u = apiUserToUser(updated)
    setUser(u)
    localStorage.setItem("zimazao_user", JSON.stringify(u))
  }

  const updateAvatar = async (file: File) => {
    const updated = await api.auth.uploadAvatar(file)
    const u = apiUserToUser(updated)
    setUser(u)
    localStorage.setItem("zimazao_user", JSON.stringify(u))
  }

  const switchMode = async (targetMode: "farmer" | "buyer") => {
    const { token, user: apiUser } = await api.auth.switchMode(targetMode)
    const u = apiUserToUser(apiUser)
    localStorage.setItem("zimazao_token", token)
    localStorage.setItem("zimazao_user", JSON.stringify(u))
    setUser(u)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, updateAvatar, switchMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
