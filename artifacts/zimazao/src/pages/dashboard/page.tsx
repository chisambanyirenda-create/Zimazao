import { useAuth } from "@/lib/auth-context"
import { useEffect, useRef, useState } from "react"
import { api, type ApiDashboardStats, type ApiOrderDetail } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AvatarUpload } from "@/components/avatar-upload"
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
  CheckCircle, Clock, Star, Users, Wallet, MapPin, Heart,
  Truck, ShoppingCart, Gift, Bell,
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

// ─── FARMER DASHBOARD ─────────────────────────────────────────────────────────
function FarmerDashboard({ stats }: { stats: ApiDashboardStats | null }) {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const orders = await api.orders.list()
        const pending = orders.filter((o) => o.status === "pending").length
        setPendingCount(pending)
      } catch {}
    }
    fetchPending()
    pollRef.current = setInterval(fetchPending, 15000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  if (!user) return null

  const liveStats = stats
    ? [
        { title: "Total Sales", value: `ZMW ${stats.totalSales.toLocaleString()}`, change: "+12%", trend: "up" as const, icon: DollarSign, color: "text-emerald-300", bg: "bg-emerald-500/15" },
        { title: "Active Listings", value: String(stats.activeListings), change: "+2 this week", trend: "up" as const, icon: Package, color: "text-blue-300", bg: "bg-blue-500/15" },
        { title: "Orders Received", value: String(stats.totalOrders), change: "+5 this month", trend: "up" as const, icon: ShoppingBag, color: "text-purple-300", bg: "bg-purple-500/15" },
        { title: "Messages", value: String(stats.messages), change: "3 unread", trend: "up" as const, icon: MessageSquare, color: "text-amber-300", bg: "bg-amber-500/15" },
      ]
    : [
        { title: "Total Sales", value: "ZMW 0", change: "No sales yet", trend: "up" as const, icon: DollarSign, color: "text-emerald-300", bg: "bg-emerald-500/15" },
        { title: "Active Listings", value: "0", change: "Create a listing", trend: "up" as const, icon: Package, color: "text-blue-300", bg: "bg-blue-500/15" },
        { title: "Orders Received", value: "0", change: "Start selling", trend: "up" as const, icon: ShoppingBag, color: "text-purple-300", bg: "bg-purple-500/15" },
        { title: "Messages", value: "0", change: "No messages", trend: "up" as const, icon: MessageSquare, color: "text-amber-300", bg: "bg-amber-500/15" },
      ]

  const liveListings = stats?.recentListings
    ? stats.recentListings.map((l) => ({
        id: l.id, name: l.cropName, price: parseFloat(l.price),
        unit: l.unit, quantity: l.quantity, status: "active", views: 0, emoji: "🌾",
      }))
    : []

  const farmerActions = [
    { href: "/new-listing", icon: Plus, label: "New Listing", color: "text-primary", bg: "bg-primary/10" },
    { href: "/disease-detector", icon: Camera, label: "Scan Crops", color: "text-blue-300", bg: "bg-blue-500/15" },
    { href: "/prices", icon: BarChart3, label: "Market Prices", color: "text-amber-300", bg: "bg-amber-500/15" },
    { href: "/price-alerts", icon: Bell, label: "Price Alerts", color: "text-orange-300", bg: "bg-orange-500/15" },
    { href: "/messages", icon: MessageSquare, label: "Messages", color: "text-purple-300", bg: "bg-purple-500/15" },
    { href: "/crop-calendar", icon: Star, label: "Crop Calendar", color: "text-emerald-300", bg: "bg-emerald-500/15" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", color: "text-rose-300", bg: "bg-rose-500/15" },
    { href: "/orders", icon: Package, label: "Orders", color: "text-indigo-300", bg: "bg-indigo-500/15" },
    { href: "/farmer/" + (user.id ?? ""), icon: Users, label: "My Profile", color: "text-teal-300", bg: "bg-teal-500/15" },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Live pending orders banner */}
      {pendingCount > 0 && (
        <Link href="/orders">
          <div className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/25 cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative shrink-0">
              <div className="w-11 h-11 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-300" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {pendingCount}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-orange-200 text-sm">
                You have {pendingCount} pending order{pendingCount > 1 ? "s" : ""} waiting for your confirmation
              </p>
              <p className="text-orange-300/70 text-xs mt-0.5">Tap to review and confirm — updates every 15 seconds</p>
            </div>
            <div className="shrink-0">
              <ArrowRight className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        </Link>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <AvatarUpload size="lg" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground text-sm">Your farm business overview</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Tap your photo to change it</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/new-listing">
            <Button className="neon-cta gap-2 shadow-sm"><Plus className="w-4 h-4" />Add Listing</Button>
          </Link>
          <Link href="/disease-detector">
            <Button variant="outline" className="neon-scan-pulse gap-2"><Camera className="w-4 h-4" />Scan Crop</Button>
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
                <Badge variant="secondary" className={`text-xs ${stat.trend === "up" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
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
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `ZMW${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`ZMW ${Number(v).toLocaleString()}`, "Sales"]} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.45 0.12 145)" strokeWidth={2.5} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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

      {/* Listings + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Your Listings</CardTitle>
            <Link href="/new-listing" className="text-primary text-sm hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> New listing
            </Link>
          </CardHeader>
          <CardContent>
            {liveListings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🌾</div>
                <p className="font-medium text-foreground mb-1">No listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start selling your crops to buyers across Zambia</p>
                <Link href="/new-listing">
                  <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Create First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {liveListings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {listing.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{listing.name}</p>
                      <p className="text-sm text-muted-foreground">{listing.quantity} · ZMW {listing.price}/{listing.unit}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
                      <CheckCircle className="w-3 h-3 mr-1 inline" />active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {farmerActions.slice(0, 6).map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tip */}
      <Card className="mt-2 bg-primary/5 border-primary/20">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="font-semibold text-foreground mb-1">Farmer Tip: Best time to sell Maize</p>
            <p className="text-muted-foreground text-sm">
              Maize prices are currently <strong className="text-primary">K450/bag</strong> (+3.1% this week) in Lusaka. Consider listing now before the post-harvest price drop.
              <Link href="/prices" className="text-primary font-medium ml-1">View full price trends →</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

// ─── BUYER DASHBOARD ──────────────────────────────────────────────────────────
function BuyerDashboard({ orders }: { orders: ApiOrderDetail[] }) {
  const { user } = useAuth()
  if (!user) return null

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.totalPrice ?? "0"), 0)
  const activeOrders = orders.filter(o => ["pending", "confirmed", "shipped"].includes(o.status))
  const deliveredOrders = orders.filter(o => o.status === "delivered")

  const buyerActions = [
    { href: "/marketplace", icon: ShoppingCart, label: "Shop Crops", color: "text-primary", bg: "bg-primary/10" },
    { href: "/livestock", icon: Users, label: "Livestock", color: "text-amber-300", bg: "bg-amber-500/15" },
    { href: "/orders", icon: Package, label: "My Orders", color: "text-blue-300", bg: "bg-blue-500/15" },
    { href: "/messages", icon: MessageSquare, label: "Messages", color: "text-purple-300", bg: "bg-purple-500/15" },
    { href: "/prices", icon: BarChart3, label: "Price Trends", color: "text-emerald-300", bg: "bg-emerald-500/15" },
    { href: "/price-alerts", icon: Bell, label: "Price Alerts", color: "text-orange-300", bg: "bg-orange-500/15" },
    { href: "/profile", icon: Star, label: "My Profile", color: "text-rose-300", bg: "bg-rose-500/15" },
  ]

  const statusColor = (status: string) => ({
    pending: "bg-amber-500/20 text-amber-300",
    confirmed: "bg-blue-500/20 text-blue-300",
    shipped: "bg-indigo-500/20 text-indigo-300",
    delivered: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
  }[status] ?? "bg-muted text-muted-foreground")

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🛒</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Hello, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground text-sm">Your shopping dashboard</p>
          </div>
        </div>
        <Link href="/marketplace">
          <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 shadow-sm text-white">
            <ShoppingCart className="w-4 h-4" /> Browse Marketplace
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Wallet Balance",
            value: `ZMW ${user.walletBalance.toLocaleString()}`,
            sub: "Available to spend",
            icon: Wallet,
            color: "text-emerald-300",
            bg: "bg-emerald-500/15",
            border: "border-emerald-500/25",
          },
          {
            title: "Total Spent",
            value: `ZMW ${totalSpent.toLocaleString()}`,
            sub: `${orders.length} order${orders.length !== 1 ? "s" : ""}`,
            icon: ShoppingBag,
            color: "text-blue-300",
            bg: "bg-blue-500/15",
            border: "border-blue-500/25",
          },
          {
            title: "Active Orders",
            value: String(activeOrders.length),
            sub: activeOrders.length > 0 ? "On the way" : "All delivered",
            icon: Truck,
            color: "text-indigo-300",
            bg: "bg-indigo-500/15",
            border: "border-indigo-500/25",
          },
          {
            title: "Completed",
            value: String(deliveredOrders.length),
            sub: "Delivered orders",
            icon: CheckCircle,
            color: "text-green-300",
            bg: "bg-green-500/15",
            border: "border-green-500/25",
          },
        ].map((stat, i) => (
          <Card key={i} className={`border shadow-sm hover:shadow-md transition-shadow ${stat.border}`}>
            <CardContent className="p-5">
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
              <p className="text-sm font-medium text-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent orders */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Purchases</CardTitle>
            <Link href="/orders" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🛒</div>
                <p className="font-medium text-foreground mb-1">No orders yet</p>
                <p className="text-sm text-muted-foreground mb-4">Browse fresh crops from farmers across Zambia</p>
                <Link href="/marketplace">
                  <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <ShoppingCart className="w-3.5 h-3.5" /> Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl shrink-0">🌾</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{order.cropName}</p>
                      <p className="text-xs text-muted-foreground">{order.quantity} · {order.farmerName ?? "Farmer"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-primary">ZMW {parseFloat(order.totalPrice ?? "0").toLocaleString()}</p>
                      <Badge className={`text-[10px] border-0 mt-0.5 ${statusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {buyerActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet notice */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/25">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Gift className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground mb-0.5">Your test wallet: ZMW {user.walletBalance.toLocaleString()} available</p>
            <p className="text-muted-foreground text-sm">
              Use your wallet balance to buy fresh produce from verified farmers. Balance is deducted automatically at checkout.
            </p>
          </div>
          <Link href="/marketplace" className="shrink-0">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> Shop Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────────────────────────────
function DashboardContent() {
  const { user } = useAuth()
  const [dashStats, setDashStats] = useState<ApiDashboardStats | null>(null)
  const [buyerOrders, setBuyerOrders] = useState<ApiOrderDetail[]>([])
  const isFarmer = user?.userType === "farmer"

  useEffect(() => {
    if (!user) return
    if (isFarmer) {
      api.dashboard.get().then(setDashStats).catch(() => {})
    } else {
      api.orders.list().then(setBuyerOrders).catch(() => {})
    }
  }, [user, isFarmer])

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
            <p className="text-muted-foreground mb-6">Sign in to access your dashboard.</p>
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
      {isFarmer
        ? <FarmerDashboard stats={dashStats} />
        : <BuyerDashboard orders={buyerOrders} />
      }
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
