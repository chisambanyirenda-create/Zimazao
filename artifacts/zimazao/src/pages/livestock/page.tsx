import { useState } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MapPin, Search, CheckCircle2, Star, MessageCircle,
  ArrowRight, Beef, ShoppingBag, TrendingUp, Shield, Syringe, Scale,
  ChevronRight, Phone, Flame,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const LIVESTOCK_CATEGORIES = [
  { value: "cattle", label: "Cattle", emoji: "🐄", desc: "Beef & dairy breeds", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "goats", label: "Goats", emoji: "🐐", desc: "Boer, local breeds", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "sheep", label: "Sheep", emoji: "🐑", desc: "Mutton & wool", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "pigs", label: "Pigs", emoji: "🐷", desc: "Large White, Landrace", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "poultry", label: "Poultry", emoji: "🐔", desc: "Broilers & layers", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "rabbits", label: "Rabbits", emoji: "🐇", desc: "Meat rabbits", color: "bg-purple-50 text-purple-700 border-purple-200" },
]

const LIVESTOCK_PRICES = [
  { type: "Mature Bull", emoji: "🐂", unit: "per head", avg: 8500, change: 4.2, hot: true },
  { type: "Heifer (2yr)", emoji: "🐄", unit: "per head", avg: 5200, change: 2.8, hot: true },
  { type: "Dairy Cow", emoji: "🐄", unit: "per head", avg: 7800, change: 1.5, hot: false },
  { type: "Boer Goat", emoji: "🐐", unit: "per head", avg: 850, change: 5.3, hot: true },
  { type: "Local Goat", emoji: "🐐", unit: "per head", avg: 450, change: 3.1, hot: false },
  { type: "Large White Pig", emoji: "🐷", unit: "per head", avg: 1200, change: -1.2, hot: false },
  { type: "Broiler Chicken", emoji: "🐔", unit: "per bird", avg: 85, change: 6.5, hot: true },
  { type: "Layer Hen", emoji: "🐓", unit: "per bird", avg: 95, change: 2.0, hot: false },
]

const SAMPLE_LISTINGS = [
  {
    id: 101, type: "Brahman Bull", category: "cattle", emoji: "🐂",
    age: "3 years", weight: "450kg", breed: "Brahman Cross",
    price: 9500, unit: "per head", qty: 2,
    location: "Mkushi, Central Province", verified: true, vaccinated: true,
    farmerName: "Mr. Chisulo Farm", rating: 4.9, reviews: 12, hot: true,
    image: "/livestock-cow.png",
    desc: "Well-fed Brahman cross bull, excellent conformation, suitable for breeding or beef.",
  },
  {
    id: 102, type: "Boer Goats", category: "goats", emoji: "🐐",
    age: "18 months", weight: "35kg avg", breed: "Boer",
    price: 850, unit: "per head", qty: 15,
    location: "Choma, Southern Province", verified: true, vaccinated: true,
    farmerName: "Tembo Livestock", rating: 4.8, reviews: 24, hot: true,
    image: "/livestock-goats.png",
    desc: "Pure Boer goats, fully vaccinated, dewormed and ready for collection.",
  },
  {
    id: 103, type: "Broiler Chickens", category: "poultry", emoji: "🐔",
    age: "6 weeks", weight: "2.2kg avg", breed: "Ross 308",
    price: 88, unit: "per bird", qty: 500,
    location: "Lusaka, Lusaka Province", verified: true, vaccinated: true,
    farmerName: "Sunrise Poultry", rating: 4.7, reviews: 67, hot: true,
    image: "/livestock-poultry.png",
    desc: "Market-ready Ross 308 broilers, vaccinated, well-fed on quality feed.",
  },
  {
    id: 104, type: "Heifer Cattle", category: "cattle", emoji: "🐄",
    age: "2 years", weight: "320kg avg", breed: "Angus Cross",
    price: 5400, unit: "per head", qty: 6,
    location: "Livingstone, Southern Province", verified: false, vaccinated: true,
    farmerName: "Mwanza Ranch", rating: 4.5, reviews: 8, hot: false,
    image: "/livestock-hero.png",
    desc: "Good quality Angus cross heifers, ready for breeding or feedlot.",
  },
  {
    id: 105, type: "Dairy Cows", category: "cattle", emoji: "🐄",
    age: "4 years", weight: "420kg avg", breed: "Friesian",
    price: 8200, unit: "per head", qty: 3,
    location: "Kabwe, Central Province", verified: true, vaccinated: true,
    farmerName: "Green Valley Dairy", rating: 4.9, reviews: 19, hot: false,
    image: "/livestock-cow.png",
    desc: "High-yielding Friesian dairy cows producing 20+ litres/day. All in calf.",
  },
  {
    id: 106, type: "Local Pigs", category: "pigs", emoji: "🐷",
    age: "5 months", weight: "65kg avg", breed: "Large White Cross",
    price: 1100, unit: "per head", qty: 10,
    location: "Chipata, Eastern Province", verified: true, vaccinated: false,
    farmerName: "Banda Piggery", rating: 4.3, reviews: 5, hot: false,
    image: null,
    desc: "Ready-to-slaughter pigs at good market weight.",
  },
]

export default function LivestockPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")
  const { user } = useAuth()

  const filtered = SAMPLE_LISTINGS.filter((l) => {
    const matchCat = selectedCategory === "all" || l.category === selectedCategory
    const matchSearch = !search || l.type.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) || l.breed.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          poster="/livestock-hero.png"
        >
          <source src="/cattle-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4 text-sm px-4 py-1.5">
              🐄 Zambia's #1 Livestock Exchange
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Buy & Sell{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                Livestock
              </span>{" "}
              Direct
            </h1>
            <p className="text-white/75 text-lg mb-8 leading-relaxed">
              Cattle, goats, pigs, poultry and more — connect with verified farmers across
              all 10 provinces. Health certificates, vaccination records, and fair prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/new-listing">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 h-auto rounded-xl gap-2 shadow-lg">
                  <Beef className="w-4 h-4" /> List Your Animals
                </Button>
              </Link>
              <a href="#listings">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 h-auto rounded-xl gap-2">
                  <Search className="w-4 h-4" /> Browse Livestock
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Verified Sellers</span>
              <span className="flex items-center gap-1.5"><Syringe className="w-4 h-4 text-blue-400" /> Vaccination Records</span>
              <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-amber-400" /> Fair Market Prices</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Price Index */}
      <section className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-3 py-1">
              📈 Live Livestock Prices — Zambia
            </Badge>
          </div>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
            {LIVESTOCK_PRICES.map((p) => (
              <div key={p.type} className="shrink-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[160px]">
                <div className="text-2xl mb-1">{p.emoji}</div>
                <div className="text-xs text-white/60 mb-0.5">{p.type}</div>
                <div className="font-bold text-white">K{p.avg.toLocaleString()}</div>
                <div className="text-xs">{p.unit}</div>
                <div className={`flex items-center gap-1 text-xs mt-1 ${p.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  <TrendingUp className="w-3 h-3" />
                  {p.change > 0 ? "+" : ""}{p.change}%
                </div>
                {p.hot && <Badge className="bg-orange-500/80 text-white border-0 text-[9px] mt-1 px-1.5 py-0">HOT</Badge>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="listings">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all text-sm ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              🐾 All Animals
            </button>
            {LIVESTOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all text-sm ${
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Results */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type, breed, location..."
              className="pl-9 bg-card"
            />
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {filtered.length} listings
          </Badge>
        </div>

        {/* Listing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((listing) => (
            <Card key={listing.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {listing.image ? (
                  <img src={listing.image} alt={listing.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center">
                    <span className="text-7xl">{listing.emoji}</span>
                  </div>
                )}
                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {listing.hot && (
                    <Badge className="bg-orange-500 text-white border-0 text-xs gap-1">
                      <Flame className="w-3 h-3" /> Hot
                    </Badge>
                  )}
                  {listing.vaccinated && (
                    <Badge className="bg-blue-600 text-white border-0 text-xs gap-1">
                      <Syringe className="w-3 h-3" /> Vaccinated
                    </Badge>
                  )}
                </div>
                {listing.verified && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-white border-0 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{listing.type}</h3>
                    <p className="text-sm text-muted-foreground">{listing.breed} · {listing.age} · {listing.weight}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-primary">K{listing.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{listing.unit}</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.desc}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {listing.location}
                  </span>
                  <span className="text-muted-foreground">Qty: {listing.qty}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                    <span className="text-xs text-muted-foreground">({listing.reviews})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{listing.farmerName}</span>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90" size="sm">
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Shield, title: "Verified Sellers", color: "text-emerald-600", bg: "bg-emerald-50",
              desc: "All livestock sellers go through ID verification and farm inspection before listing.",
            },
            {
              icon: Syringe, title: "Health Certificates", color: "text-blue-600", bg: "bg-blue-50",
              desc: "Download vaccination records, vet inspection certificates, and disease-free documentation.",
            },
            {
              icon: Scale, title: "Fair Pricing", color: "text-amber-600", bg: "bg-amber-50",
              desc: "Our live price index shows current market rates so you always know the right price.",
            },
          ].map((card) => (
            <Card key={card.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex gap-4">
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* CTA Banner */}
        {user?.userType === "farmer" && (
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-orange-500 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Have animals to sell?</h3>
              <p className="text-white/80">List your cattle, goats, pigs or poultry and reach buyers across Zambia.</p>
            </div>
            <Link href="/new-listing">
              <Button className="bg-white text-amber-700 hover:bg-white/90 font-bold px-8 py-3 h-auto rounded-xl gap-2 shadow-lg shrink-0">
                <Beef className="w-4 h-4" /> List Animals Now <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
