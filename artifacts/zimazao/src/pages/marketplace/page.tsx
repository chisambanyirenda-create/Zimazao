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
import {
  Search, MapPin, Grid, List, Map, CheckCircle2, Star, ShoppingCart, Eye,
  TrendingUp, TrendingDown, SlidersHorizontal, Flame, Tag, ChevronDown, ChevronUp, X,
} from "lucide-react"
import { api, type ApiListing } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", cash_crops: "🌿", livestock: "🐄", poultry: "🐔", other: "🌾",
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

const FALLBACK_CROPS = [
  { id: 1, farmerId: 1, farmerName: "John Mwansa",  location: "Choma, Southern",    price: "450", unit: "50kg bag",    quantity: "500", imageUrl: null, verified: true,  category: "cereals",    cropName: "White Maize",          description: "Premium grade white maize, well dried and clean.", isActive: true, createdAt: new Date().toISOString(), rating: 4.8, reviews: 23, hot: true,  discount: 0 },
  { id: 2, farmerId: 2, farmerName: "Mary Banda",   location: "Chipata, Eastern",   price: "304", unit: "25kg bag",    quantity: "200", imageUrl: null, verified: true,  category: "legumes",    cropName: "Groundnuts (Shelled)", description: "Grade A shelled groundnuts, freshly processed.", isActive: true, createdAt: new Date().toISOString(), rating: 4.9, reviews: 45, hot: true,  discount: 20, originalPrice: "380" },
  { id: 3, farmerId: 3, farmerName: "Peter Phiri",  location: "Mkushi, Central",    price: "520", unit: "50kg bag",    quantity: "300", imageUrl: null, verified: true,  category: "legumes",    cropName: "Soybeans",             description: "High protein soybeans, suitable for oil extraction.", isActive: true, createdAt: new Date().toISOString(), rating: 4.7, reviews: 18, hot: false, discount: 0 },
  { id: 4, farmerId: 4, farmerName: "Grace Tembo",  location: "Mazabuka, Southern", price: "238", unit: "25kg bag",    quantity: "150", imageUrl: null, verified: false, category: "oilseeds",   cropName: "Sunflower Seeds",      description: "Oil-grade sunflower seeds.", isActive: true, createdAt: new Date().toISOString(), rating: 4.6, reviews: 12, hot: false, discount: 15, originalPrice: "280" },
  { id: 5, farmerId: 5, farmerName: "James Mumba",  location: "Mansa, Luapula",     price: "150", unit: "50kg bag",    quantity: "400", imageUrl: null, verified: true,  category: "tubers",     cropName: "Cassava (Fresh)",      description: "Fresh cassava roots, same-day delivery available.", isActive: true, createdAt: new Date().toISOString(), rating: 4.5, reviews: 9,  hot: false, discount: 0 },
  { id: 6, farmerId: 6, farmerName: "Ruth Chanda",  location: "Kasama, Northern",   price: "102", unit: "25kg bag",    quantity: "250", imageUrl: null, verified: true,  category: "tubers",     cropName: "Sweet Potatoes",       description: "Orange-fleshed sweet potatoes, high nutrition.", isActive: true, createdAt: new Date().toISOString(), rating: 4.4, reviews: 7,  hot: false, discount: 15, originalPrice: "120" },
  { id: 7, farmerId: 7, farmerName: "David Nkonde", location: "Samfya, Luapula",    price: "315", unit: "50kg bag",    quantity: "600", imageUrl: null, verified: true,  category: "cereals",    cropName: "Sorghum",              description: "Traditional red sorghum, drought resistant variety.", isActive: true, createdAt: new Date().toISOString(), rating: 4.3, reviews: 6,  hot: false, discount: 0 },
  { id: 8, farmerId: 8, farmerName: "Agnes Phiri",  location: "Chongwe, Lusaka",    price: "80",  unit: "20kg crate",  quantity: "100", imageUrl: null, verified: true,  category: "vegetables", cropName: "Mixed Tomatoes",       description: "Fresh tomatoes, packed daily.", isActive: true, createdAt: new Date().toISOString(), rating: 4.7, reviews: 31, hot: true,  discount: 0 },
  { id: 9, farmerId: 1, farmerName: "John Mwansa",  location: "Choma, Southern",    price: "280", unit: "25kg bag",    quantity: "150", imageUrl: null, verified: true,  category: "oilseeds",   cropName: "Sunflower Seeds",      description: "High oil-content sunflower seeds.", isActive: true, createdAt: new Date().toISOString(), rating: 4.5, reviews: 8, hot: false, discount: 10, originalPrice: "310" },
  { id: 10, farmerId: 9, farmerName: "Loveness M.", location: "Mongu, Western",     price: "190", unit: "25kg bag",    quantity: "200", imageUrl: null, verified: true,  category: "fruits",     cropName: "Watermelons",          description: "Large, sweet watermelons from Western Province.", isActive: true, createdAt: new Date().toISOString(), rating: 4.6, reviews: 14, hot: true,  discount: 0 },
]

const categories = [
  { value: "all",       label: "All",         emoji: "🌾" },
  { value: "deals",     label: "Deals 🔥",     emoji: "" },
  { value: "cereals",   label: "Cereals",      emoji: "🌽" },
  { value: "legumes",   label: "Legumes",      emoji: "🫘" },
  { value: "tubers",    label: "Tubers",       emoji: "🥔" },
  { value: "oilseeds",  label: "Oilseeds",     emoji: "🌻" },
  { value: "vegetables",label: "Vegetables",   emoji: "🥬" },
  { value: "fruits",    label: "Fruits",       emoji: "🍎" },
  { value: "livestock", label: "Livestock",    emoji: "🐄" },
  { value: "poultry",   label: "Poultry",      emoji: "🐔" },
  { value: "cash_crops",label: "Cash Crops",   emoji: "🌿" },
]

const provinces = [
  { value: "all",          label: "All Provinces" },
  { value: "central",      label: "Central" },
  { value: "copperbelt",   label: "Copperbelt" },
  { value: "eastern",      label: "Eastern" },
  { value: "luapula",      label: "Luapula" },
  { value: "lusaka",       label: "Lusaka" },
  { value: "northern",     label: "Northern" },
  { value: "northwestern", label: "North-Western" },
  { value: "southern",     label: "Southern" },
  { value: "western",      label: "Western" },
  { value: "muchinga",     label: "Muchinga" },
]

type CropWithExtras = ApiListing & { verified?: boolean; rating?: number; reviews?: number; hot?: boolean; discount?: number; originalPrice?: string }

function CropCard({ crop, viewMode }: { crop: CropWithExtras; viewMode: "grid" | "list" }) {
  const { user } = useAuth()
  const isFarmer = user?.userType === "farmer"
  const emoji = CROP_EMOJI[crop.category] ?? "🌾"
  const gradient = CROP_GRADIENT[crop.category] ?? "from-gray-100 to-slate-50"
  const hasDiscount = (crop.discount ?? 0) > 0

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
                    {hasDiscount && <Badge className="bg-green-600 text-white border-0 text-xs gap-1"><Tag className="w-3 h-3" />{crop.discount}% OFF</Badge>}
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
                  {hasDiscount && crop.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">K{parseFloat(crop.originalPrice).toLocaleString()}</p>
                  )}
                  <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link href={`/listing/${crop.id}`}>
                  {isFarmer ? (
                    <Button size="sm" variant="outline" className="gap-1"><Eye className="w-3.5 h-3.5" />View Details</Button>
                  ) : (
                    <Button size="sm" className="gap-1"><ShoppingCart className="w-3.5 h-3.5" />View & Order</Button>
                  )}
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
                {hasDiscount && <Badge className="bg-green-600 text-white border-0 text-xs gap-1"><Tag className="w-3 h-3" />{crop.discount}%</Badge>}
                {crop.verified && <Badge className="bg-primary text-white border-0 text-xs"><CheckCircle2 className="w-3 h-3" /></Badge>}
              </div>
            </div>
          </div>
        )}
      </Link>
      <CardContent className="p-4 flex-1">
        <Link href={`/listing/${crop.id}`}>
          <h3 className="font-bold text-base text-foreground mb-1 hover:text-primary transition-colors leading-tight">{crop.cropName}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-1">by {crop.farmerName ?? "Farmer"}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{crop.location}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xl font-bold text-primary">K{parseFloat(crop.price).toLocaleString()}</p>
            {hasDiscount && crop.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">K{parseFloat(crop.originalPrice).toLocaleString()}</p>
            )}
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
          {isFarmer ? (
            <Button variant="outline" className="w-full gap-2 h-9 text-sm border-primary text-primary hover:bg-primary/5">
              <Eye className="w-3.5 h-3.5" />View Details
            </Button>
          ) : (
            <Button className="w-full gap-2 h-9 text-sm bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90">
              <ShoppingCart className="w-3.5 h-3.5" />View & Order
            </Button>
          )}
        </Link>
      </CardFooter>
    </Card>
  )
}

const RECENT_KEY = "zimazao_recent_searches"
const MAX_RECENT = 8

function saveRecentSearch(query: string) {
  if (!query.trim() || query.trim().length < 2) return
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    const updated = [query.trim(), ...prev.filter((q) => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {}
}

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") }
  catch { return [] }
}

function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_KEY) }
  catch {}
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [province, setProvince] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [apiListings, setApiListings] = useState<ApiListing[] | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minQty, setMinQty] = useState("")
  const [dealsOnly, setDealsOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showRecent, setShowRecent] = useState(false)

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    api.listings.list()
      .then((data) => { setApiListings(data); setLoading(false) })
      .catch(() => { setApiListings(null); setLoading(false) })
  }, [])

  const source = (apiListings && apiListings.length > 0 ? apiListings : FALLBACK_CROPS) as CropWithExtras[]

  const activeFilterCount = [
    minPrice !== "",
    maxPrice !== "",
    minQty !== "",
    dealsOnly,
    verifiedOnly,
  ].filter(Boolean).length

  const clearAdvanced = () => {
    setMinPrice(""); setMaxPrice(""); setMinQty(""); setDealsOnly(false); setVerifiedOnly(false)
  }

  let filtered = source.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.farmerName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === "all" || category === "deals"
      ? (category === "deals" ? (crop.discount ?? 0) > 0 : true)
      : crop.category === category
    const matchesProvince = province === "all" || crop.location.toLowerCase().includes(province.toLowerCase())
    const matchesMinPrice = minPrice === "" || parseFloat(crop.price) >= parseFloat(minPrice)
    const matchesMaxPrice = maxPrice === "" || parseFloat(crop.price) <= parseFloat(maxPrice)
    const matchesMinQty = minQty === "" || parseFloat(crop.quantity) >= parseFloat(minQty)
    const matchesDeals = !dealsOnly || (crop.discount ?? 0) > 0
    const matchesVerified = !verifiedOnly || crop.verified
    return matchesSearch && matchesCategory && matchesProvince && matchesMinPrice && matchesMaxPrice && matchesMinQty && matchesDeals && matchesVerified
  })

  if (sortBy === "price_low") filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  if (sortBy === "price_high") filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  if (sortBy === "deals") filtered = [...filtered].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))

  const dealsCount = source.filter((c) => (c.discount ?? 0) > 0).length

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
              {dealsCount > 0 && (
                <button
                  onClick={() => setCategory("deals")}
                  className="mt-3 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-full transition-colors border border-white/30"
                >
                  <Tag className="w-4 h-4" /> {dealsCount} active deals — view now
                </button>
              )}
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
              onClick={() => { setCategory(c.value); if (c.value === "deals") setDealsOnly(true); else setDealsOnly(false) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === c.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : c.value === "deals"
                  ? "bg-green-100 hover:bg-green-200 text-green-800"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {c.value !== "deals" && c.emoji} {c.label}
              {c.value === "deals" && <Badge className="bg-green-600 text-white border-0 text-[10px] h-4 px-1 ml-0.5">{dealsCount}</Badge>}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers, locations..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowRecent(e.target.value === "") }}
                onFocus={() => setShowRecent(searchQuery === "" && recentSearches.length > 0)}
                onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    saveRecentSearch(searchQuery)
                    setRecentSearches(getRecentSearches())
                    setShowRecent(false)
                  }
                }}
                className="pl-10 h-11 bg-muted/40"
              />
              {showRecent && recentSearches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg py-2 overflow-hidden">
                  <div className="flex items-center justify-between px-3 pb-1 mb-1 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { clearRecentSearches(); setRecentSearches([]); setShowRecent(false) }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >Clear all</button>
                  </div>
                  {recentSearches.map((q) => (
                    <button
                      key={q}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSearchQuery(q); setShowRecent(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full md:w-44 h-11"><SelectValue placeholder="Province" /></SelectTrigger>
              <SelectContent>{provinces.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-52 h-11">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low → High</SelectItem>
                <SelectItem value="price_high">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="deals">Best Deals</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-1.5 px-3 h-11 rounded-lg border text-sm font-medium transition-all ${showAdvanced || activeFilterCount > 0 ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && <Badge className="bg-white/25 text-white border-0 text-xs h-5 px-1.5">{activeFilterCount}</Badge>}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-11 w-11" onClick={() => setViewMode("grid")}><Grid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-11 w-11" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
              <Button variant={viewMode === "map"  ? "default" : "outline"} size="icon" className="h-11 w-11" onClick={() => setViewMode("map")} title="Map view"><Map className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Advanced Filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAdvanced} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Price (K)</label>
                  <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Price (K)</label>
                  <Input type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Quantity</label>
                  <Input type="number" placeholder="Any" value={minQty} onChange={(e) => setMinQty(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dealsOnly}
                      onChange={(e) => setDealsOnly(e.target.checked)}
                      className="rounded border-border accent-primary w-4 h-4"
                    />
                    <Tag className="w-3.5 h-3.5 text-green-600" />
                    <span>Deals only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border-border accent-primary w-4 h-4"
                    />
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Verified only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-muted-foreground text-sm">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> crops
            {!apiListings && <Badge variant="outline" className="ml-2 text-xs text-amber-600 border-amber-300">Demo data</Badge>}
          </p>
          {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Deals Banner */}
        {category !== "deals" && dealsOnly === false && (
          <div className="hidden md:flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-900 text-sm">{dealsCount} Flash Deals Active</p>
                <p className="text-green-700 text-xs">Farmers offering 10–20% discounts — limited time only</p>
              </div>
            </div>
            <button
              onClick={() => { setCategory("deals"); setDealsOnly(true) }}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              View Deals <TrendingDown className="w-4 h-4" />
            </button>
          </div>
        )}

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
            <Button variant="outline" onClick={() => { setSearchQuery(""); setCategory("all"); setProvince("all"); clearAdvanced() }}>
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
