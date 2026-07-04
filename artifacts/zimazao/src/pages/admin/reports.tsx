import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useLocation } from "wouter"
import { Shield, Flag, Loader2, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Report {
  id: number
  reporter_id: number
  reporter_name: string
  target_type: string
  target_id: number
  target_name: string
  reason: string
  description: string | null
  status: string
  created_at: string
}

const REASON_LABELS: Record<string, string> = {
  scam: "Scam / Fraud",
  fake_listing: "Fake Listing",
  wrong_price: "Wrong Price",
  counterfeit: "Counterfeit",
  offensive_content: "Offensive Content",
  spam: "Spam",
  fraud: "Fraudulent Activity",
  other: "Other",
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-300 border-amber-500/25", icon: <Clock className="w-3 h-3" /> },
  reviewed: { label: "Reviewed", color: "bg-blue-500/20 text-blue-300 border-blue-500/25", icon: <CheckCircle className="w-3 h-3" /> },
  actioned: { label: "Actioned", color: "bg-green-500/20 text-green-300 border-green-500/25", icon: <CheckCircle className="w-3 h-3" /> },
  dismissed: { label: "Dismissed", color: "bg-white/10 text-white/60 border-white/10", icon: <XCircle className="w-3 h-3" /> },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })
}

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchReports = async () => {
    const token = localStorage.getItem("zimazao_token")
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
    try {
      const res = await fetch(`${base}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) { navigate("/"); return }
      const data = await res.json()
      setReports(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: "Failed to load reports", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    if (!(user as any).isAdmin) { navigate("/"); return }
    fetchReports()
  }, [user])

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    const token = localStorage.getItem("zimazao_token")
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""
    try {
      await fetch(`${base}/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      toast({ title: "Report updated" })
    } catch {
      toast({ title: "Update failed", variant: "destructive" })
    } finally {
      setUpdating(null) }
  }

  if (!user) return null

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter)
  const pendingCount = reports.filter((r) => r.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Reports Panel</h1>
                <p className="text-white/60 text-sm">User-reported suspicious activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 font-semibold text-sm">{pendingCount} urgent pending</span>
                </div>
              )}
              <Button variant="outline" onClick={fetchReports} className="gap-2 border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-6 flex-wrap">
            {[
              { label: "Total", value: reports.length, color: "bg-white/10" },
              { label: "Pending", value: reports.filter(r => r.status === "pending").length, color: "bg-amber-500/20" },
              { label: "Reviewed", value: reports.filter(r => r.status === "reviewed").length, color: "bg-blue-500/20" },
              { label: "Actioned", value: reports.filter(r => r.status === "actioned").length, color: "bg-green-500/20" },
              { label: "Dismissed", value: reports.filter(r => r.status === "dismissed").length, color: "bg-gray-500/20" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-2 ${s.color} px-4 py-2 rounded-xl text-sm backdrop-blur-sm`}>
                <span className="font-bold text-white">{s.value}</span>
                <span className="text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "reviewed", "actioned", "dismissed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Flag className="w-9 h-9 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-bold mb-2">No reports</h2>
            <p className="text-muted-foreground">No reports found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report) => {
              const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending
              const isPending = report.status === "pending"
              return (
                <Card key={report.id} className={`border transition-all ${isPending ? "border-amber-500/25 shadow-amber-50 shadow-md" : "border-border"}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPending ? "bg-amber-500/15" : "bg-muted"}`}>
                        <Flag className={`w-5 h-5 ${isPending ? "text-amber-500" : "text-muted-foreground"}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`gap-1 border text-xs ${statusCfg.color}`}>
                            {statusCfg.icon} {statusCfg.label}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">{report.target_type}</Badge>
                          {isPending && <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse">🚨 Urgent</Badge>}
                        </div>

                        <p className="font-bold text-foreground mb-1">
                          {REASON_LABELS[report.reason] ?? report.reason}
                          <span className="font-normal text-muted-foreground text-sm"> — {report.target_name || `${report.target_type} #${report.target_id}`}</span>
                        </p>

                        {report.description && (
                          <p className="text-sm text-muted-foreground mb-2 italic">"{report.description}"</p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Reported by: <strong className="text-foreground">{report.reporter_name || `User #${report.reporter_id}`}</strong></span>
                          <span>Target ID: #{report.target_id}</span>
                          <span>{timeAgo(report.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        {report.status !== "actioned" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(report.id, "actioned")}
                            disabled={updating === report.id}
                            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                          >
                            {updating === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Action
                          </Button>
                        )}
                        {report.status !== "dismissed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(report.id, "dismissed")}
                            disabled={updating === report.id}
                            className="gap-1.5 text-xs h-8"
                          >
                            <XCircle className="w-3 h-3" /> Dismiss
                          </Button>
                        )}
                        {report.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(report.id, "reviewed")}
                            disabled={updating === report.id}
                            className="gap-1.5 text-xs h-8"
                          >
                            Mark Reviewed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
