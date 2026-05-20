import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { api, type ApiDashboardStats } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts"
import {
  TrendingUp, TrendingDown, ShoppingBag, Eye, Plus, DollarSign,
  Package, MessageSquare, ArrowRight, Leaf, Camera, BarChart3,
  CheckCircle, Clock, Star, Users,
} from "lucide-react"

const salesData = [
  { month: "Nov", sales: 3200, orders: 8 },
  { month: "Dec", sales: 4800, orders: 12 },
  { month: "Jan", sales: 3900, orders: 9 },
  { month: "Feb", sales: 6200, orders: 15 },
  { month: "Mar", sales: 5100, orders: 13 },
  { month: "Apr", sales: 7800, orders: 19 },
  { month: "May", sales: 9400, orders: 24 },
]

const cropPerformance = [
  { name: "Maize", views: 142, orders: 8, revenue: 4500 },
  { name: "Groundnuts", views: 98, orders: 5, revenue: 1900 },
  { name: "Soybeans", views: 75, orders: 4, revenue: 2080 },
  { name: "Sunflower", views: 54, orders: 3, revenue: 840 },
]

const recentListings = [
  { id: 1, name: "White Maize", price: 450, unit: "50kg bag", quantity: "200 bags", status: "active", views: 45, emoji: "🌽" },
  { id: 2, name: "Groundnuts", price: 380, unit: "25kg bag", quantity: "100 bags", status: "active", views: 32, emoji: "🥜" },
  { id: 3, name: "Soybeans", price: 520, unit: "50kg bag", quantity: "150 bags", status: "sold", views: 78, emoji: "🫘" },
]

const recentOrders = [
  { id: "ORD-001", buyer: "ABC Trading Ltd", crop: "White Maize", quantity: "50 bags", total: 22500, status: "pending" },
  { id: "ORD-002", buyer: "Lusaka Millers", crop: "Groundnuts", quantity: "30 bags", total: 11400, status: "completed" },
  { id: "ORD-003", buyer: "Ndola Depot", crop: "Soybeans", quantity: "20 bags", total: 10400, status: "in_transit" },
]

function DashboardContent() {
  const { user } = useAuth()
  const [dashStats, setDashStats] = useState<ApiDashboardStats | null>(null)

  useEffect(() => {
    if (user) {
      api.dashboard.get().then(setDashStats).catch(() => {})
    }
  }, [user])

  const liveStats = dashStats
    ? [
        { title: "Total Sales", value: `K${dashStats.totalSales.toLocaleString()}`, change: "+12%", trend: "up" as const, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Active Listings", value: String(dashStats.activeListings), change: "+2 this week", trend: "up" as const, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Total Orders", value: String(dashStats.totalOrders), change: "+5 this month", trend: "up" as const, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Messages", value: String(dashStats.messages), change: "3 unread", trend: "up" as const, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
      ]
    : [
        { title: "Total Sales", value: "K12,450", change: "+12% this month", trend: "up" as const, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Active Listings", value: "8", change: "+2 this week", trend: "up" as const, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Profile Views", value: "234", change: "-5% vs last week", trend: "down" as const, icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Messages", value: "12", change: "3 unread", trend: "up" as const, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
      ]

  const liveListings = dashStats?.recentListings
    ? dashStats.recentListings.map((l) => ({
        id: l.id, name: l.cropName, price: parseFloat(l.price),
        unit: l.unit, quantity: l.quantity, status: "active", views: 0, emoji: "🌾",
      }))
    : recentListings

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto text-center p-10 border-0 shadow-lg">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">Sign in to access your farm dashboard and manage your listings.</p>
            <Link href="/login"><Button className="w-full" size="lg">Sign In to Dashboard</Button></Link>
            <p className="text-muted-foreground text-sm mt-3">New here? <Link href="/register" className="text-primary font-medium">Create a free account</Link></p>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👨‍🌾</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground text-sm">Here's your farm business overview for today</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/new-listing">
              <Button className="gap-2 shadow-sm"><Plus className="w-4 h-4" />Add Listing</Button>
            </Link>
            <Link href="/disease-detector">
              <Button variant="outline" className="gap-2"><Camera className="w-4 h-4" />Scan Crop</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {liveStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className={`text-xs ${stat.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sales Revenue (7 months)</CardTitle>
                <Badge className="bg-primary/10 text-primary border-0">+47% growth</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.45 0.12 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.45 0.12 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 90)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `K${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`K${Number(v).toLocaleString()}`, "Sales"]} />
                  <Area type="monotone" dataKey="sales" stroke="oklch(0.45 0.12 145)" strokeWidth={2.5} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Crop Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Crop Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cropPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 90)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v) => [v, "Views"]} />
                  <Bar dataKey="views" fill="oklch(0.75 0.14 80)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Listings + Orders */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Your Listings</CardTitle>
              <Link href="/new-listing" className="text-primary text-sm hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> New listing
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveListings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {listing.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{listing.name}</p>
                      <p className="text-sm text-muted-foreground">{listing.quantity} · K{listing.price}/{listing.unit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={listing.status === "active" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-muted text-muted-foreground border-0"}>
                        {listing.status === "active" ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : null}{listing.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{listing.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-muted/40 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                      <Badge className={`text-xs border-0 ${
                        order.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        order.status === "in_transit" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {order.status === "in_transit" ? "In Transit" : order.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{order.crop}</p>
                    <p className="text-xs text-muted-foreground">{order.quantity} · {order.buyer}</p>
                    <p className="text-base font-bold text-primary mt-1.5">K{order.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: "/new-listing", icon: Plus, label: "New Listing", color: "text-primary", bg: "bg-primary/10" },
                { href: "/disease-detector", icon: Camera, label: "Scan Crops", color: "text-blue-600", bg: "bg-blue-50" },
                { href: "/prices", icon: BarChart3, label: "Market Prices", color: "text-amber-600", bg: "bg-amber-50" },
                { href: "/messages", icon: MessageSquare, label: "Messages", color: "text-purple-600", bg: "bg-purple-50" },
                { href: "/crop-calendar", icon: Star, label: "Crop Calendar", color: "text-emerald-600", bg: "bg-emerald-50" },
                { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", color: "text-rose-600", bg: "bg-rose-50" },
                { href: "/orders", icon: Package, label: "My Orders", color: "text-indigo-600", bg: "bg-indigo-50" },
                { href: "/farmer/" + (user.id ?? ""), icon: Users, label: "My Profile", color: "text-teal-600", bg: "bg-teal-50" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-foreground mb-1">Farmer Tip: Best time to sell Maize</p>
              <p className="text-muted-foreground text-sm">
                Maize prices are currently <strong className="text-primary">K450/bag</strong> (+3.1% this week) in Lusaka. Consider listing now before the post-harvest price drop in June.
                <Link href="/prices" className="text-primary font-medium ml-1">View full price trends →</Link>
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
