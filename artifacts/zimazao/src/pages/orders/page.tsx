import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiOrderDetail } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LiveTrackingModal } from "@/components/live-tracking-modal"
import {
  ShoppingBag, MapPin, User, Loader2, Package, ArrowLeft,
  CheckCircle2, Clock, Truck, Star, MessageCircle, RotateCcw,
  TrendingUp, ChevronDown, Navigation,
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

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = STEP_INDEX[status] ?? 0
  if (status === "cancelled") {
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
                done ? "bg-primary text-white shadow-sm" :
                active ? "bg-primary/15 text-primary ring-2 ring-primary ring-offset-2" :
                "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${done || active ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${done ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-7 h-7 ${(hovered || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  )
}

function ReviewModal({
  order,
  onClose,
  onSubmit,
}: {
  order: ApiOrderDetail
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError("Please select a rating"); return }
    setError(""); setSubmitting(true)
    try {
      await onSubmit(rating, comment)
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold">Rate Your Experience</h3>
            <p className="text-muted-foreground text-sm mt-1">How was your order of <strong>{order.cropName}</strong> from {order.farmerName}?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

            <div className="flex flex-col items-center gap-2">
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-muted-foreground">
                {rating === 0 ? "Tap to rate" : ["","Poor","Fair","Good","Great","Excellent!"][rating]}
              </p>
            </div>

            <div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [orders, setOrders] = useState<ApiOrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [view, setView] = useState<"buyer" | "farmer">("buyer")
  const [reviewOrder, setReviewOrder] = useState<ApiOrderDetail | null>(null)
  const [reviewedOrders, setReviewedOrders] = useState<Set<number>>(new Set())
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [trackingOrder, setTrackingOrder] = useState<ApiOrderDetail | null>(null)

  const isFarmer = user?.userType === "farmer"

  const loadOrders = async (v: "buyer" | "farmer") => {
    setLoading(true)
    try {
      const data = v === "farmer" ? await api.orders.farmerOrders() : await api.orders.list()
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    loadOrders(view)
  }, [user, view])

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdatingStatus(orderId)
    try {
      await api.orders.updateStatus(orderId, status)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    } catch (err: any) {
      alert(err.message || "Failed to update status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewOrder || !reviewOrder.farmerId) return
    await api.reviews.create({ orderId: reviewOrder.id, farmerId: reviewOrder.farmerId, rating, comment })
    setReviewedOrders((prev) => new Set(prev).add(reviewOrder.id))
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus)
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => ["confirmed", "shipped"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  const nextStatuses: Record<string, { label: string; value: string; color: string }[]> = {
    pending:   [{ label: "Confirm", value: "confirmed", color: "bg-blue-500 hover:bg-blue-600 text-white" }, { label: "Cancel", value: "cancelled", color: "bg-red-100 hover:bg-red-200 text-red-700" }],
    confirmed: [{ label: "Mark Dispatched", value: "shipped", color: "bg-purple-500 hover:bg-purple-600 text-white" }],
    shipped:   [{ label: "Mark Delivered", value: "delivered", color: "bg-green-500 hover:bg-green-600 text-white" }],
    delivered: [],
    cancelled: [],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {trackingOrder && (
        <LiveTrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="w-6 h-6" /> Orders</h1>
              <p className="text-white/75 text-sm mt-1">Track and manage your crop orders</p>
            </div>
            <div className="flex gap-4">
              {[{ label: "Total", value: stats.total, color: "text-white" }, { label: "Active", value: stats.active, color: "text-blue-200" }, { label: "Delivered", value: stats.delivered, color: "text-green-200" }].map((s) => (
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
        {isFarmer && (
          <div className="flex gap-2 mb-6 bg-muted p-1 rounded-xl w-fit">
            {(["buyer", "farmer"] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setFilterStatus("all") }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "buyer" ? "My Purchases" : "Orders Received"}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all", "pending", "confirmed", "shipped", "delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === f ? "bg-primary text-white shadow-md" : "bg-muted hover:bg-muted/80 text-foreground"}`}
            >
              {f === "all" ? "All Orders" : f === "shipped" ? "In Transit" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className={`text-xs rounded-full px-1.5 ${filterStatus === f ? "bg-white/20" : "bg-muted-foreground/20"}`}>
                  {orders.filter((o) => o.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

        {!loading && filtered.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">{view === "farmer" ? "No orders received yet" : "No orders yet"}</h3>
              <p className="text-muted-foreground mb-6">{view === "farmer" ? "Orders from buyers will appear here" : "Start buying fresh crops from Zambian farmers"}</p>
              {view === "buyer" && <Link href="/marketplace"><Button className="gap-2 bg-gradient-to-r from-primary to-emerald-600">Browse Marketplace</Button></Link>}
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((order) => {
              const emoji = CROP_EMOJI[(order as any).category] ?? "🌿"
              const isUpdating = updatingStatus === order.id
              const nextActions = view === "farmer" ? (nextStatuses[order.status] ?? []) : []
              const alreadyReviewed = reviewedOrders.has(order.id)

              return (
                <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className={`h-1 w-full ${order.status === "delivered" ? "bg-green-500" : order.status === "shipped" ? "bg-purple-500" : order.status === "confirmed" ? "bg-blue-500" : order.status === "cancelled" ? "bg-red-500" : "bg-yellow-400"}`} />
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

                        <OrderTimeline status={order.status} />

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          {view === "farmer" ? (
                            order.buyerName && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />Buyer: {order.buyerName}</span>
                          ) : (
                            order.farmerName && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{order.farmerName}</span>
                          )}
                          {order.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{order.location}</span>}
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
                          {view === "buyer" && order.farmerId && (
                            <Link href="/messages">
                              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                                <MessageCircle className="w-3.5 h-3.5" /> Message Farmer
                              </Button>
                            </Link>
                          )}
                          {["confirmed", "shipped"].includes(order.status) && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-sm"
                              onClick={() => setTrackingOrder(order)}
                            >
                              <Navigation className="w-3.5 h-3.5" /> Track Live
                            </Button>
                          )}
                          {view === "buyer" && order.status === "delivered" && !alreadyReviewed && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                              onClick={() => setReviewOrder(order)}
                            >
                              <Star className="w-3.5 h-3.5" /> Leave Review
                            </Button>
                          )}
                          {view === "buyer" && alreadyReviewed && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                            </span>
                          )}
                          {view === "farmer" && nextActions.map((action) => (
                            <Button
                              key={action.value}
                              size="sm"
                              className={`gap-1.5 text-xs ${action.color}`}
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(order.id, action.value)}
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && orders.length > 0 && view === "buyer" && (
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
