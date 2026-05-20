import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { useAdminAuth } from "@/lib/admin-auth"
import { Loader2, Eye, EyeOff, Shield, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const { login, isAdmin, checked } = useAdminAuth()
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    if (checked && isAdmin) setLocation("/admin")
  }, [checked, isAdmin])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const zambiaTime = time.toLocaleString("en-ZM", {
    timeZone: "Africa/Lusaka",
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Please fill in all fields"); return }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      setLocation("/admin")
    } else {
      setError(result.error || "Access denied")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #0D1426 50%, #0A0F1E 100%)" }}>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "linear-gradient(#1e3a5f 1px, transparent 1px), linear-gradient(90deg, #1e3a5f 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Time display */}
        <p className="text-center text-xs mb-8 font-mono" style={{ color: "#4B6CB7" }}>
          🕐 {zambiaTime} (CAT)
        </p>

        <div className="rounded-2xl border p-8"
          style={{ background: "rgba(13,20,38,0.95)", borderColor: "rgba(245,158,11,0.3)", backdropFilter: "blur(20px)" }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 relative"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}>
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">ZIMAZAO</h1>
            <p className="text-xs font-semibold tracking-[0.3em] mt-1" style={{ color: "#F59E0B" }}>
              CEO CONTROL ROOM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm p-3 rounded-lg border"
                style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#F87171" }}>
                🚫 {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#94A3B8" }}>
                ADMIN EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", caretColor: "#F59E0B",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#94A3B8" }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", caretColor: "#F59E0B",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all mt-2 flex items-center justify-center gap-2"
              style={{
                background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "white", boxShadow: "0 0 20px rgba(245,158,11,0.3)",
              }}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...</>
              ) : (
                <><Lock className="w-4 h-4" /> ACCESS CONTROL ROOM</>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#1E3A5F" }}>
            🔒 Authorized personnel only — Session expires after 8 hours
          </p>
        </div>
      </div>
    </div>
  )
}
