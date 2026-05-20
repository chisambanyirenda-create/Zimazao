import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiOrderDetail } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, MapPin, User, Loader2, Package, ArrowLeft } from "lucide-react"

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [orders, setOrders] = useState<ApiOrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    api.orders.list()
      .then(setOrders)
      .catch((e) => setError(e.message || "Failed to load orders"))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" /> My Orders
          </h1>
          <p className="text-muted-foreground">Track all your crop purchases</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && orders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start buying crops from Zambian farmers</p>
              <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Crop image or emoji */}
                    {order.imageUrl ? (
                      <img src={order.imageUrl} alt={order.cropName ?? ""} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-4xl">🌿</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{order.cropName ?? "Crop"}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] ?? STATUS_COLOR.pending}`}>
                              {STATUS_LABEL[order.status] ?? order.status}
                            </span>
                            <span className="text-xs text-muted-foreground">Order #{order.id}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">K{parseFloat(order.totalPrice).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Qty: {order.quantity} {order.unit}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        {order.farmerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {order.farmerName}
                          </span>
                        )}
                        {order.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {order.location}
                          </span>
                        )}
                        <span>{new Date(order.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {order.listingId && (
                          <Link href={`/listing/${order.listingId}`}>
                            <Button variant="outline" size="sm">View Listing</Button>
                          </Link>
                        )}
                        {order.farmerId && (
                          <Link href={`/farmer/${order.farmerId}`}>
                            <Button variant="ghost" size="sm">Farmer Profile</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
