import { useState, useEffect } from "react"
import { useParams, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { api, type ApiTrackingInfo } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, User, CheckCircle2, Clock, Truck, Loader2, Share2, Copy, AlertCircle } from "lucide-react"

const STEPS = [
  { key: "pending",          label: "Order Placed",        icon: Package,     desc: "Your order has been placed and is awaiting confirmation." },
  { key: "confirmed",        label: "Confirmed by Farmer", icon: CheckCircle2, desc: "The farmer has confirmed your order." },
  { key: "packed",           label: "Packed & Ready",      icon: Package,     desc: "Your order has been packed and is ready for dispatch." },
  { key: "shipped",          label: "Dispatched",          icon: Truck,       desc: "Your order has been dispatched by the farmer." },
  { key: "out_for_delivery", label: "Out for Delivery",    icon: Truck,       desc: "Your order is out for delivery and arriving soon!" },
  { key: "delivered",        label: "Delivered",           icon: CheckCircle2, desc: "Your order has been delivered successfully." },
]

const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5, cancelled: -1,
}

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<ApiTrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return }
    api.orders.track(token)
      .then(setInfo)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  const shareLink = `${window.location.origin}${window.location.pathname}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading tracking info...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">This tracking link is invalid or has expired.</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const currentIdx = STEP_INDEX[info.status] ?? 0
  const isCancelled = info.status === "cancelled"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Tracking</h1>
          <p className="text-muted-foreground mt-1">Order #{info.id}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-lg">{info.cropName}</h3>
                <p className="text-muted-foreground text-sm">{info.quantity} {info.unit}(s)</p>
              </div>
              <Badge className={isCancelled ? "bg-red-500/20 text-red-300 border-red-500/25" : "bg-primary/10 text-primary border-primary/20"}>
                {isCancelled ? "Cancelled" : STEPS[currentIdx]?.label ?? info.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" /> {info.farmerName ?? "Farmer"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" /> {info.location ?? "Zambia"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="w-4 h-4" /> Ordered {new Date(info.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              {info.estimatedDelivery && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Est. {info.estimatedDelivery}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isCancelled ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-300" />
              </div>
              <p className="font-semibold text-red-300">Order Cancelled</p>
              <p className="text-muted-foreground text-sm mt-1">This order has been cancelled.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">Delivery Progress</h3>
              <div className="space-y-0">
                {STEPS.map((step, idx) => {
                  const done = idx < currentIdx
                  const active = idx === currentIdx
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                          done ? "bg-primary border-primary text-white" :
                          active ? "bg-primary/10 border-primary text-primary" :
                          "bg-muted border-muted-foreground/20 text-muted-foreground/40"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`w-0.5 h-10 mt-1 ${done ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-8 flex-1 min-w-0">
                        <p className={`font-medium text-sm ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {step.label}
                          {active && <Badge className="ml-2 bg-primary text-white text-xs">Current</Badge>}
                        </p>
                        {(done || active) && (
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Share Tracking Link</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{shareLink}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigator.share?.({ url: shareLink, title: `Order #${info.id} Tracking` })} className="gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
