import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { MailWarning, Loader2, CheckCircle2, X } from "lucide-react"

export function EmailVerifyBanner() {
  const { user } = useAuth()
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [dismissed, setDismissed] = useState(false)

  if (!user || user.emailVerified !== false || dismissed) return null

  const resend = async () => {
    setStatus("sending")
    try { await api.auth.resendVerification(); setStatus("sent") }
    catch { setStatus("idle") }
  }

  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
      <MailWarning className="h-5 w-5 shrink-0 text-amber-300" />
      <div className="flex-1 text-sm">
        <span className="font-semibold text-white">Verify your email</span>
        <span className="text-white/60"> — check your inbox to confirm your account and earn buyer trust.</span>
      </div>
      {status === "sent" ? (
        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Sent
        </span>
      ) : (
        <button
          onClick={resend}
          disabled={status === "sending"}
          className="shrink-0 rounded-lg border border-amber-300/30 bg-amber-300/15 px-3 py-1.5 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-300/25 disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend email"}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="shrink-0 text-white/40 hover:text-white" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
