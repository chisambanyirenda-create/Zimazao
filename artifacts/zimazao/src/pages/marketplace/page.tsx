import { useState, useEffect } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Filter, Grid, List, Phone } from "lucide-react"
import { api, type ApiListing } from "@/lib/api"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", cash_crops: "🌿", other: "🌿",
}

const FALLBACK_CROPS = [
  { id: 1, farmerId: 0, farmerName: "John Mwansa", location: "Choma, Southern", price: "450", unit: "50kg bag", quantity: "500", imageUrl: null, verified: true, category: "cereals", cropName: "White Maize", description: null, isActive: true, createdAt: new Date().toISOString() },
  { id: 2, farmerId: 0, farmerName: "Mary Banda", location: "Chipata, Eastern", price: "380", unit: "25kg bag", quantity: "200", imageUrl: null, verified: true, category: "legumes", cropName: "Groundnuts (Shelled)", description: null, isActive: true, createdAt: new Date().toISOString() },
  { id: 3, farmerId: 0, farmerName: "Peter Phiri", location: "Mkushi, Central", price: "520", unit: "50kg bag", quantity: "300", imageUrl: null, verified: true, category: "legumes", cropName: "Soybeans", description: null, isActive: true, createdAt: new Date().toISOString() },
  { id: 4, farmerId: 0, farmerName: "Grace Tembo", location: "Mazabuka, Southern", price: "280", unit: "25kg bag", quantity: "150", imageUrl: null, verified: false, category: "oilseeds", cropName: "Sunflower Seeds", description: null, isActive: true, createdAt: new Date().toISOString() },
  { id: 5, farmerId: 0, farmerName: "James Mumba", location: "Mansa, Luapula", price: "150", unit: "50kg bag", quantity: "400", imageUrl: null, verified: true, category: "tubers", cropName: "Cassava (Fresh)", description: null, isActive: true, createdAt: new Date().toISOString() },
  { id: 6, farmerId: 0, farmerName: "Ruth Chanda", location: "Kasama, Northern", price: "120", unit: "25kg bag", quantity: "250", imageUrl: null, verified: true, category: "tubers", cropName: "Sweet Potatoes", description: null, isActive: true, createdAt: new Date().toISOString() },
]

const categories = [
  { value: "all", label: "All Categories" },
  { value: "cereals", label: "Cereals" },
  { value: "legumes", label: "Legumes" },
  { value: "tubers", label: "Tubers" },
  { value: "oilseeds", label: "Oilseeds" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "cash_crops", label: "Cash Crops" },
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

function CropCard({ crop, viewMode }: { crop: ApiListing & { verified?: boolean }, viewMode: "grid" | "list" }) {
  const emoji = CROP_EMOJI[crop.category] ?? "🌿"

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Link href={`/listing/${crop.id}`} className="shrink-0">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.cropName} className="w-24 h-24 rounded-xl object-cover" />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center">
                  <span className="text-5xl">{emoji}</span>
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/listing/${crop.id}`}>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">{crop.cropName}</h3>
                    </Link>
                    <Badge className="bg-primary text-xs">Verified</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">by {crop.farmerName} · {crop.quantity} {crop.unit}s</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />{crop.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">K{parseFloat(crop.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link href={`/listing/${crop.id}`}>
                  <Button size="sm">View Details</Button>
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/listing/${crop.id}`}>
          {crop.imageUrl ? (
            <img src={crop.imageUrl} alt={crop.cropName} className="w-full h-40 object-cover" />
          ) : (
            <div className="bg-muted h-40 flex items-center justify-center">
              <span className="text-7xl">{emoji}</span>
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <Link href={`/listing/${crop.id}`}>
          <h3 className="font-semibold text-lg text-foreground mb-1 hover:text-primary transition-colors">
            {crop.cropName}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-1">by {crop.farmerName ?? "Farmer"}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />{crop.location}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">K{parseFloat(crop.price).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per {crop.unit}</p>
          </div>
          <Badge variant="secondary" className="capitalize text-xs">{crop.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Link href={`/listing/${crop.id}`} className="flex-1">
          <Button className="w-full">View & Order</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [province, setProvince] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [apiListings, setApiListings] = useState<ApiListing[] | null>(null)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    api.listings.list().then(setApiListings).catch(() => setApiListings(null))
  }, [])

  const source = apiListings ?? (FALLBACK_CROPS as any[])

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Crop Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops from verified farmers across Zambia</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-44 h-12"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full md:w-44 h-12"><SelectValue placeholder="Province" /></SelectTrigger>
              <SelectContent>{provinces.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant={viewMode === "grid" ? "secondary" : "outline"} size="icon" className="h-12 w-12" onClick={() => setViewMode("grid")}>
                <Grid className="w-5 h-5" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "outline"} size="icon" className="h-12 w-12" onClick={() => setViewMode("list")}>
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> crops
            {apiListings === null && <span className="text-xs ml-2 text-amber-600">(demo data)</span>}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filtered.map((crop) => <CropCard key={crop.id} crop={crop} viewMode={viewMode} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No crops found matching your criteria</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setCategory("all"); setProvince("all") }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
