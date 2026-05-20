import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-auth"
import { RefreshCw, Activity, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

export default function DiseaseScansSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminRequest<any>("/admin/disease-stats")
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Disease Scan Intelligence</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Aggregated crop health data</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "rgba(245,158,11,0.1)", color: GOLD, border: "1px solid rgba(245,158,11,0.2)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Scans", value: data?.totalScans ?? 0, icon: Activity, color: "#10B981" },
          { label: "Disease Types Found", value: (data?.topDiseases || []).length, icon: AlertTriangle, color: "#F97316" },
          { label: "Recent Scans (visible)", value: (data?.recentScans || []).length, icon: Activity, color: GOLD },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}22` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            {loading
              ? <div className="h-7 w-16 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
              : <p className="text-2xl font-bold text-white">{s.value}</p>
            }
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Diseases Chart */}
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Most Common Diseases</h3>
        {loading ? (
          <div className="h-48 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.03)" }} />
        ) : (data?.topDiseases || []).length === 0 ? (
          <div className="h-48 flex items-center justify-center" style={{ color: "#374151" }}>
            No scan data yet — users haven't used the Crop Doctor
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.topDiseases.map((d: any) => ({ name: d.disease || "Unknown", count: d.count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Scans */}
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Recent Scans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["User", "Disease Found", "Confidence", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider" style={{ color: "#4B5563" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-3">
                  <div className="h-8 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                </td></tr>
              ))}
              {!loading && (data?.recentScans || []).map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="px-4 py-3 text-white">{s.userName || "Anonymous"}</td>
                  <td className="px-4 py-3">
                    {s.diseaseFound
                      ? <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{s.diseaseFound}</span>
                      : <span style={{ color: "#4B5563" }}>—</span>
                    }
                  </td>
                  <td className="px-4 py-3" style={{ color: GOLD }}>
                    {s.confidence ? `${Number(s.confidence).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>
                    {new Date(s.createdAt).toLocaleDateString("en-ZM")}
                  </td>
                </tr>
              ))}
              {!loading && (!data?.recentScans || data.recentScans.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-10 text-center" style={{ color: "#374151" }}>No scan history yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
