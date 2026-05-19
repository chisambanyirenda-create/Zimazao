

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Star, Filter, Grid, List, SlidersHorizontal } from "lucide-react"

const crops = [
  {
    id: 1,
    name: "White Maize",
    farmer: "John Mwansa",
    location: "Choma, Southern",
    price: 450,
    unit: "50kg bag",
    rating: 4.8,
    reviews: 23,
    quantity: "500 bags",
    image: "🌽",
    verified: true,
    category: "cereals",
  },
  {
    id: 2,
    name: "Groundnuts (Shelled)",
    farmer: "Mary Banda",
    location: "Chipata, Eastern",
    price: 380,
    unit: "25kg bag",
    rating: 4.9,
    reviews: 45,
    quantity: "200 bags",
    image: "🥜",
    verified: true,
    category: "legumes",
  },
  {
    id: 3,
    name: "Soybeans",
    farmer: "Peter Phiri",
    location: "Mkushi, Central",
    price: 520,
    unit: "50kg bag",
    rating: 4.7,
    reviews: 18,
    quantity: "300 bags",
    image: "🫘",
    verified: true,
    category: "legumes",
  },
  {
    id: 4,
    name: "Sunflower Seeds",
    farmer: "Grace Tembo",
    location: "Mazabuka, Southern",
    price: 280,
    unit: "25kg bag",
    rating: 4.6,
    reviews: 12,
    quantity: "150 bags",
    image: "🌻",
    verified: false,
    category: "oilseeds",
  },
  {
    id: 5,
    name: "Cassava (Fresh)",
    farmer: "James Mumba",
    location: "Mansa, Luapula",
    price: 150,
    unit: "50kg bag",
    rating: 4.5,
    reviews: 28,
    quantity: "400 bags",
    image: "🥔",
    verified: true,
    category: "tubers",
  },
  {
    id: 6,
    name: "Sweet Potatoes",
    farmer: "Ruth Chanda",
    location: "Kasama, Northern",
    price: 120,
    unit: "25kg bag",
    rating: 4.7,
    reviews: 34,
    quantity: "250 bags",
    image: "🍠",
    verified: true,
    category: "tubers",
  },
  {
    id: 7,
    name: "Sorghum",
    farmer: "David Sakala",
    location: "Mongu, Western",
    price: 320,
    unit: "50kg bag",
    rating: 4.4,
    reviews: 15,
    quantity: "180 bags",
    image: "🌾",
    verified: false,
    category: "cereals",
  },
  {
    id: 8,
    name: "Cotton Lint",
    farmer: "Agnes Mwape",
    location: "Mumbwa, Central",
    price: 850,
    unit: "bale",
    rating: 4.9,
    reviews: 8,
    quantity: "50 bales",
    image: "🧶",
    verified: true,
    category: "cash_crops",
  },
]

const categories = [
  { value: "all", label: "All Categories" },
  { value: "cereals", label: "Cereals" },
  { value: "legumes", label: "Legumes" },
  { value: "tubers", label: "Tubers" },
  { value: "oilseeds", label: "Oilseeds" },
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

function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [province, setProvince] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.farmer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === "all" || crop.category === category
    const matchesProvince =
      province === "all" ||
      crop.location.toLowerCase().includes(province.toLowerCase())
    return matchesSearch && matchesCategory && matchesProvince
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Crop Marketplace
          </h1>
          <p className="text-muted-foreground">
            Browse fresh crops from verified farmers across Zambia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Province Filter */}
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov.value} value={prov.value}>
                    {prov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle & More Filters */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 ${viewMode === "list" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCrops.length}</span> crops
          </p>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Crops Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredCrops.map((crop) =>
            viewMode === "grid" ? (
              <Card key={crop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="bg-muted h-40 flex items-center justify-center relative">
                    <span className="text-7xl">{crop.image}</span>
                    {crop.verified && (
                      <Badge className="absolute top-3 right-3 bg-primary">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {crop.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">by {crop.farmer}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {crop.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">K{crop.price}</p>
                      <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-medium">{crop.rating}</span>
                      <span className="text-muted-foreground text-sm">({crop.reviews})</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">Contact Farmer</Button>
                </CardFooter>
              </Card>
            ) : (
              <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-5xl">{crop.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-foreground">
                              {crop.name}
                            </h3>
                            {crop.verified && (
                              <Badge className="bg-primary">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            by {crop.farmer} • {crop.quantity}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            {crop.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">K{crop.price}</p>
                          <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="font-medium">{crop.rating}</span>
                          <span className="text-muted-foreground text-sm">
                            ({crop.reviews} reviews)
                          </span>
                        </div>
                        <Button>Contact Farmer</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {filteredCrops.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No crops found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery("")
              setCategory("all")
              setProvince("all")
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <MarketplaceContent />
  )
}
