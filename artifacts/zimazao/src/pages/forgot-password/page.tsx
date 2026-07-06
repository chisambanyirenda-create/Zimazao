import { useState } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { KeyRound, Loader2, MailCheck, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("Please enter your email address"); return }
    setLoading(true); setError("")
    try {
      await api.auth.forgotPassword(email)
      setSent(true)
    } catch {
      // Backend always returns success; only network errors land here.
      setSent(true)
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
                {sent ? <MailCheck className="h-8 w-8 text-emerald-950" /> : <KeyRound className="h-8 w-8 text-emerald-950" />}
              </div>
              <CardTitle className="font-display text-2xl text-white">
                {sent ? "Check your email" : "Forgot password?"}
              </CardTitle>
              <CardDescription className="text-white/55">
                {sent
                  ? "If that email is registered, we've sent a reset link. It expires in 1 hour."
                  : "Enter your email and we'll send you a link to reset it."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <Link href="/login">
                  <Button className="w-full h-12 gap-2"><ArrowLeft className="w-4 h-4" /> Back to Sign In</Button>
                </Link>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending…</> : "Send Reset Link"}
                  </Button>
                  <p className="text-center text-muted-foreground">
                    Remembered it?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                  </p>
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
