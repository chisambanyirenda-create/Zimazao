import { useState } from "react"
import { Flag, X, Loader2, CheckCircle2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useLocation } from "wouter"

const REASONS: { value: string; label: string }[] = [
  { value: "scam", label: "Scam or fraud" },
  { value: "fake_listing", label: "Fake or misleading listing" },
  { value: "wrong_price", label: "Incorrect price / price gouging" },
  { value: "counterfeit", label: "Counterfeit goods" },
  { value: "offensive_content", label: "Offensive or inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraudulent activity" },
  { value: "other", label: "Other" },
]

interface Props {
  targetType: "listing" | "user"
  targetId: number
  targetName: string
  onClose: () => void
}

export function ReportModal({ targetType, targetId, targetName, onClose }: Props) {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!user) { navigate("/login"); return }
    if (!reason) { toast({ title: "Please select a reason", variant: "destructive" }); return }

    setLoading(true)
    try {
      const token = localStorage.getItem("zimazao_token")
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
      const res = await fetch(`${base}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetType, targetId, targetName, reason, description }),
      })
      if (!res.ok) throw new Error("Failed")
      setDone(true)
    } catch {
      toast({ title: "Could not submit report", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/15 rounded-lg flex items-center justify-center">
              <Flag className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-bold text-foreground text-base">
              Report {targetType === "listing" ? "Listing" : "User"}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">Report Submitted</h3>
            <p className="text-muted-foreground text-sm mb-1">Thank you for keeping Zimazao safe.</p>
            <p className="text-muted-foreground text-sm mb-6">Our team will review this report urgently.</p>
            <Button onClick={onClose} className="gap-2">Done</Button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Reporting: <span className="font-semibold text-foreground">{targetName}</span>
            </p>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Reason <span className="text-destructive">*</span></label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="">Select a reasonâ€¦</option>
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Additional details <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened in more detailâ€¦"
                className="w-full h-24 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                maxLength={500}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={handleSubmit} disabled={loading || !reason} className="flex-1 bg-red-500 hover:bg-red-600 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Submit Report
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Reports go directly to our admin team and are reviewed within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
