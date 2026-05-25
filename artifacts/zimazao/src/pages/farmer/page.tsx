import { useState, useEffect } from "react"
import { useParams, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { api, type ApiFarmerProfile, type ApiListing, type ApiFarmerReviews } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin, Phone, User, Package, ArrowLeft, Loader2, AlertCircle,
  CalendarDays, MessageCircle, Star, CheckCircle2, ShoppingCart,
  TrendingUp, Award, Shield, Leaf, ChevronRight, Flag,
} from "lucide-react"
import { ReportModal } from "@/components/report-modal"

type FarmerListing = Omit<ApiListing, "farmerId" | "farmerName" | "isActive">

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", cash_crops: "🌿", livestock: "🐄",
  poultry: "🐔", other: "🌾",
}

const CROP_GRADIENT: Record<string, string> = {
  cereals: "from-yellow-100 to-amber-50",
  legumes: "from-green-100 to-emerald-50",
  tubers: "from-orange-100 to-amber-50",
  oilseeds: "from-yellow-100 to-orange-50",
  vegetables: "from-green-100 to-teal-50",
  fruits: "from-red-100 to-rose-50",
  cash_crops: "from-purple-100 to-violet-50",
  livestock: "from-amber-100 to-orange-50",
  poultry: "from-yellow-100 to-amber-50",
  other: "from-gray-100 to-slate-50",
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getMemberYears(createdAt: string) {
  return new Date().getFullYear() - new Date(createdAt).getFullYear()
}

function getAvatarColor(id: number) {
  const colors = [
    "from-emerald-500 to-green-600",
    "from-amber-500 to-orange-600",
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-pink-600",
    "from-teal-500 to-cyan-600",
  ]
  return colors[id % colors.length]
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${cls} ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 fill-muted-foreground/10"}`} />
      ))}
    </div>
  )
}

export default function FarmerProfilePage() {
  const params = useParams<{ id: string }>()
  const farmerId = parseInt(params.id ?? "", 10)
  const [farmer, setFarmer] = useState<ApiFarmerProfile | null>(null)
  const [reviews, setReviews] = useState<ApiFarmerReviews | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<"listings" | "reviews" | "about">("listings")
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (isNaN(farmerId)) { setError(true); setLoading(false); return }
    Promise.all([
      api.farmers.get(farmerId),
      api.reviews.forFarmer(farmerId),
    ])
      .then(([farmerData, reviewData]) => {
        setFarmer(farmerData)
        setReviews(reviewData)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [farmerId])

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading farmer profile…</p>
      </div>
      <Footer />
    </div>
  )

  if (error || !farmer) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-40 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Farmer not found</h2>
        <p className="text-muted-foreground mb-6">This farmer profile doesn't exist or has been removed.</p>
        <Link href="/marketplace"><Button className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Marketplace</Button></Link>
      </div>
      <Footer />
    </div>
  )

  const whatsappUrl = farmer.phone
    ? `https://wa.me/${farmer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${farmer.name}, I found your profile on Zimazao and I'd like to discuss buying your produce.`)}`
    : null

  const memberYears = getMemberYears(farmer.createdAt)
  const avatarGradient = getAvatarColor(farmer.id)
  const initials = getInitials(farmer.name)
  const avgPrice = farmer.listings.length > 0
    ? Math.round(farmer.listings.reduce((s, l) => s + parseFloat(l.price), 0) / farmer.listings.length)
    : 0
  const categories = [...new Set(farmer.listings.map((l) => l.category))]
  const avgRating = reviews?.averageRating ?? 0
  const totalReviews = reviews?.totalReviews ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-primary via-emerald-700 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-0">
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-6 pb-8">
            <div className={`w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br ${avatarGradient} rounded-2xl flex items-center justify-center shrink-0 shadow-xl border-4 border-white/20`}>
              <span className="text-3xl md:text-4xl font-bold text-white">{initials}</span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{farmer.name}</h1>
                <Badge className="bg-white/20 text-white border-white/30 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Farmer
                </Badge>
              </div>
              {farmer.location && (
                <div className="flex items-center gap-1.5 text-white/75 text-sm mb-2">
                  <MapPin className="w-4 h-4" />{farmer.location}
                </div>
              )}
              {avgRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRow rating={Math.round(avgRating)} size="sm" />
                  <span className="text-white font-bold text-sm">{avgRating.toFixed(1)}</span>
                  <span className="text-white/60 text-xs">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge key={cat} className="bg-white/15 text-white border-white/25 text-xs capitalize gap-1">
                    {CROP_EMOJI[cat] ?? "🌾"} {cat.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-2 shrink-0">
              <Link href={`/messages?farmer=${farmer.id}&name=${encodeURIComponent(farmer.name)}`}>
                <Button className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 w-full shadow-lg">
                  <MessageCircle className="w-4 h-4" /> Send Message
                </Button>
              </Link>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2 w-full">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </Button>
                </a>
              )}
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-red-300 transition-colors mt-1"
              >
                <Flag className="w-3 h-3" /> Report this farmer
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-px bg-white/10 rounded-t-2xl overflow-hidden">
            {[
              { label: "Listings", value: farmer.totalListings, icon: Package },
              { label: "Avg. Price", value: `ZMW ${avgPrice.toLocaleString()}`, icon: TrendingUp },
              { label: avgRating > 0 ? `${avgRating.toFixed(1)} Rating` : "No Rating Yet", value: avgRating > 0 ? `${totalReviews} reviews` : "Be first!", icon: Star },
              { label: "Years Active", value: memberYears > 0 ? `${memberYears}yr` : "<1yr", icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 bg-white/5 px-4 py-4 text-center hover:bg-white/10 transition-colors">
                <stat.icon className="w-4 h-4 text-white/60 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Column */}
          <div className="flex-1 min-w-0">
            {/* Mobile contact buttons */}
            <div className="flex gap-3 mb-6 md:hidden">
              <Link href={`/messages?farmer=${farmer.id}&name=${encodeURIComponent(farmer.name)}`} className="flex-1">
                <Button className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600">
                  <MessageCircle className="w-4 h-4" /> Message
                </Button>
              </Link>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </Button>
                </a>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border">
              {([
                { key: "listings", label: `Listings (${farmer.totalListings})`, icon: Package },
                { key: "reviews", label: `Reviews (${totalReviews})`, icon: Star },
                { key: "about", label: "About", icon: User },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <>
                {farmer.listings.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="text-xl font-semibold text-foreground mb-1">No active listings</p>
                    <p className="text-muted-foreground">Check back later for new crops from {farmer.name.split(" ")[0]}.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {farmer.listings.map((listing) => {
                      const emoji = CROP_EMOJI[listing.category] ?? "🌾"
                      const gradient = CROP_GRADIENT[listing.category] ?? "from-gray-100 to-slate-50"
                      return (
                        <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md flex flex-col group">
                          <Link href={`/listing/${listing.id}`}>
                            {listing.imageUrl ? (
                              <img src={listing.imageUrl} alt={listing.cropName} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className={`bg-gradient-to-br ${gradient} h-44 flex items-center justify-center`}>
                                <span className="text-8xl">{emoji}</span>
                              </div>
                            )}
                          </Link>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Link href={`/listing/${listing.id}`}>
                                <h3 className="font-bold text-foreground hover:text-primary transition-colors leading-tight">{listing.cropName}</h3>
                              </Link>
                              <Badge variant="secondary" className="text-xs capitalize shrink-0">{listing.category.replace("_", " ")}</Badge>
                            </div>
                            {listing.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{listing.description}</p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-xl font-bold text-primary">ZMW {parseFloat(listing.price).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">per {listing.unit}</p>
                              </div>
                            </div>
                            <Link href={`/listing/${listing.id}`} className="mt-auto">
                              <Button className="w-full gap-2 h-9 text-sm bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90">
                                <ShoppingCart className="w-3.5 h-3.5" /> View & Order
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-5">
                {/* Rating summary */}
                {totalReviews > 0 ? (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="text-center shrink-0">
                            <p className="text-6xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                            <StarRow rating={Math.round(avgRating)} size="md" />
                            <p className="text-sm text-muted-foreground mt-1">{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</p>
                          </div>
                          <div className="flex-1 w-full space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = reviews?.reviews.filter((r) => r.rating === star).length ?? 0
                              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                              return (
                                <div key={star} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-14 shrink-0">
                                    <span className="text-xs font-medium text-muted-foreground">{star}</span>
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-400 rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {reviews?.reviews.map((review) => (
                      <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {review.buyerName ? getInitials(review.buyerName) : "?"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="font-semibold text-sm">{review.buyerName ?? "Anonymous"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <StarRow rating={review.rating} size="sm" />
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">"{review.comment}"</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-yellow-300" />
                    </div>
                    <p className="text-xl font-semibold text-foreground mb-1">No reviews yet</p>
                    <p className="text-muted-foreground">Be the first to leave a review after ordering from {farmer.name.split(" ")[0]}.</p>
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> About {farmer.name.split(" ")[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {farmer.location && (
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium text-sm">{farmer.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <CalendarDays className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Member Since</p>
                          <p className="font-medium text-sm">{new Date(farmer.createdAt).toLocaleDateString("en-ZM", { year: "numeric", month: "long" })}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Listings</p>
                          <p className="font-medium text-sm">{farmer.totalListings} active</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Leaf className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Specialises In</p>
                          <p className="font-medium text-sm capitalize">{categories.slice(0, 2).join(", ").replace(/_/g, " ") || "Various crops"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Crops Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl text-sm">
                          <span>{CROP_EMOJI[cat] ?? "🌾"}</span>
                          <span className="font-medium capitalize">{cat.replace("_", " ")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-5">
            {/* Contact Card */}
            <Card className="border-0 shadow-md sticky top-20">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-foreground">Contact {farmer.name.split(" ")[0]}</h3>

                <Link href={`/messages?farmer=${farmer.id}&name=${encodeURIComponent(farmer.name)}`} className="block">
                  <Button className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 h-11">
                    <MessageCircle className="w-4 h-4" /> Send Message
                  </Button>
                </Link>

                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white h-11">
                      <Phone className="w-4 h-4" /> WhatsApp
                    </Button>
                  </a>
                )}

                <div className="border-t border-border pt-3 space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Rating</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      {avgRating > 0 ? (
                        <><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {avgRating.toFixed(1)} / 5</>
                      ) : "No reviews yet"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member since</span>
                    <span className="text-foreground font-medium">{new Date(farmer.createdAt).getFullYear()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active listings</span>
                    <span className="text-foreground font-medium">{farmer.totalListings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-3 text-sm">Seller Badges</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: CheckCircle2, color: "text-primary bg-primary/10", label: "ID Verified", desc: "Government ID confirmed" },
                    { icon: Shield, color: "text-blue-600 bg-blue-50", label: "Trusted Seller", desc: "Consistent positive feedback" },
                    { icon: Award, color: "text-amber-600 bg-amber-50", label: "Active Farmer", desc: `${farmer.totalListings}+ listings posted` },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${badge.color} rounded-lg flex items-center justify-center shrink-0`}>
                        <badge.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{badge.label}</p>
                        <p className="text-xs text-muted-foreground">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Browse */}
            {farmer.listings.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Browse</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-2">
                  {farmer.listings.slice(0, 4).map((listing) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
                        <span className="text-xl">{CROP_EMOJI[listing.category] ?? "🌾"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{listing.cropName}</p>
                          <p className="text-xs text-muted-foreground">ZMW {parseFloat(listing.price).toLocaleString()} / {listing.unit}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {showReport && farmer && (
        <ReportModal
          targetType="user"
          targetId={farmer.id}
          targetName={farmer.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
