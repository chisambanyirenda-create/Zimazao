import { useEffect, useState, useRef } from "react"
import { adminRequest } from "@/lib/admin-auth"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts"
import { TrendingUp, DollarSign, Crown, ShoppingBag, RefreshCw, Users, Zap } from "lucide-react"

const GOLD = "#F59E0B"
const CARD = "rgba(17,24,39,0.8)"
const BORDER = "rgba(255,255,255,0.07)"

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  const ref = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target])
  return val
}

function StatCard({ label, value, prefix = "", suffix = "", icon: Icon, color = GOLD, loading }: any) {
  const animated = useCountUp(loading ? 0 : value)
  return (
    <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl" style={{ background: color }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
      ) : (
        <p className="text-2xl font-bold text-white">{prefix}{animated.toLocaleString()}{suffix}</p>
      )}
      <p className="text-xs mt-1" style={{ color: "#64748B" }}>{label}</p>
    </div>
  )
}

export default function DashboardSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  const load = () => {
    setLoading(true); setErr("")
    adminRequest<any>("/admin/revenue")
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const chartData = (data?.weeklyRevenue || []).map((w: any) => ({
    date: new Date(w.day).toLocaleDateString("en-ZM", { month: "short", day: "numeric" }),
    revenue: w.revenue,
    commission: w.commission,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Revenue Dashboard</h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Live financial overview</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(245,158,11,0.1)", color: GOLD, border: "1px solid rgba(245,158,11,0.2)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {err && <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>{err}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue Today (ZMW)" value={data?.revenueToday ?? 0} prefix="K" icon={Zap} color="#10B981" loading={loading} />
        <StatCard label="Revenue This Month" value={data?.totalRevenueThisMonth ?? 0} prefix="K" icon={TrendingUp} color={GOLD} loading={loading} />
        <StatCard label="Pro Subscribers" value={data?.proSubscribers ?? 0} icon={Crown} color="#8B5CF6" loading={loading} />
        <StatCard label="Total Orders" value={data?.totalOrders ?? 0} icon={ShoppingBag} color="#3B82F6" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Commission Earned (Total)" value={Math.round(data?.totalCommission ?? 0)} prefix="K" icon={DollarSign} color="#EC4899" loading={loading} />
        <StatCard label="Commission This Month" value={Math.round(data?.monthlyCommission ?? 0)} prefix="K" icon={DollarSign} color={GOLD} loading={loading} />
        <StatCard label="Pro Revenue / Month" value={data?.proRevenue ?? 0} prefix="K" icon={Users} color="#10B981" loading={loading} />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Daily Revenue (Last 30 Days)</h3>
        {loading ? (
          <div className="h-48 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center" style={{ color: "#374151" }}>
            <p>No transaction data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#revGrad)" name="Revenue (ZMW)" />
              <Area type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} fill="none" name="Commission" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Crops */}
        <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top 5 Crops by Orders</h3>
          {loading ? (
            <div className="h-40 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />
          ) : (data?.topCrops || []).length === 0 ? (
            <div className="h-40 flex items-center justify-center" style={{ color: "#374151" }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data.topCrops} layout="vertical">
                <XAxis type="number" tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="cropName" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
                <Bar dataKey="totalOrders" fill={GOLD} radius={[0, 4, 4, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Farmers */}
        <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top 5 Farmers by Revenue</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : (data?.topFarmers || []).length === 0 ? (
            <div className="h-40 flex items-center justify-center" style={{ color: "#374151" }}>No data yet</div>
          ) : (
            <div className="space-y-2">
              {data.topFarmers.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5" style={{ color: i === 0 ? GOLD : "#64748B" }}>#{i + 1}</span>
                    <span className="text-sm text-white">{f.farmerName || "Unknown"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: GOLD }}>K{Number(f.totalRevenue).toFixed(0)}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>{f.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Recent Transactions (Last 20)</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Buyer", "Crop", "Amount", "Commission", "Status", "Date"].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold tracking-wider" style={{ color: "#4B5563" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions || []).map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="py-2.5 pr-4 text-white">{t.buyerName || "—"}</td>
                    <td className="py-2.5 pr-4" style={{ color: "#94A3B8" }}>{t.cropName || "—"}</td>
                    <td className="py-2.5 pr-4 font-semibold" style={{ color: GOLD }}>K{Number(t.totalPrice).toFixed(2)}</td>
                    <td className="py-2.5 pr-4" style={{ color: "#10B981" }}>K{Number(t.commission).toFixed(2)}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{
                        background: t.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                        color: t.status === "completed" ? "#10B981" : GOLD,
                      }}>{t.status}</span>
                    </td>
                    <td className="py-2.5 text-xs" style={{ color: "#4B5563" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-ZM")}
                    </td>
                  </tr>
                ))}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: "#374151" }}>No transactions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
