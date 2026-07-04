import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiOrderDetail } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveTrackingModal } from "@/components/live-tracking-modal"
import {
  ShoppingBag, MapPin, User, Loader2, Package, ArrowLeft,
  CheckCircle2, Clock, Truck, Star, MessageCircle, RotateCcw,
  TrendingUp, ChevronDown, Navigation, AlertTriangle, Lock,
  Banknote, X, ShieldCheck, Share2, Copy,
} from "lucide-react"

const STEPS = [
  { key: "pending",          label: "Placed",          icon: Clock },
  { key: "confirmed",        label: "Confirmed",        icon: CheckCircle2 },
  { key: "packed",           label: "Packed",           icon: Package },
  { key: "shipped",          label: "Dispatched",       icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
  { key: "delivered",        label: "Delivered",        icon: Star },
]

const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5, cancelled: -1,
}

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-500/20 text-yellow-200 border-yellow-500/25",
  confirmed:        "bg-blue-500/20 text-blue-200 border-blue-500/25",
  packed:           "bg-indigo-500/20 text-indigo-200 border-indigo-500/25",
  shipped:          "bg-purple-500/20 text-purple-200 border-purple-500/25",
  out_for_delivery: "bg-orange-500/20 text-orange-200 border-orange-500/25",
  delivered:        "bg-green-500/20 text-green-200 border-green-500/25",
  cancelled:        "bg-red-500/20 text-red-200 border-red-500/25",
  disputed:         "bg-orange-500/20 text-orange-200 border-orange-500/25",
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
        <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
          <RotateCcw className="w-3.5 h-3.5 text-red-300" />
        </div>
        <span className="text-sm font-medium text-red-300">Order Cancelled</span>
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
            <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
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

function DisputeModal({ order, onClose, onSubmit }: {
  order: ApiOrderDetail; onClose: () => void
  onSubmit: (reason: string, description: string) => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const REASONS = [
    { value: "wrong_product", label: "Wrong product received" },
    { value: "wrong_quantity", label: "Wrong quantity" },
    { value: "damaged", label: "Product damaged or spoiled" },
    { value: "payment_issue", label: "Payment issue" },
    { value: "other", label: "Other" },
  ]
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) { setError("Please select a reason"); return }
    if (!description.trim()) { setError("Please describe the issue"); return }
    setError(""); setSubmitting(true)
    try { await onSubmit(reason, description); onClose() }
    catch (err: any) { setError(err.message || "Failed to submit dispute") }
    finally { setSubmitting(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <h3 className="font-bold">Report a Problem</h3>
                <p className="text-xs text-muted-foreground">Order #{order.id} — {order.cropName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-amber-500/15 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-300">
            <strong>Important:</strong> Raising a dispute will <strong>freeze the transaction</strong>. Our team will review and resolve within 24–48 hours. Both parties will be notified.
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason</label>
              <Select onValueChange={setReason}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent position="popper">
                  {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail — what did you expect vs what you received?" rows={4} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Dispute"}
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
  const [disputeOrder, setDisputeOrder] = useState<ApiOrderDetail | null>(null)
  const [confirmingDelivery, setConfirmingDelivery] = useState<number | null>(null)
  const [completingCod, setCompletingCod] = useState<number | null>(null)

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

  const handleConfirmDelivery = async (orderId: number) => {
    if (!confirm("Confirm you received the goods? This will release payment to the farmer.")) return
    setConfirmingDelivery(orderId)
    try {
      await api.orders.confirmDelivery(orderId)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, escrowStatus: "released", status: "delivered" } : o))
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery")
    } finally { setConfirmingDelivery(null) }
  }

  const handleCodComplete = async (orderId: number) => {
    if (!confirm("Mark this Cash on Delivery order as complete? A commission invoice will be sent.")) return
    setCompletingCod(orderId)
    try {
      await api.orders.codComplete(orderId)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, escrowStatus: "cod_complete" as any, status: "delivered" } : o))
    } catch (err: any) {
      alert(err.message || "Failed to mark as complete")
    } finally { setCompletingCod(null) }
  }

  const handleDisputeSubmit = async (reason: string, description: string) => {
    if (!disputeOrder) return
    await api.disputes.raise({ orderId: disputeOrder.id, reason, description })
    setOrders((prev) => prev.map((o) => o.id === disputeOrder!.id ? { ...o, escrowStatus: "frozen" as any } : o))
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus)
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => ["confirmed", "shipped"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  const nextStatuses: Record<string, { label: string; value: string; color: string }[]> = {
    pending:          [{ label: "Confirm Order", value: "confirmed", color: "bg-blue-500 hover:bg-blue-600 text-white" }, { label: "Cancel", value: "cancelled", color: "bg-red-500/20 hover:bg-red-200 text-red-300" }],
    confirmed:        [{ label: "Mark as Packed", value: "packed", color: "bg-indigo-500 hover:bg-indigo-600 text-white" }],
    packed:           [{ label: "Mark Dispatched", value: "shipped", color: "bg-purple-500 hover:bg-purple-600 text-white" }],
    shipped:          [{ label: "Out for Delivery", value: "out_for_delivery", color: "bg-orange-500 hover:bg-orange-600 text-white" }],
    out_for_delivery: [{ label: "Mark Delivered", value: "delivered", color: "bg-green-500 hover:bg-green-600 text-white" }],
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
      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSubmit={handleDisputeSubmit}
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

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "all", label: "All Orders" },
            { key: "pending", label: "Pending" },
            { key: "confirmed", label: "Confirmed" },
            { key: "packed", label: "Packed" },
            { key: "shipped", label: "In Transit" },
            { key: "out_for_delivery", label: "Out for Delivery" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === f.key ? "bg-primary text-white shadow-md" : "bg-muted hover:bg-muted/80 text-foreground"}`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className={`text-xs rounded-full px-1.5 ${filterStatus === f.key ? "bg-white/20" : "bg-muted-foreground/20"}`}>
                  {orders.filter((o) => o.status === f.key).length}
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
                              {order.paymentMethod === "cod" ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/25 flex items-center gap-1">
                                  <Banknote className="w-3 h-3" /> COD
                                </span>
                              ) : order.escrowStatus === "held" ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/25 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Escrow
                                </span>
                              ) : order.escrowStatus === "released" ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-200 border border-green-500/25 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Paid
                                </span>
                              ) : order.escrowStatus === "frozen" ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/25 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Disputed
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Order #{order.id}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-primary">ZMW {parseFloat(order.totalPrice).toLocaleString()}</p>
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
                          {(order as any).trackingToken && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs"
                              onClick={async () => {
                                const url = `${window.location.origin}${import.meta.env.BASE_URL}track/${(order as any).trackingToken}`
                                await navigator.clipboard.writeText(url).catch(() => {})
                                alert("Tracking link copied!")
                              }}
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy Tracking Link
                            </Button>
                          )}
                          {["confirmed", "packed", "shipped", "out_for_delivery"].includes(order.status) && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-sm"
                              onClick={() => setTrackingOrder(order)}
                            >
                              <Navigation className="w-3.5 h-3.5" /> Track Live
                            </Button>
                          )}
                          {view === "buyer" && order.status === "delivered" && order.listingId && (
                            <Link href={`/listing/${order.listingId}`}>
                              <Button
                                size="sm"
                                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Buy Again
                              </Button>
                            </Link>
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
                            <span className="flex items-center gap-1 text-xs text-green-300 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                            </span>
                          )}
                          {view === "buyer" && order.paymentMethod === "online" && order.escrowStatus === "held" && order.status === "delivered" && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white"
                              disabled={confirmingDelivery === order.id}
                              onClick={() => handleConfirmDelivery(order.id)}
                            >
                              {confirmingDelivery === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Confirm Delivery
                            </Button>
                          )}
                          {view === "buyer" && !["cancelled", "disputed"].includes(order.status) && order.escrowStatus !== "frozen" && order.escrowStatus !== "released" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs text-red-300 border-red-500/25 hover:bg-red-500/15"
                              onClick={() => setDisputeOrder(order)}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Report Problem
                            </Button>
                          )}
                          {view === "farmer" && order.paymentMethod === "cod" && ["confirmed", "shipped", "pending"].includes(order.status) && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                              disabled={completingCod === order.id}
                              onClick={() => handleCodComplete(order.id)}
                            >
                              {completingCod === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                              Mark COD Complete
                            </Button>
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
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/15 border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Total spent</p>
                <p className="text-muted-foreground text-sm">ZMW {orders.reduce((s, o) => s + parseFloat(o.totalPrice), 0).toLocaleString()} across {orders.length} orders</p>
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
