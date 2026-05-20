import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiOrderDetail } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag, MapPin, User, Loader2, Package, ArrowLeft,
  CheckCircle2, Clock, Truck, Star, MessageCircle, RotateCcw,
  TrendingUp, Filter,
} from "lucide-react"

const STEPS = [
  { key: "pending",   label: "Placed",     icon: Clock },
  { key: "confirmed", label: "Confirmed",  icon: CheckCircle2 },
  { key: "shipped",   label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered",  icon: Star },
]

const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1,
}

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped:   "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", livestock: "🐄", poultry: "🐔", other: "🌾",
}

const DEMO_ORDERS: ApiOrderDetail[] = [
  { id: 1001, listingId: 1, cropName: "White Maize", category: "cereals", quantity: "10", unit: "50kg bag", totalPrice: "4500", status: "shipped",   farmerId: 1, farmerName: "John Mwansa",  location: "Choma, Southern",  imageUrl: null, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 1002, listingId: 2, cropName: "Groundnuts",  category: "legumes", quantity: "5",  unit: "25kg bag", totalPrice: "1900", status: "confirmed", farmerId: 2, farmerName: "Mary Banda",   location: "Chipata, Eastern", imageUrl: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 1003, listingId: 3, cropName: "Soybeans",    category: "legumes", quantity: "3",  unit: "50kg bag", totalPrice: "1560", status: "delivered", farmerId: 3, farmerName: "Peter Phiri",   location: "Mkushi, Central",  imageUrl: null, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 1004, listingId: 8, cropName: "Mixed Tomatoes", category: "vegetables", quantity: "4", unit: "20kg crate", totalPrice: "320", status: "pending", farmerId: 8, farmerName: "Agnes Phiri", location: "Chongwe, Lusaka", imageUrl: null, createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
]

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = STEP_INDEX[status] ?? 0
  const isCancelled = status === "cancelled"

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
          <RotateCcw className="w-3.5 h-3.5 text-red-600" />
        </div>
        <span className="text-sm font-medium text-red-600">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0 mt-4 mb-1 w-full">
      {STEPS.map((step, idx) => {
        const done = idx < currentIndex
        const active = idx === currentIndex
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                done    ? "bg-primary text-white shadow-sm" :
                active  ? "bg-primary/15 text-primary ring-2 ring-primary ring-offset-2" :
                          "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                done || active ? "text-primary" : "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                done ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [orders, setOrders] = useState<ApiOrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    api.orders.list()
      .then((data) => { setOrders(data.length > 0 ? data : DEMO_ORDERS); setLoading(false) })
      .catch(() => { setOrders(DEMO_ORDERS); setLoading(false) })
  }, [user])

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus)

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => ["confirmed","shipped"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="w-6 h-6" /> My Orders</h1>
              <p className="text-white/75 text-sm mt-1">Track every crop purchase from placement to delivery</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Total", value: stats.total, color: "text-white" },
                { label: "Active", value: stats.active, color: "text-blue-200" },
                { label: "Delivered", value: stats.delivered, color: "text-green-200" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { value: "all", label: "All Orders" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "shipped", label: "In Transit" },
            { value: "delivered", label: "Delivered" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === f.value
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className={`text-xs rounded-full px-1.5 ${filterStatus === f.value ? "bg-white/20" : "bg-muted-foreground/20"}`}>
                  {orders.filter((o) => o.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start buying fresh crops from Zambian farmers</p>
              <Link href="/marketplace"><Button className="gap-2 bg-gradient-to-r from-primary to-emerald-600">Browse Marketplace</Button></Link>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((order) => {
              const emoji = CROP_EMOJI[(order as any).category] ?? "🌿"
              return (
                <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Status accent bar */}
                  <div className={`h-1 w-full ${
                    order.status === "delivered" ? "bg-green-500" :
                    order.status === "shipped"   ? "bg-purple-500" :
                    order.status === "confirmed" ? "bg-blue-500" :
                    order.status === "cancelled" ? "bg-red-500" :
                    "bg-yellow-400"
                  }`} />
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {order.imageUrl ? (
                        <img src={order.imageUrl} alt={order.cropName ?? ""} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-4xl">{emoji}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg">{order.cropName ?? "Crop"}</h3>
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLOR[order.status] ?? STATUS_COLOR.pending}`}>
                                {order.status === "shipped" ? "In Transit" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Order #{order.id}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-primary">K{parseFloat(order.totalPrice).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{order.quantity} × {order.unit}</p>
                          </div>
                        </div>

                        {/* Tracking timeline */}
                        <OrderTimeline status={order.status} />

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          {order.farmerName && (
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{order.farmerName}</span>
                          )}
                          {order.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{order.location}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-3 flex-wrap">
                          {order.listingId && (
                            <Link href={`/listing/${order.listingId}`}>
                              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <Package className="w-3.5 h-3.5" /> View Listing
                              </Button>
                            </Link>
                          )}
                          {order.farmerId && (
                            <Link href={`/messages`}>
                              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                                <MessageCircle className="w-3.5 h-3.5" /> Message Farmer
                              </Button>
                            </Link>
                          )}
                          {order.status === "delivered" && (
                            <Button size="sm" className="gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white">
                              <Star className="w-3.5 h-3.5" /> Leave Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-100 border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Total spent</p>
                <p className="text-muted-foreground text-sm">K{orders.reduce((s, o) => s + parseFloat(o.totalPrice), 0).toLocaleString()} across {orders.length} orders</p>
              </div>
            </div>
            <Link href="/marketplace">
              <Button className="gap-2 bg-gradient-to-r from-primary to-emerald-600 whitespace-nowrap">
                <ShoppingBag className="w-4 h-4" /> Order More Crops
              </Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
