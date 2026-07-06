import { useState } from "react"
import { Link, useLocation } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation()
  const token = new URLSearchParams(window.location.search).get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!token) { setError("This reset link is invalid. Please request a new one."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (!/[A-Z]/.test(password)) { setError("Password must contain at least one uppercase letter"); return }
    if (!/[0-9]/.test(password)) { setError("Password must contain at least one number"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setLoading(true)
    try {
      await api.auth.resetPassword(token, password)
      setDone(true)
      setTimeout(() => setLocation("/login"), 2500)
    } catch (err: any) {
      setError(err?.message || "This reset link is invalid or has expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="relative flex items-center justify-center overflow-hidden py-20 px-4">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-96 rounded-full bg-emerald-500/15 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-96 rounded-full bg-amber-400/12 blur-[110px]" />
        <div className="cine-grain" />
        <div className="relative w-full max-w-md">
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl glow-gold">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_28px_-4px_rgba(52,211,153,0.7)]">
                {done ? <CheckCircle2 className="h-8 w-8 text-emerald-950" /> : <Lock className="h-8 w-8 text-emerald-950" />}
              </div>
              <CardTitle className="font-display text-2xl text-white">
                {done ? "Password updated" : "Set a new password"}
              </CardTitle>
              <CardDescription className="text-white/55">
                {done ? "Redirecting you to sign in…" : "Choose a strong new password for your account."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {done ? (
                <Link href="/login"><Button className="w-full h-12">Go to Sign In</Button></Link>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input id="password" type={show ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pr-12" autoComplete="new-password" />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
                        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input id="confirm" type={show ? "text" : "password"} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12" autoComplete="new-password" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Updating…</> : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
