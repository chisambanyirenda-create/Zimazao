import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api, type ApiUser } from "./api"

interface User {
  id: string
  name: string
  email: string
  phone: string
  location: string
  userType: "farmer" | "buyer"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id"> & { password: string }) => Promise<boolean>
  logout: () => void
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
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("zimazao_user") : null
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("zimazao_user")
        localStorage.removeItem("zimazao_token")
      }
    }
    setIsLoading(false)
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

  const register = async (userData: Omit<User, "id"> & { password: string }): Promise<boolean> => {
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
