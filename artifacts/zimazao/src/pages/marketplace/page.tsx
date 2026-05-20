import { useState, useEffect } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MarketplaceMap } from "@/components/marketplace-map"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Grid, List, Map, CheckCircle2, Star, ShoppingCart, TrendingUp, TrendingDown, SlidersHorizontal, Flame } from "lucide-react"
import { api, type ApiListing } from "@/lib/api"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", cash_crops: "🌿", other: "🌾",
}

const CROP_GRADIENT: Record<string, string> = {
  cereals: "from-yellow-100 to-amber-50",
  legumes: "from-green-100 to-emerald-50",
  tubers: "from-orange-100 to-amber-50",
  oilseeds: "from-yellow-100 to-orange-50",
  vegetables: "from-green-100 to-teal-50",
  fruits: "from-red-100 to-rose-50",
  cash_crops: "from-purple-100 to-violet-50",
  other: "from-gray-100 to-slate-50",
}

const FALLBACK_CROPS = [
  { id: 1, farmerId: 1, farmerName: "John Mwansa", location: "Choma, Southern", price: "450", unit: "50kg bag", quantity: "500", imageUrl: null, verified: true, category: "cereals", cropName: "White Maize", description: "Premium grade white maize, well dried and clean.", isActive: true, createdAt: new Date().toISOString(), rating: 4.8, reviews: 23, hot: true },
  { id: 2, farmerId: 2, farmerName: "Mary Banda", location: "Chipata, Eastern", price: "380", unit: "25kg bag", quantity: "200", imageUrl: null, verified: true, category: "legumes", cropName: "Groundnuts (Shelled)", description: "Grade A shelled groundnuts, freshly processed.", isActive: true, createdAt: new Date().toISOString(), rating: 4.9, reviews: 45, hot: true },
  { id: 3, farmerId: 3, farmerName: "Peter Phiri", location: "Mkushi, Central", price: "520", unit: "50kg bag", quantity: "300", imageUrl: null, verified: true, category: "legumes", cropName: "Soybeans", description: "High protein soybeans, suitable for oil extraction.", isActive: true, createdAt: new Date().toISOString(), rating: 4.7, reviews: 18, hot: false },
  { id: 4, farmerId: 4, farmerName: "Grace Tembo", location: "Mazabuka, Southern", price: "280", unit: "25kg bag", quantity: "150", imageUrl: null, verified: false, category: "oilseeds", cropName: "Sunflower Seeds", description: "Oil-grade sunflower seeds.", isActive: true, createdAt: new Date().toISOString(), rating: 4.6, reviews: 12, hot: false },
  { id: 5, farmerId: 5, farmerName: "James Mumba", location: "Mansa, Luapula", price: "150", unit: "50kg bag", quantity: "400", imageUrl: null, verified: true, category: "tubers", cropName: "Cassava (Fresh)", description: "Fresh cassava roots, same-day delivery available.", isActive: true, createdAt: new Date().toISOString(), rating: 4.5, reviews: 9, hot: false },
  { id: 6, farmerId: 6, farmerName: "Ruth Chanda", location: "Kasama, Northern", price: "120", unit: "25kg bag", quantity: "250", imageUrl: null, verified: true, category: "tubers", cropName: "Sweet Potatoes", description: "Orange-fleshed sweet potatoes, high nutrition.", isActive: true, createdAt: new Date().toISOString(), rating: 4.4, reviews: 7, hot: false },
  { id: 7, farmerId: 7, farmerName: "David Nkonde", location: "Samfya, Luapula", price: "315", unit: "50kg bag", quantity: "600", imageUrl: null, verified: true, category: "cereals", cropName: "Sorghum", description: "Traditional red sorghum, drought resistant variety.", isActive: true, createdAt: new Date().toISOString(), rating: 4.3, reviews: 6, hot: false },
  { id: 8, farmerId: 8, farmerName: "Agnes Phiri", location: "Chongwe, Lusaka", price: "80", unit: "20kg crate", quantity: "100", imageUrl: null, verified: true, category: "vegetables", cropName: "Mixed Tomatoes", description: "Fresh tomatoes, packed daily.", isActive: true, createdAt: new Date().toISOString(), rating: 4.7, reviews: 31, hot: true },
]

const categories = [
  { value: "all", label: "All Categories", emoji: "🌾" },
  { value: "cereals", label: "Cereals", emoji: "🌽" },
  { value: "legumes", label: "Legumes", emoji: "🫘" },
  { value: "tubers", label: "Tubers", emoji: "🥔" },
  { value: "oilseeds", label: "Oilseeds", emoji: "🌻" },
  { value: "vegetables", label: "Vegetables", emoji: "🥬" },
  { value: "fruits", label: "Fruits", emoji: "🍎" },
  { value: "livestock", label: "Livestock", emoji: "🐄" },
  { value: "poultry", label: "Poultry", emoji: "🐔" },
  { value: "cash_crops", label: "Cash Crops", emoji: "🌿" },
]

const provinces = [
  { value: "all", label: "All Provinces" },
  { value: "central", label: "Central" },
  { value: "copperbelt", label: "Copperbelt" },
  { value: "eastern", label: "Eastern" },
  { value: "luapula", label: "Luapula" },
  { value: "lusaka", label: "Lusaka" },
  { value: "northern", label: "Northern" },
  { value: "northwestern", label: "North-Western" },
  { value: "southern", label: "Southern" },
  { value: "western", label: "Western" },
  { value: "muchinga", label: "Muchinga" },
]

type CropWithExtras = ApiListing & { verified?: boolean; rating?: number; reviews?: number; hot?: boolean }

function CropCard({ crop, viewMode }: { crop: CropWithExtras; viewMode: "grid" | "list" }) {
  const emoji = CROP_EMOJI[crop.category] ?? "🌾"
  const gradient = CROP_GRADIENT[crop.category] ?? "from-gray-100 to-slate-50"

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Link href={`/listing/${crop.id}`} className="shrink-0">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.cropName} className="w-24 h-24 rounded-xl object-cover" />
              ) : (
                <div className={`w-24 h-24 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                  <span className="text-5xl">{emoji}</span>
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link href={`/listing/${crop.id}`}>
                      <h3 className="font-bold text-lg hover:text-primary transition-colors">{crop.cropName}</h3>
                    </Link>
                    {crop.hot && <Badge className="bg-orange-500 text-white border-0 text-xs gap-1"><Flame className="w-3 h-3" />Hot</Badge>}
                    {crop.verified && <Badge className="bg-primary text-white border-0 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Verified</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">by {crop.farmerName} · {crop.quantity} {crop.unit}s available</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />{crop.location}
                  </div>
                  {crop.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{crop.rating}</span>
                      <span className="text-xs text-muted-foreground">({crop.reviews} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">K{parseFloat(crop.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link href={`/listing/${crop.id}`}>
                  <Button size="sm" className="gap-1"><ShoppingCart className="w-3.5 h-3.5" />View & Order</Button>
                </Link>
                {crop.farmerId > 0 && (
                  <Link href={`/farmer/${crop.farmerId}`}>
                    <Button variant="outline" size="sm">Farmer Profile</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border-0 shadow-md">
      <Link href={`/listing/${crop.id}`}>
        {crop.imageUrl ? (
          <img src={crop.imageUrl} alt={crop.cropName} className="w-full h-44 object-cover" />
        ) : (
          <div className={`bg-gradient-to-br ${gradient} h-44 flex items-center justify-center relative`}>
            <span className="text-8xl">{emoji}</span>
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <Badge className="bg-white/90 text-foreground text-xs border-0 shadow-sm capitalize">{crop.category.replace("_", " ")}</Badge>
              <div className="flex gap-1">
                {crop.hot && <Badge className="bg-orange-500 text-white border-0 text-xs gap-1"><Flame className="w-3 h-3" /></Badge>}
                {crop.verified && <Badge className="bg-primary text-white border-0 text-xs"><CheckCircle2 className="w-3 h-3" /></Badge>}
              </div>
            </div>
          </div>
        )}
      </Link>
      <CardContent className="p-4 flex-1">
        <Link href={`/listing/${crop.id}`}>
          <h3 className="font-bold text-base text-foreground mb-1 hover:text-primary transition-colors leading-tight">
            {crop.cropName}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-1">by {crop.farmerName ?? "Farmer"}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{crop.location}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xl font-bold text-primary">K{parseFloat(crop.price).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per {crop.unit}</p>
          </div>
          {crop.rating && (
            <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-foreground">{crop.rating}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{crop.quantity} {crop.unit}s available</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Link href={`/listing/${crop.id}`} className="w-full">
          <Button className="w-full gap-2 h-9 text-sm"><ShoppingCart className="w-3.5 h-3.5" />View & Order</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [province, setProvince] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [apiListings, setApiListings] = useState<ApiListing[] | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listings.list()
      .then((data) => { setApiListings(data); setLoading(false) })
      .catch(() => { setApiListings(null); setLoading(false) })
  }, [])

  const source = (apiListings && apiListings.length > 0 ? apiListings : FALLBACK_CROPS) as CropWithExtras[]

  let filtered = source.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.farmerName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === "all" || crop.category === category
    const matchesProvince = province === "all" || crop.location.toLowerCase().includes(province.toLowerCase())
    return matchesSearch && matchesCategory && matchesProvince
  })

  if (sortBy === "price_low") filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  if (sortBy === "price_high") filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">🌾 Crop Marketplace</h1>
              <p className="text-white/80">Browse fresh crops from verified farmers across all 10 provinces of Zambia</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{source.length}+</p>
                <p className="text-white/70 text-sm">Active Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">200+</p>
                <p className="text-white/70 text-sm">Verified Farmers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">10</p>
                <p className="text-white/70 text-sm">Provinces</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === c.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/40"
              />
            </div>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full md:w-44 h-11"><SelectValue placeholder="Province" /></SelectTrigger>
              <SelectContent>{provinces.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low"><TrendingUp className="w-3 h-3 inline mr-1" />Price: Low → High</SelectItem>
                <SelectItem value="price_high"><TrendingDown className="w-3 h-3 inline mr-1" />Price: High → Low</SelectItem>
                <SelectItem value="rating"><Star className="w-3 h-3 inline mr-1 fill-yellow-400 text-yellow-400" />Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1.5">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-11 w-11" onClick={() => setViewMode("grid")}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-11 w-11" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "map" ? "default" : "outline"} size="icon" className="h-11 w-11 relative" onClick={() => setViewMode("map")} title="Map view">
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-muted-foreground text-sm">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> crops
            {!apiListings && <Badge variant="outline" className="ml-2 text-xs text-amber-600 border-amber-300">Demo data</Badge>}
          </p>
          {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>

        {viewMode === "map" ? (
          <MarketplaceMap listings={filtered} />
        ) : filtered.length > 0 ? (
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}>
            {filtered.map((crop) => <CropCard key={crop.id} crop={crop} viewMode={viewMode} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-foreground mb-2">No crops found</p>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setCategory("all"); setProvince("all") }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {viewMode !== "map" && filtered.length > 0 && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" className="px-10">Load More Listings</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
