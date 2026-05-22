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
  Loader2, User, Package, CalendarDays, CheckCircle, AlertCircle,
  Star, ThumbsUp, Award, Tag, Flame,
} from "lucide-react"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", other: "🌿", livestock: "🐄", poultry: "🐔",
}

type Review = {
  id: number
  reviewer: string
  rating: number
  comment: string
  date: string
  helpful: number
  verified: boolean
}

const DEMO_REVIEWS: Record<number, Review[]> = {
  1: [
    { id: 1, reviewer: "Chanda M.", rating: 5, comment: "Excellent quality maize! Well dried and clean. John delivered on time and communication was great. Will buy again.", date: "2 days ago", helpful: 14, verified: true },
    { id: 2, reviewer: "Bwalya T.", rating: 5, comment: "Best maize I've ordered on Zimazao. Arrived clean and well-bagged. Highly recommend.", date: "1 week ago", helpful: 9, verified: true },
    { id: 3, reviewer: "Mwale P.", rating: 4, comment: "Good quality, fair price. Minor issue with one bag but farmer resolved it quickly.", date: "2 weeks ago", helpful: 5, verified: false },
  ],
  2: [
    { id: 4, reviewer: "Zulu J.", rating: 5, comment: "Grade A groundnuts, perfectly shelled and clean. Ready for oil pressing. Great value!", date: "3 days ago", helpful: 11, verified: true },
    { id: 5, reviewer: "Phiri R.", rating: 4, comment: "Good quality groundnuts. Mary is very responsive and professional.", date: "2 weeks ago", helpful: 7, verified: true },
  ],
  3: [
    { id: 6, reviewer: "Mutale K.", rating: 5, comment: "High protein soybeans as described. Perfect for my poultry feed operation.", date: "5 days ago", helpful: 8, verified: true },
    { id: 7, reviewer: "Namukolo B.", rating: 4, comment: "Good soybeans. Slightly less quantity than listed but Peter made it right.", date: "3 weeks ago", helpful: 3, verified: false },
  ],
}

function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`${cls} ${i <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  )
}

function ReviewSection({ listingId }: { listingId: number }) {
  const { user } = useAuth()
  const reviews = DEMO_REVIEWS[listingId] ?? DEMO_REVIEWS[1]
  const [helpfulSet, setHelpfulSet] = useState<Set<number>>(new Set())
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const dist = [5,4,3,2,1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: (reviews.filter((r) => r.rating === n).length / reviews.length) * 100,
  }))

  const toggleHelpful = (id: number) => {
    setHelpfulSet((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" /> Ratings & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate */}
        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/40 rounded-xl">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</p>
            <StarRating value={avg} size="lg" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ n, count, pct }) => (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-muted-foreground text-xs">{n}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-4 text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{review.reviewer[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{review.reviewer}</p>
                      {review.verified && (
                        <Badge className="h-4 text-[10px] bg-primary/10 text-primary border-0 gap-0.5 px-1.5">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StarRating value={review.rating} />
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 ml-11">{review.comment}</p>
              <div className="ml-11">
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${helpfulSet.has(review.id) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Helpful ({review.helpful + (helpfulSet.has(review.id) ? 1 : 0)})
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Write a review */}
        {user ? (
          submitted ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Review submitted!</p>
                <p className="text-xs text-green-600">Thank you for helping other buyers.</p>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 space-y-4">
              <p className="font-semibold text-sm">Leave a Review</p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Your rating</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(i)}
                    >
                      <Star className={`w-7 h-7 transition-all ${i <= (hoverRating || userRating) ? "fill-yellow-400 text-yellow-400 scale-110" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product and seller…"
                  className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button
                onClick={() => setSubmitted(true)}
                disabled={!userRating || !comment.trim()}
                className="gap-2"
              >
                <Star className="w-4 h-4" /> Submit Review
              </Button>
            </div>
          )
        ) : (
          <div className="p-4 bg-muted/40 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
            <Link href="/login"><Button size="sm" variant="outline">Sign In</Button></Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
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

  const DEMO_LISTINGS: Record<number, ApiListing> = {
    1: { id: 1, farmerId: 1, farmerName: "John Mwansa", cropName: "White Maize", price: "450", unit: "50kg bag", quantity: "500", location: "Choma, Southern", category: "cereals", description: "Premium grade white maize, well dried and stored in certified grain silos. Suitable for both human consumption and animal feed. Available in bulk.", imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
    2: { id: 2, farmerId: 2, farmerName: "Mary Banda", cropName: "Groundnuts (Shelled)", price: "380", unit: "25kg bag", quantity: "200", location: "Chipata, Eastern", category: "legumes", description: "Grade A shelled groundnuts, freshly processed and ready for export or local use. High oil content, ideal for peanut butter and cooking oil.", imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
    3: { id: 3, farmerId: 3, farmerName: "Peter Phiri", cropName: "Soybeans", price: "520", unit: "50kg bag", quantity: "300", location: "Mkushi, Central", category: "legumes", description: "High protein soybeans suitable for oil extraction and animal feed. Clean and dry, tested at 18% moisture.", imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  }

  useEffect(() => {
    if (isNaN(listingId)) { setError("Invalid listing"); setLoading(false); return }
    setLoading(true)
    api.listings.get(listingId)
      .then((l) => { setListing(l); return api.farmers.get(l.farmerId) })
      .then(setFarmer)
      .catch(() => {
        const demo = DEMO_LISTINGS[listingId]
        if (demo) setListing(demo)
        else setError("Listing not found")
      })
      .finally(() => setLoading(false))
  }, [listingId])

  const totalPrice = listing ? parseFloat(listing.price) * parseFloat(qty || "0") : 0

  const [orderFarmerId, setOrderFarmerId] = useState<number | null>(null)

  const handleOrder = async () => {
    if (!user) { navigate("/login"); return }
    setOrdering(true); setOrderError(null)
    try {
      const order = await api.orders.create({ listingId, quantity: qty, totalPrice })
      setOrderFarmerId((order as any).farmerId ?? listing?.farmerId ?? null)
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
  const demoRating = 4 + ((listing.id % 5) * 0.2)
  const demoReviewCount = 8 + (listing.id * 7)

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
            <Card className="overflow-hidden border-0 shadow-md">
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
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="capitalize">{listing.category}</Badge>
                      {listing.id % 3 === 0 && (
                        <Badge className="bg-orange-500 text-white border-0 gap-1 text-xs">
                          <Flame className="w-3 h-3" /> Hot Deal
                        </Badge>
                      )}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={demoRating} />
                      <span className="text-sm font-semibold">{demoRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({demoReviewCount} reviews)</span>
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span className="text-primary font-medium">Verified Listing</span>
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
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-lg">About the Farmer</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{farmer.name[0]}</span>
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
                        {farmer.totalListings} listing{farmer.totalListings !== 1 ? "s" : ""} · Member since {new Date(farmer.createdAt).getFullYear()}
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
              <Card className="border-0 shadow-sm">
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

            {/* Ratings & Reviews */}
            <ReviewSection listingId={listingId} />
          </div>

          {/* Right: Order Panel */}
          <div className="space-y-4">
            {/* Farmer viewing their OWN listing */}
            {user && user.userType === "farmer" && Number(user.id) === Number(listing.farmerId) ? (
              <Card className="sticky top-20 border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />Your Listing</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-emerald-800 font-semibold text-sm mb-1">This is your listing</p>
                    <p className="text-emerald-700 text-xs">Buyers can see this and place orders. You'll be notified via messages.</p>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full gap-2">View Dashboard</Button>
                  </Link>
                  <Link href="/orders">
                    <Button className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600">
                      <Package className="w-4 h-4" /> View Orders Received
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : user && user.userType === "farmer" ? (
              /* Farmer trying to buy someone else's listing */
              <Card className="sticky top-20 border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Place Order</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">🛒</span>
                    </div>
                    <p className="font-bold text-amber-900 mb-1">Switch to Buyer Mode</p>
                    <p className="text-amber-700 text-sm mb-4">
                      You are in <strong>Farmer mode</strong>. To buy crops, switch to Buyer mode from your account menu.
                    </p>
                    <Link href="/dashboard">
                      <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90">
                        Go to Dashboard & Switch Mode
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Normal order panel for buyers / guests */
              <Card className="sticky top-20 border-0 shadow-md">
                <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Place Order</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {orderDone ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="font-bold text-lg">Order placed!</p>
                      <p className="text-sm text-muted-foreground mb-1">The farmer has been notified.</p>
                      <p className="text-xs text-muted-foreground mb-4">A message was sent to confirm your order.</p>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => navigate(`/messages?with=${orderFarmerId ?? listing?.farmerId}`)}
                          className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600"
                        >
                          <MessageCircle className="w-4 h-4" /> Open Chat with Farmer
                        </Button>
                        <Link href="/orders"><Button variant="outline" className="w-full">View My Orders</Button></Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Quantity ({listing.unit}s)</Label>
                        <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="h-11" />
                      </div>

                      <div className="bg-muted/50 rounded-xl p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per {listing.unit}</span>
                          <span>K{parseFloat(listing.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>{qty || 0}</span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary text-lg">K{totalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      {orderError && <p className="text-destructive text-sm">{orderError}</p>}

                      <Button onClick={handleOrder} disabled={ordering || !qty || parseFloat(qty) < 1} className="w-full h-11 gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90">
                        {ordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                        {user ? "Place Order" : "Sign In to Order"}
                      </Button>

                      {!user && (
                        <p className="text-xs text-center text-muted-foreground">
                          <Link href="/login" className="underline text-primary">Sign in</Link> to place an order
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        Secure marketplace transaction. Farmer contacted directly after order.
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
