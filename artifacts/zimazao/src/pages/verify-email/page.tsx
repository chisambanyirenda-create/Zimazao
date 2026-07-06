import { useEffect, useState } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react"
import { api } from "@/lib/api"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? ""
    if (!token) { setStatus("error"); setMessage("No verification token found in the link."); return }
    api.auth.verifyEmail(token)
      .then((r) => { setStatus("ok"); setMessage(r.message || "Your email is verified.") })
      .catch((e: any) => { setStatus("error"); setMessage(e?.message || "This verification link is invalid or has expired.") })
  }, [])

  const Icon = status === "ok" ? CheckCircle2 : status === "error" ? XCircle : MailCheck

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
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${status === "error" ? "bg-gradient-to-br from-rose-400 to-rose-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"} shadow-[0_0_28px_-4px_rgba(52,211,153,0.7)]`}>
                {status === "loading" ? <Loader2 className="h-8 w-8 animate-spin text-emerald-950" /> : <Icon className="h-8 w-8 text-emerald-950" />}
              </div>
              <CardTitle className="font-display text-2xl text-white">
                {status === "loading" ? "Verifying…" : status === "ok" ? "Email verified" : "Verification failed"}
              </CardTitle>
              <CardDescription className="text-white/55">{message}</CardDescription>
            </CardHeader>
            <CardContent>
              {status !== "loading" && (
                <Link href="/dashboard">
                  <Button className="w-full h-12">Go to Dashboard</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
