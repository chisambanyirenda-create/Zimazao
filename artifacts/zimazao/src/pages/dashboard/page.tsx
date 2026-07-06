import { useAuth } from "@/lib/auth-context"
import { useEffect, useRef, useState } from "react"
import { api, type ApiDashboardStats, type ApiOrderDetail } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { EmailVerifyBanner } from "@/components/email-verify-banner"
import { Footer } from "@/components/footer"
import { AvatarUpload } from "@/components/avatar-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import {
  ShoppingBag, Plus, DollarSign, Package, MessageSquare, ArrowRight, Leaf, Camera,
  BarChart3, CheckCircle, CheckCircle2, Circle, Star, Users, Wallet, Truck,
  ShoppingCart, Bell, HandCoins, PackageCheck,
} from "lucide-react"

// ─── A single "getting started" step ──────────────────────────────────────────
function StepRow({ done, label, href, cta }: { done: boolean; label: string; href: string; cta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      {done
        ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
        : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />}
      <span className={`flex-1 text-sm ${done ? "text-muted-foreground line-through" : "font-medium text-foreground"}`}>{label}</span>
      {!done && (
        <Link href={href}>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">{cta} <ArrowRight className="h-3 w-3" /></Button>
        </Link>
      )}
    </div>
  )
}

// ─── FARMER DASHBOARD ─────────────────────────────────────────────────────────
function FarmerDashboard({ stats }: { stats: ApiDashboardStats | null }) {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const orders = await api.orders.list()
        setPendingCount(orders.filter((o) => o.status === "pending").length)
      } catch {}
    }
    fetchPending()
    pollRef.current = setInterval(fetchPending, 15000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  if (!user) return null

  const totalSales = stats?.totalSales ?? 0
  const activeListings = stats?.activeListings ?? 0
  const totalOrders = stats?.totalOrders ?? 0
  const messages = stats?.messages ?? 0

  const statCards = [
    { title: "Total Earned", value: `ZMW ${totalSales.toLocaleString()}`, sub: "From completed sales", icon: DollarSign, color: "text-emerald-300", bg: "bg-emerald-500/15" },
    { title: "Active Listings", value: String(activeListings), sub: "Live on the marketplace", icon: Package, color: "text-blue-300", bg: "bg-blue-500/15" },
    { title: "Orders Received", value: String(totalOrders), sub: "All time", icon: ShoppingBag, color: "text-purple-300", bg: "bg-purple-500/15" },
    { title: "Messages", value: String(messages), sub: "Buyer conversations", icon: MessageSquare, color: "text-amber-300", bg: "bg-amber-500/15" },
  ]

  const liveListings = (stats?.recentListings ?? []).map((l) => ({
    id: l.id, name: l.cropName, price: parseFloat(l.price), unit: l.unit, quantity: l.quantity,
  }))

  const steps = [
    { done: activeListings > 0, label: "Post your first crop or livestock listing", href: "/new-listing", cta: "Add listing" },
    { done: !!user.avatar, label: "Add a profile photo so buyers trust you", href: "/profile", cta: "Add photo" },
    { done: user.emailVerified === true, label: "Verify your email address", href: "/profile", cta: "Verify" },
  ]
  const allDone = steps.every((s) => s.done)

  const actions = [
    { href: "/new-listing", icon: Plus, label: "New Listing", color: "text-emerald-300", bg: "bg-emerald-500/15" },
    { href: "/disease-detector", icon: Camera, label: "Crop Doctor", color: "text-blue-300", bg: "bg-blue-500/15" },
    { href: "/prices", icon: BarChart3, label: "Market Prices", color: "text-amber-300", bg: "bg-amber-500/15" },
    { href: "/orders", icon: Package, label: "Orders", color: "text-purple-300", bg: "bg-purple-500/15" },
    { href: "/messages", icon: MessageSquare, label: "Messages", color: "text-rose-300", bg: "bg-rose-500/15" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", color: "text-teal-300", bg: "bg-teal-500/15" },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmailVerifyBanner />

      {pendingCount > 0 && (
        <Link href="/orders">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-orange-500/25 bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-4 transition-shadow hover:shadow-md">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20">
                <Bell className="h-5 w-5 text-orange-300" />
              </div>
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{pendingCount}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-200">{pendingCount} order{pendingCount > 1 ? "s" : ""} waiting for your confirmation</p>
              <p className="mt-0.5 text-xs text-orange-300/70">Tap to review and confirm</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-orange-400" />
          </div>
        </Link>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <AvatarUpload size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your farm business</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/new-listing"><Button className="gap-2"><Plus className="h-4 w-4" />Add Listing</Button></Link>
          <Link href="/disease-detector"><Button variant="outline" className="gap-2"><Camera className="h-4 w-4" />Scan Crop</Button></Link>
        </div>
      </div>

      {/* Getting started — only until the basics are done */}
      {!allDone && (
        <Card className="mb-8 border border-primary/25 bg-primary/[0.04]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-primary" /> Get set up in 3 steps
            </CardTitle>
            <p className="text-sm text-muted-foreground">Finish these to start selling and win buyer trust.</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {steps.map((s) => <StepRow key={s.label} {...s} />)}
          </CardContent>
        </Card>
      )}

      {/* Real stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title} className="border border-border">
            <CardContent className="p-5">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mb-0.5 text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listings + actions */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Your Listings</CardTitle>
            <Link href="/new-listing" className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus className="h-4 w-4" /> New</Link>
          </CardHeader>
          <CardContent>
            {liveListings.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-3 text-4xl">🌾</div>
                <p className="mb-1 font-medium text-foreground">No listings yet</p>
                <p className="mb-4 text-sm text-muted-foreground">Post your first crop and buyers across Zambia can find it.</p>
                <Link href="/new-listing"><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Create your first listing</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {liveListings.map((l) => (
                  <div key={l.id} className="flex items-center gap-4 rounded-xl bg-muted/40 p-4 transition-colors hover:bg-muted/60">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">🌾</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{l.name}</p>
                      <p className="text-sm text-muted-foreground">{l.quantity} · ZMW {l.price.toLocaleString()}/{l.unit}</p>
                    </div>
                    <Badge className="border-0 bg-emerald-500/20 text-emerald-300"><CheckCircle className="mr-1 inline h-3 w-3" />active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((a) => (
                <Link key={a.href} href={a.href}>
                  <Button variant="outline" className="h-auto w-full flex-col gap-1.5 border-border py-3 transition-all hover:border-primary/30 hover:bg-primary/5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.bg}`}><a.icon className={`h-4 w-4 ${a.color}`} /></div>
                    <span className="text-xs font-medium">{a.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Honest, useful pointer (no invented numbers) */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <BarChart3 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="mb-1 font-semibold text-foreground">Check live market prices before you sell</p>
            <p className="text-sm text-muted-foreground">
              See real-time crop prices from Lusaka, Ndola, Kitwe and more so you list at the right price.
              <Link href="/prices" className="ml-1 font-medium text-primary">View market prices →</Link>
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
  const activeOrders = orders.filter((o) => ["pending", "confirmed", "shipped"].includes(o.status))
  const deliveredOrders = orders.filter((o) => o.status === "delivered")

  const statusColor = (status: string) => ({
    pending: "bg-amber-500/20 text-amber-300",
    confirmed: "bg-blue-500/20 text-blue-300",
    shipped: "bg-indigo-500/20 text-indigo-300",
    delivered: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
  }[status] ?? "bg-muted text-muted-foreground")

  const statCards = [
    { title: "Total Spent", value: `ZMW ${totalSpent.toLocaleString()}`, sub: `${orders.length} order${orders.length !== 1 ? "s" : ""}`, icon: ShoppingBag, color: "text-blue-300", bg: "bg-blue-500/15" },
    { title: "Active Orders", value: String(activeOrders.length), sub: activeOrders.length > 0 ? "On the way" : "None right now", icon: Truck, color: "text-indigo-300", bg: "bg-indigo-500/15" },
    { title: "Completed", value: String(deliveredOrders.length), sub: "Delivered", icon: CheckCircle, color: "text-green-300", bg: "bg-green-500/15" },
    { title: "Wallet", value: `ZMW ${(user.walletBalance ?? 0).toLocaleString()}`, sub: "Refunds & credits", icon: Wallet, color: "text-emerald-300", bg: "bg-emerald-500/15" },
  ]

  const actions = [
    { href: "/marketplace", icon: ShoppingCart, label: "Shop Crops", color: "text-emerald-300", bg: "bg-emerald-500/15" },
    { href: "/livestock", icon: Users, label: "Livestock", color: "text-amber-300", bg: "bg-amber-500/15" },
    { href: "/orders", icon: Package, label: "My Orders", color: "text-blue-300", bg: "bg-blue-500/15" },
    { href: "/messages", icon: MessageSquare, label: "Messages", color: "text-purple-300", bg: "bg-purple-500/15" },
    { href: "/prices", icon: BarChart3, label: "Prices", color: "text-indigo-300", bg: "bg-indigo-500/15" },
    { href: "/profile", icon: Star, label: "Profile", color: "text-rose-300", bg: "bg-rose-500/15" },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmailVerifyBanner />

      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">🛒</div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Hello, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">Your shopping dashboard</p>
          </div>
        </div>
        <Link href="/marketplace"><Button className="gap-2"><ShoppingCart className="h-4 w-4" /> Browse Marketplace</Button></Link>
      </div>

      {/* How buying works — until the first order */}
      {orders.length === 0 && (
        <Card className="mb-8 border border-primary/25 bg-primary/[0.04]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">How buying on Zimazao works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShoppingCart, t: "1. Browse & order", d: "Find crops from verified farmers and place an order." },
              { icon: HandCoins, t: "2. Pay on delivery", d: "Pay the farmer cash when your goods arrive — safe and simple." },
              { icon: PackageCheck, t: "3. Confirm delivery", d: "Mark it delivered and rate the farmer to build trust." },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-border bg-muted/30 p-4">
                <s.icon className="mb-2 h-5 w-5 text-primary" />
                <p className="mb-1 text-sm font-semibold text-foreground">{s.t}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title} className="border border-border">
            <CardContent className="p-5">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <p className="mb-0.5 text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Purchases</CardTitle>
            <Link href="/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-3 text-4xl">🛒</div>
                <p className="mb-1 font-medium text-foreground">No orders yet</p>
                <p className="mb-4 text-sm text-muted-foreground">Browse fresh crops from farmers across Zambia.</p>
                <Link href="/marketplace"><Button size="sm" className="gap-1.5"><ShoppingCart className="h-3.5 w-3.5" /> Start shopping</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-xl">🌾</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{o.cropName}</p>
                      <p className="text-xs text-muted-foreground">{o.quantity} · {o.farmerName ?? "Farmer"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-primary">ZMW {parseFloat(o.totalPrice ?? "0").toLocaleString()}</p>
                      <Badge className={`mt-0.5 border-0 text-[10px] ${statusColor(o.status)}`}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((a) => (
                <Link key={a.href} href={a.href}>
                  <Button variant="outline" className="h-auto w-full flex-col gap-1.5 border-border py-3 transition-all hover:border-primary/30 hover:bg-primary/5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.bg}`}><a.icon className={`h-4 w-4 ${a.color}`} /></div>
                    <span className="text-xs font-medium">{a.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function DashboardContent() {
  const { user } = useAuth()
  const [dashStats, setDashStats] = useState<ApiDashboardStats | null>(null)
  const [buyerOrders, setBuyerOrders] = useState<ApiOrderDetail[]>([])
  const isFarmer = user?.userType === "farmer"

  useEffect(() => {
    if (!user) return
    if (isFarmer) api.dashboard.get().then(setDashStats).catch(() => {})
    else api.orders.list().then(setBuyerOrders).catch(() => {})
  }, [user, isFarmer])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="mx-auto max-w-md border border-border p-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Please sign in</h2>
            <p className="mb-6 text-muted-foreground">Sign in to access your dashboard.</p>
            <Link href="/login"><Button className="w-full" size="lg">Sign In</Button></Link>
            <p className="mt-3 text-sm text-muted-foreground">New here? <Link href="/register" className="font-medium text-primary">Create a free account</Link></p>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      {isFarmer ? <FarmerDashboard stats={dashStats} /> : <BuyerDashboard orders={buyerOrders} />}
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
