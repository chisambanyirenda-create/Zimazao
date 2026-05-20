import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, Building2 } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

interface Sponsor {
  id: number; companyName: string; productName: string; productImage: string | null
  description: string | null; price: string | null; targetDisease: string
  contactNumber: string | null; isActive: boolean; createdAt: string
}

const EMPTY = { companyName: "", productName: "", description: "", price: "", targetDisease: "", contactNumber: "", productImage: "" }

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    adminRequest<Sponsor[]>("/admin/sponsors")
      .then(d => { setSponsors(d); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName || !form.productName || !form.targetDisease) {
      showMsg("err", "Company, product name, and target disease are required"); return
    }
    setSaving(true)
    try {
      await adminRequest("/admin/sponsors", { method: "POST", body: JSON.stringify(form) })
      showMsg("ok", "Sponsor added!")
      setForm(EMPTY); setShowForm(false); load()
    } catch (e: any) { showMsg("err", e.message) }
    setSaving(false)
  }

  const toggle = async (s: Sponsor) => {
    setActionLoading(s.id)
    try {
      await adminRequest(`/admin/sponsors/${s.id}`, { method: "PUT", body: JSON.stringify({ ...s, isActive: !s.isActive }) })
      load()
    } catch (e: any) { showMsg("err", e.message) }
    setActionLoading(null)
  }

  const remove = async (id: number) => {
    if (!confirm("Delete this sponsor?")) return
    setActionLoading(id)
    try {
      await adminRequest(`/admin/sponsors/${id}`, { method: "DELETE" })
      showMsg("ok", "Sponsor deleted")
      load()
    } catch (e: any) { showMsg("err", e.message) }
    setActionLoading(null)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
  const labelClass = "block text-xs font-semibold mb-1.5 tracking-wider"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Sponsor Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>{sponsors.filter(s => s.isActive).length} active sponsors</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #D97706)`, color: "white" }}>
            <Plus className="w-4 h-4" /> Add Sponsor
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-lg text-sm" style={{
          background: msg.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          color: msg.type === "ok" ? "#10B981" : "#F87171",
        }}>{msg.text}</div>
      )}

      {showForm && (
        <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid rgba(245,158,11,0.2)` }}>
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: GOLD }} /> New Sponsor
          </h3>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>COMPANY NAME *</label>
              <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. ZamAgro Ltd" /></div>
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>PRODUCT NAME *</label>
              <input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. Pesticide Pro" /></div>
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>TARGET DISEASE *</label>
              <input value={form.targetDisease} onChange={e => setForm({ ...form, targetDisease: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. Late Blight, Rust" /></div>
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>PRICE (ZMW)</label>
              <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputClass} style={inputStyle} placeholder="e.g. 150" /></div>
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>CONTACT NUMBER</label>
              <input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} className={inputClass} style={inputStyle} placeholder="+260..." /></div>
            <div><label className={labelClass} style={{ color: "#94A3B8" }}>PRODUCT IMAGE URL</label>
              <input value={form.productImage} onChange={e => setForm({ ...form, productImage: e.target.value })} className={inputClass} style={inputStyle} placeholder="https://..." /></div>
            <div className="sm:col-span-2"><label className={labelClass} style={{ color: "#94A3B8" }}>DESCRIPTION</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} style={inputStyle} placeholder="Product description..." /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #D97706)`, color: "white" }}>
                {saving ? "Saving..." : "Save Sponsor"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading && [...Array(4)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl" style={{ background: CARD }} />
        ))}
        {!loading && sponsors.map(s => (
          <div key={s.id} className="rounded-xl p-5" style={{
            background: CARD, border: `1px solid ${s.isActive ? "rgba(245,158,11,0.2)" : BORDER}`,
            opacity: s.isActive ? 1 : 0.6,
          }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="font-bold text-white">{s.companyName}</h4>
                <p className="text-sm" style={{ color: "#94A3B8" }}>{s.productName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(s)} disabled={actionLoading === s.id} className="transition-all" title={s.isActive ? "Deactivate" : "Activate"}>
                  {s.isActive
                    ? <ToggleRight className="w-6 h-6" style={{ color: "#10B981" }} />
                    : <ToggleLeft className="w-6 h-6" style={{ color: "#4B5563" }} />
                  }
                </button>
                <button onClick={() => remove(s.id)} disabled={actionLoading === s.id}
                  className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-xs" style={{ color: "#64748B" }}>
              <p>🎯 Target: <span style={{ color: "#94A3B8" }}>{s.targetDisease}</span></p>
              {s.price && <p>💰 Price: <span style={{ color: GOLD }}>K{s.price}</span></p>}
              {s.contactNumber && <p>📞 {s.contactNumber}</p>}
              {s.description && <p className="mt-2 line-clamp-2" style={{ color: "#6B7280" }}>{s.description}</p>}
            </div>
            <div className="mt-3">
              <span className="px-2 py-0.5 rounded-full text-xs" style={{
                background: s.isActive ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)",
                color: s.isActive ? "#10B981" : "#6B7280",
              }}>{s.isActive ? "● Active" : "○ Inactive"}</span>
            </div>
          </div>
        ))}
        {!loading && sponsors.length === 0 && (
          <div className="sm:col-span-2 py-12 text-center rounded-xl" style={{ background: CARD, color: "#374151" }}>
            No sponsors yet — click "Add Sponsor" to get started
          </div>
        )}
      </div>
    </div>
  )
}
