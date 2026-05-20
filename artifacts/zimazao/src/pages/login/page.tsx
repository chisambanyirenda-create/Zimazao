
import { useState } from "react"
import { Link } from "wouter"
import { useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Leaf, Eye, EyeOff, Loader2, ShieldCheck, User } from "lucide-react"

const QUICK_LOGINS = [
  {
    label: "Admin",
    icon: ShieldCheck,
    email: "admin@gmail.com",
    password: "zimazao1234",
    color: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    label: "Regular User",
    icon: User,
    email: "user@zimazao.zm",
    password: "zimazao1234",
    color: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100",
    badge: "bg-green-100 text-green-700",
  },
]

function LoginForm() {
  const [, setLocation] = useLocation()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        setLocation("/dashboard")
      } else {
        setError("Incorrect email or password. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  const fillQuickLogin = (email: string, password: string) => {
    setFormData({ email, password })
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Zimazao account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-center text-muted-foreground">
                  {"Don't have an account? "}
                  <Link href="/register" className="text-primary font-medium hover:underline">
                    Register here
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wide">
                Quick Login (Test Accounts)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_LOGINS.map(({ label, icon: Icon, email, password, color, badge }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => fillQuickLogin(email, password)}
                    className={`flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left transition-colors ${color}`}
                  >
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                    <span className="text-xs font-mono break-all">{email}</span>
                    <span className="text-xs font-mono text-muted-foreground">{password}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Click a card to fill the form, then press Sign In
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <LoginForm />
  )
}
