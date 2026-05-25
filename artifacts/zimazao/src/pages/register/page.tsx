import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Leaf, Eye, EyeOff, Loader2, User, Store, CheckCircle2, XCircle } from "lucide-react"

function PasswordStrengthHint({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
    { label: "One number (0–9)", ok: /[0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <ul className="mt-2 space-y-1">
      {checks.map((c) => (
        <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-emerald-600" : "text-muted-foreground"}`}>
          {c.ok
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          }
          {c.label}
        </li>
      ))}
    </ul>
  )
}

function RegisterForm() {
  const [, setLocation] = useLocation()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [userType, setUserType] = useState<"farmer" | "buyer">("farmer")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  })

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter (A–Z)"
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number (0–9)"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) { setError("Please enter your full name"); return }
    if (!formData.email.trim()) { setError("Please enter your email address"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError("Please enter a valid email address"); return }
    if (!formData.phone.trim()) { setError("Please enter your phone number"); return }
    if (!formData.password) { setError("Please create a password"); return }

    const pwError = validatePassword(formData.password)
    if (pwError) { setError(pwError); return }

    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return }
    if (!agreedToTerms) { setError("Please agree to the Terms of Service to continue"); return }

    setLoading(true)
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        userType,
        password: formData.password,
      })

      if (success) {
        setLocation("/dashboard")
      } else {
        setError("This email is already registered. Try signing in instead.")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>Join thousands of Zambian farmers and buyers on Zimazao</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* User Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">I want to...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { type: "farmer", icon: User, title: "Sell Crops", desc: "I'm a farmer" },
                    { type: "buyer", icon: Store, title: "Buy Crops", desc: "I'm a buyer" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setUserType(opt.type)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                        userType === opt.type
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      {userType === opt.type
                        ? <CheckCircle2 className="w-6 h-6 text-primary" />
                        : <opt.icon className="w-6 h-6 text-muted-foreground" />
                      }
                      <span className={`font-semibold text-sm ${userType === opt.type ? "text-primary" : "text-muted-foreground"}`}>{opt.title}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Mwansa"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+260 97 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Lusaka, Zambia"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-11"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-11 pr-11"
                      maxLength={100}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthHint password={formData.password} />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-11"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Terms */}
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  agreedToTerms ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  agreedToTerms ? "bg-primary" : "border-2 border-muted-foreground/40"
                }`}>
                  {agreedToTerms && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm text-muted-foreground leading-snug">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary font-medium hover:underline">Terms & Conditions</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary font-medium hover:underline">Privacy Policy</a>
                </span>
              </button>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating your account...</>
                ) : (
                  "Create Account — It's Free"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return <RegisterForm />
}
