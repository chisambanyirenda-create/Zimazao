import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { Search, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

interface Listing {
  id: number; cropName: string; price: string; unit: string; quantity: string
  category: string; isActive: boolean; createdAt: string
  farmerName: string | null; farmerId: number | null; location: string | null
}

export default function ListingsSection() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    adminRequest<Listing[]>("/admin/all-listings")
      .then(d => { setListings(d); setLoading(false) })
      .catch(e => { setMsg({ type: "err", text: e.message }); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000)
  }

  const removeListing = async (id: number) => {
    if (!confirm("Remove this listing?")) return
    setActionLoading(id)
    try {
      await adminRequest(`/admin/listings/${id}`, { method: "DELETE" })
      showMsg("ok", "Listing removed")
      load()
    } catch (e: any) { showMsg("err", e.message) }
    setActionLoading(null)
  }

  const filtered = listings.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.cropName.toLowerCase().includes(q) || (l.farmerName || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q)
    const matchFilter = filter === "all" || (filter === "active" ? l.isActive : !l.isActive)
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Listings Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>{listings.length} total listings</p>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4B5563" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by crop, farmer, location..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: CARD, border: `1px solid ${BORDER}` }} />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
              style={{
                background: filter === f ? `${GOLD}22` : "rgba(255,255,255,0.04)",
                color: filter === f ? GOLD : "#64748B",
                border: `1px solid ${filter === f ? `${GOLD}44` : BORDER}`,
              }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Crop", "Farmer", "Price", "Category", "Location", "Status", "Date", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider" style={{ color: "#4B5563" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3">
                  <div className="h-8 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                </td></tr>
              ))}
              {!loading && filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{l.cropName}</p>
                    <p className="text-xs" style={{ color: "#4B5563" }}>#{l.id}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#94A3B8" }}>{l.farmerName || "—"}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: GOLD }}>K{Number(l.price).toFixed(2)}/{l.unit}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}>
                      {l.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{l.location || "—"}</td>
                  <td className="px-4 py-3">
                    {l.isActive
                      ? <span className="flex items-center gap-1 text-xs" style={{ color: "#10B981" }}><CheckCircle className="w-3 h-3" />Active</span>
                      : <span className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}><XCircle className="w-3 h-3" />Removed</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>
                    {new Date(l.createdAt).toLocaleDateString("en-ZM")}
                  </td>
                  <td className="px-4 py-3">
                    {l.isActive && (
                      <button onClick={() => removeListing(l.id)} disabled={actionLoading === l.id}
                        className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: "#374151" }}>No listings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
