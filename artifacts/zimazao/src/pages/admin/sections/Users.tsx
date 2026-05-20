import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { Search, Ban, Clock, Crown, Trash2, ShieldCheck, RefreshCw, UserCheck } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

interface User {
  id: number; name: string; email: string; userType: string; isAdmin: boolean
  isBanned: boolean; bannedUntil: string | null; banReason: string | null
  createdAt: string; location: string | null; phone: string | null
}

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "farmer" | "buyer" | "banned">("all")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: string; name: string } | null>(null)
  const [suspendDays, setSuspendDays] = useState("7")

  const load = () => {
    setLoading(true)
    adminRequest<User[]>("/admin/users")
      .then(d => { setUsers(d); setLoading(false) })
      .catch(e => { setMsg({ type: "err", text: e.message }); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const action = async (id: number, type: string, extra?: any) => {
    setActionLoading(id)
    try {
      if (type === "ban") await adminRequest(`/admin/users/${id}/ban`, { method: "POST", body: JSON.stringify({ reason: extra || "Banned by admin" }) })
      if (type === "suspend") await adminRequest(`/admin/users/${id}/suspend`, { method: "POST", body: JSON.stringify({ days: Number(extra) || 7 }) })
      if (type === "unban") await adminRequest(`/admin/users/${id}/unban`, { method: "POST" })
      if (type === "upgrade") await adminRequest(`/admin/users/${id}/upgrade-pro`, { method: "POST" })
      if (type === "delete") await adminRequest(`/admin/users/${id}`, { method: "DELETE" })
      showMsg("ok", `Action "${type}" completed`)
      load()
    } catch (e: any) {
      showMsg("err", e.message)
    }
    setActionLoading(null)
    setConfirmAction(null)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.location || "").toLowerCase().includes(q)
    const matchFilter = filter === "all" || (filter === "banned" ? u.isBanned : u.userType === filter)
    return matchSearch && matchFilter
  })

  const statusBadge = (u: User) => {
    if (u.isAdmin) return { text: "Admin", color: GOLD, bg: "rgba(245,158,11,0.15)" }
    if (u.isBanned && !u.bannedUntil) return { text: "Banned", color: "#EF4444", bg: "rgba(239,68,68,0.15)" }
    if (u.isBanned && u.bannedUntil) return { text: "Suspended", color: "#F97316", bg: "rgba(249,115,22,0.15)" }
    return { text: u.userType === "farmer" ? "Farmer" : "Buyer", color: "#10B981", bg: "rgba(16,185,129,0.15)" }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>{users.length} total users</p>
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

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-xl p-6 w-80" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-bold mb-2">Confirm Action</h3>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              {confirmAction.type === "delete" ? `Permanently delete "${confirmAction.name}"?` :
               confirmAction.type === "ban" ? `Ban "${confirmAction.name}" permanently?` :
               confirmAction.type === "suspend" ? `Suspend "${confirmAction.name}" for how many days?` :
               `Perform "${confirmAction.type}" on "${confirmAction.name}"?`}
            </p>
            {confirmAction.type === "suspend" && (
              <input type="number" value={suspendDays} onChange={e => setSuspendDays(e.target.value)} min="1" max="365"
                className="w-full px-3 py-2 rounded-lg text-sm mb-4 text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>Cancel</button>
              <button onClick={() => action(confirmAction.id, confirmAction.type, confirmAction.type === "suspend" ? suspendDays : undefined)}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: confirmAction.type === "delete" ? "#EF4444" : GOLD, color: "white" }}>
                {actionLoading === confirmAction.id ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4B5563" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, location..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: CARD, border: `1px solid ${BORDER}` }} />
        </div>
        <div className="flex gap-2">
          {(["all", "farmer", "buyer", "banned"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? `${GOLD}22` : "rgba(255,255,255,0.04)",
                color: filter === f ? GOLD : "#64748B",
                border: `1px solid ${filter === f ? `${GOLD}44` : BORDER}`,
              }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["User", "Email", "Type", "Status", "Location", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider" style={{ color: "#4B5563" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3">
                  <div className="h-8 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                </td></tr>
              ))}
              {!loading && filtered.map(u => {
                const badge = statusBadge(u)
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-xs" style={{ color: "#4B5563" }}>#{u.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#94A3B8" }}>{u.email}</td>
                    <td className="px-4 py-3 capitalize" style={{ color: "#94A3B8" }}>{u.userType}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{u.location || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-ZM")}
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="text-xs" style={{ color: "#4B5563" }}>Protected</span>
                      ) : (
                        <div className="flex gap-1">
                          {u.isBanned ? (
                            <button title="Unban" onClick={() => action(u.id, "unban")} disabled={actionLoading === u.id}
                              className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <>
                              <button title="Ban permanently" onClick={() => setConfirmAction({ id: u.id, type: "ban", name: u.name })}
                                className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                              <button title="Suspend" onClick={() => setConfirmAction({ id: u.id, type: "suspend", name: u.name })}
                                className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }}>
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button title="Upgrade to Pro" onClick={() => action(u.id, "upgrade")} disabled={actionLoading === u.id}
                            className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(245,158,11,0.1)", color: GOLD }}>
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button title="Delete user" onClick={() => setConfirmAction({ id: u.id, type: "delete", name: u.name })}
                            className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(239,68,68,0.05)", color: "#6B7280" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center" style={{ color: "#374151" }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
