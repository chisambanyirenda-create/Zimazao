

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session (would connect to Replit backend)
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("zimazao_user") : null
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // This would call your Replit backend
      // const response = await fetch('YOUR_REPLIT_BACKEND/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      
      // Demo user for frontend testing
      const demoUser: User = {
        id: "1",
        name: "John Mwansa",
        email: email,
        phone: "+260 97 123 4567",
        location: "Lusaka, Zambia",
        userType: "farmer",
      }
      
      setUser(demoUser)
      localStorage.setItem("zimazao_user", JSON.stringify(demoUser))
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
      // This would call your Replit backend
      // const response = await fetch('YOUR_REPLIT_BACKEND/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // })
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      }
      
      setUser(newUser)
      localStorage.setItem("zimazao_user", JSON.stringify(newUser))
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
