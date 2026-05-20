import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts"
import {
  TrendingUp, DollarSign, Crown, ShoppingBag, Users, Wheat, Shield, RefreshCw,
} from "lucide-react"

interface RevenueData {
  totalCommission: number
  monthlyCommission: number
  proSubscribers: number
  proRevenue: number
  totalOrders: number
  totalPayments: number
  totalRevenueThisMonth: number
  weeklyRevenue: { week: string; revenue: number; commission: number }[]
  recentTransactions: {
    id: number
    totalPrice: string
    commission: string
    status: string
    createdAt: string
    cropName: string | null
    buyerName: string | null
  }[]
  topFarmers: { farmerId: number | null; farmerName: string | null; totalRevenue: number; totalOrders: number }[]
  topCrops: { cropName: string | null; totalOrders: number; totalRevenue: number }[]
}

export default function AdminPage() {
  const { user } = useAuth()
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    api.admin.revenue()
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-xl mx-auto py-20 text-center px-4">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">Please sign in with an admin account.</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-xl mx-auto py-20 text-center px-4">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={load}>Retry</Button>
        </main>
        <Footer />
      </div>
    )
  }

  const statCards = data ? [
    {
      title: "Revenue This Month",
      value: `K${data.totalRevenueThisMonth.toLocaleString()}`,
      sub: `Commissions + Pro subs`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Commissions Earned",
      value: `K${data.monthlyCommission.toLocaleString()}`,
      sub: `3% of all sales (this month)`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pro Subscribers",
      value: String(data.proSubscribers),
      sub: `K${data.proRevenue.toLocaleString()} recurring revenue`,
      icon: Crown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Orders",
      value: String(data.totalOrders),
      sub: `K${data.totalCommission.toLocaleString()} all-time commission`,
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ] : []

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Revenue Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-sm">All figures in Zambian Kwacha (ZMW)</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-5 h-28 bg-muted/30 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Weekly Revenue & Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data!.weeklyRevenue}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.45 0.12 145)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="oklch(0.45 0.12 145)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 90)" />
                      <XAxis dataKey="week" tickFormatter={(v) => new Date(v).toLocaleDateString("en-ZM", { month: "short", day: "numeric" })} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `K${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v, name) => [`K${Number(v).toLocaleString()}`, name === "revenue" ? "Sales" : "Commission"]} />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.45 0.12 145)" strokeWidth={2} fill="url(#revGrad)" name="revenue" />
                      <Area type="monotone" dataKey="commission" stroke="oklch(0.55 0.18 80)" strokeWidth={2} fill="none" name="commission" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Crops</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data!.topCrops.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="cropName" type="category" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip formatter={(v) => [`K${Number(v).toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="totalRevenue" fill="oklch(0.75 0.14 80)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" />Top Farmers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data!.topFarmers.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">No sales yet</p>
                    ) : data!.topFarmers.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{f.farmerName ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{f.totalOrders} orders</p>
                        </div>
                        <p className="font-bold text-sm text-primary">K{f.totalRevenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Wheat className="w-5 h-5" />Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data!.recentTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">No transactions yet</p>
                    ) : data!.recentTransactions.slice(0, 8).map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{t.cropName ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{t.buyerName ?? "Buyer"} · {new Date(t.createdAt).toLocaleDateString("en-ZM")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">K{Number(t.totalPrice).toLocaleString()}</p>
                          <p className="text-xs text-emerald-600">+K{Number(t.commission).toFixed(2)} commission</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
