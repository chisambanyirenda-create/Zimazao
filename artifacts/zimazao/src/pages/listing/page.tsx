import { useState, useEffect } from "react"
import { useParams, useLocation, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { api, type ApiListing, type ApiFarmerProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin, Phone, MessageCircle, ShoppingCart, ArrowLeft,
  Loader2, User, Package, CalendarDays, CheckCircle, AlertCircle
} from "lucide-react"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", other: "🌿",
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const [, navigate] = useLocation()
  const { user } = useAuth()
  const listingId = parseInt(params.id ?? "", 10)

  const [listing, setListing] = useState<ApiListing | null>(null)
  const [farmer, setFarmer] = useState<ApiFarmerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [qty, setQty] = useState("1")
  const [ordering, setOrdering] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  const [msgText, setMsgText] = useState("")
  const [sending, setSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [msgError, setMsgError] = useState<string | null>(null)

  useEffect(() => {
    if (isNaN(listingId)) { setError("Invalid listing"); setLoading(false); return }
    setLoading(true)
    api.listings.get(listingId)
      .then((l) => {
        setListing(l)
        return api.farmers.get(l.farmerId)
      })
      .then(setFarmer)
      .catch(() => setError("Listing not found"))
      .finally(() => setLoading(false))
  }, [listingId])

  const totalPrice = listing ? parseFloat(listing.price) * parseFloat(qty || "0") : 0

  const handleOrder = async () => {
    if (!user) { navigate("/login"); return }
    setOrdering(true); setOrderError(null)
    try {
      await api.orders.create({ listingId, quantity: qty, totalPrice })
      setOrderDone(true)
    } catch (e: any) {
      setOrderError(e.message || "Order failed")
    } finally { setOrdering(false) }
  }

  const handleMessage = async () => {
    if (!user) { navigate("/login"); return }
    if (!msgText.trim() || !listing) return
    setSending(true); setMsgError(null)
    try {
      await api.messages.send(listing.farmerId, msgText.trim())
      setMsgSent(true); setMsgText("")
    } catch (e: any) {
      setMsgError(e.message || "Failed to send")
    } finally { setSending(false) }
  }

  const whatsappUrl = farmer?.phone
    ? `https://wa.me/${farmer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your ${listing?.cropName} listing on Zimazao.`)}`
    : null

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
      <Footer />
    </div>
  )

  if (error || !listing) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Listing not found</h2>
        <Link href="/marketplace"><Button>Back to Marketplace</Button></Link>
      </div>
      <Footer />
    </div>
  )

  const emoji = CROP_EMOJI[listing.category] ?? "🌿"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Photo + Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt={listing.cropName} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-muted flex items-center justify-center">
                  <span className="text-9xl">{emoji}</span>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{listing.cropName}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">{listing.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">K{parseFloat(listing.price).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">per {listing.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Available: <strong className="text-foreground">{listing.quantity} {listing.unit}s</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Listed {new Date(listing.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                {listing.description && (
                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{listing.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Farmer Info Card */}
            {farmer && (
              <Card>
                <CardHeader><CardTitle className="text-lg">About the Farmer</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <Link href={`/farmer/${farmer.id}`} className="font-semibold text-lg hover:text-primary transition-colors">
                        {farmer.name}
                      </Link>
                      {farmer.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />{farmer.location}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {farmer.totalListings} active listing{farmer.totalListings !== 1 ? "s" : ""} · Member since {new Date(farmer.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px]">
                        <Button className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
                          <Phone className="w-4 h-4" /> WhatsApp
                        </Button>
                      </a>
                    )}
                    <Link href={`/farmer/${farmer.id}`} className="flex-1 min-w-[140px]">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" /> View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Send Message */}
            {user && Number(user.id) !== Number(listing.farmerId) && (
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="w-5 h-5" />Message Farmer</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {msgSent ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Message sent! Check your inbox for a reply.</span>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        placeholder={`Hi ${listing.farmerName ?? "farmer"}, I'm interested in your ${listing.cropName}…`}
                        className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      />
                      {msgError && <p className="text-destructive text-sm">{msgError}</p>}
                      <Button onClick={handleMessage} disabled={sending || !msgText.trim()} className="gap-2">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                        Send Message
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Order Panel */}
          <div className="space-y-4">
            <Card className="sticky top-20">
              <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Place Order</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {orderDone ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold">Order placed!</p>
                    <p className="text-sm text-muted-foreground mb-4">The farmer will contact you shortly.</p>
                    <Link href="/orders"><Button variant="outline" className="w-full">View My Orders</Button></Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Quantity ({listing.unit}s)</Label>
                      <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="h-11" />
                    </div>

                    <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per {listing.unit}</span>
                        <span>K{parseFloat(listing.price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{qty || 0}</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">K{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {orderError && <p className="text-destructive text-sm">{orderError}</p>}

                    <Button onClick={handleOrder} disabled={ordering || !qty || parseFloat(qty) < 1} className="w-full h-11 gap-2">
                      {ordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                      {user ? "Place Order" : "Sign In to Order"}
                    </Button>

                    {!user && (
                      <p className="text-xs text-center text-muted-foreground">
                        <Link href="/login" className="underline text-primary">Sign in</Link> to place an order
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
