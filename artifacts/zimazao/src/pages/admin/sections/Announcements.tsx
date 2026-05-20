import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { Send, RefreshCw, Megaphone } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

interface Announcement {
  id: number; title: string; message: string; target: string; created_at: string
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [form, setForm] = useState({ title: "", message: "", target: "all" })

  const load = () => {
    setLoading(true)
    adminRequest<Announcement[]>("/admin/announcements")
      .then(d => { setAnnouncements(d); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 4000)
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) { showMsg("err", "Title and message are required"); return }
    setSending(true)
    try {
      await adminRequest("/admin/announcements", { method: "POST", body: JSON.stringify(form) })
      showMsg("ok", `Announcement sent to "${form.target}" users!`)
      setForm({ title: "", message: "", target: "all" })
      load()
    } catch (e: any) { showMsg("err", e.message) }
    setSending(false)
  }

  const targetColors: Record<string, { color: string; bg: string }> = {
    all: { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
    farmers: { color: "#10B981", bg: "rgba(16,185,129,0.15)" },
    buyers: { color: GOLD, bg: "rgba(245,158,11,0.15)" },
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Announcements</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Broadcast messages to users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "rgba(245,158,11,0.1)", color: GOLD, border: "1px solid rgba(245,158,11,0.2)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-lg text-sm" style={{
          background: msg.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          color: msg.type === "ok" ? "#10B981" : "#F87171",
          border: `1px solid ${msg.type === "ok" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}>{msg.text}</div>
      )}

      {/* Compose Form */}
      <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2 mb-5">
          <Megaphone className="w-5 h-5" style={{ color: GOLD }} />
          <h3 className="text-sm font-semibold text-white">New Announcement</h3>
        </div>
        <form onSubmit={send} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#94A3B8" }}>TITLE</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title..."
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#94A3B8" }}>MESSAGE</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Write your announcement message here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#94A3B8" }}>SEND TO</label>
            <div className="flex gap-3">
              {[
                { val: "all", label: "All Users" },
                { val: "farmers", label: "Farmers Only" },
                { val: "buyers", label: "Buyers Only" },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setForm({ ...form, target: opt.val })}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: form.target === opt.val ? `${GOLD}22` : "rgba(255,255,255,0.04)",
                    color: form.target === opt.val ? GOLD : "#64748B",
                    border: `1px solid ${form.target === opt.val ? `${GOLD}44` : BORDER}`,
                  }}>{opt.label}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={sending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #D97706)`, color: "white" }}>
            {sending ? "Sending..." : <><Send className="w-4 h-4" /> Send Announcement</>}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Announcement History</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "#374151" }}>No announcements sent yet</div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => {
              const tc = targetColors[a.target] || targetColors.all
              return (
                <div key={a.id} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-white text-sm">{a.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: tc.bg, color: tc.color }}>
                        {a.target}
                      </span>
                      <span className="text-xs" style={{ color: "#4B5563" }}>
                        {new Date(a.created_at).toLocaleDateString("en-ZM")}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{a.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
