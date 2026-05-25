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
import { Leaf, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react"

const RATE_LIMIT_KEY = "zimazao_login_attempts"
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

interface LoginRecord { count: number; lockedUntil: number }

function getRecord(): LoginRecord {
  try { return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) ?? "{}") as LoginRecord }
  catch { return { count: 0, lockedUntil: 0 } }
}
function saveRecord(r: LoginRecord) { localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(r)) }

function LoginForm() {
  const [, setLocation] = useLocation()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [formData, setFormData] = useState({ email: "", password: "" })

  function isLocked(): { locked: boolean; remaining: number } {
    const r = getRecord()
    const now = Date.now()
    if (r.lockedUntil && r.lockedUntil > now) {
      return { locked: true, remaining: Math.ceil((r.lockedUntil - now) / 60000) }
    }
    if (r.lockedUntil && r.lockedUntil <= now) {
      saveRecord({ count: 0, lockedUntil: 0 })
    }
    return { locked: false, remaining: 0 }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields"); return
    }

    const { locked, remaining } = isLocked()
    if (locked) {
      setError(`Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`); return
    }

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        saveRecord({ count: 0, lockedUntil: 0 })
        setLocation("/dashboard")
      } else {
        const r = getRecord()
        r.count = (r.count || 0) + 1
        if (r.count >= MAX_ATTEMPTS) {
          r.lockedUntil = Date.now() + LOCKOUT_MS
          saveRecord(r)
          setError("Too many failed attempts. Your account is locked for 15 minutes.")
          setAttemptsLeft(0)
        } else {
          saveRecord(r)
          const left = MAX_ATTEMPTS - r.count
          setAttemptsLeft(left)
          setError(`Incorrect email or password. ${left} attempt${left !== 1 ? "s" : ""} remaining.`)
        }
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  const { locked, remaining } = isLocked()

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
              <CardDescription>Sign in to your Zimazao account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {locked ? (
                  <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Account temporarily locked</p>
                      <p className="text-xs mt-0.5">Too many failed attempts. Try again in {remaining} minute{remaining !== 1 ? "s" : ""}.</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl">
                    {error}
                    {attemptsLeft !== null && attemptsLeft <= 2 && attemptsLeft > 0 && (
                      <p className="text-xs mt-1 font-medium">⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left before lockout</p>
                    )}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                    disabled={locked}
                    maxLength={200}
                    autoComplete="email"
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
                      disabled={locked}
                      maxLength={200}
                      autoComplete="current-password"
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

                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || locked}>
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}
