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
  Beef, ShoppingBag, TrendingUp, Shield, Syringe, Scale,
  ChevronRight, Flame,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const LIVESTOCK_CATEGORIES = [
  {
    value: "cattle", label: "Cattle", emoji: "🐄",
    desc: "Beef bulls, dairy cows, and heifers from verified ranches across Zambia.",
    tagline: "Premium Beef & Dairy",
    video: "/cattle-video.mp4",
    poster: "/livestock-cow.png",
    gradient: "from-amber-950/80 via-amber-900/60 to-transparent",
    accent: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    value: "goats", label: "Goats", emoji: "🐐",
    desc: "Boer goats, local breeds and mixed herds — fully vaccinated and dewormed.",
    tagline: "Boer & Local Breeds",
    video: "/goats-video.mp4",
    poster: "/livestock-goats.png",
    gradient: "from-green-950/80 via-green-900/60 to-transparent",
    accent: "text-green-300", badge: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  {
    value: "sheep", label: "Sheep", emoji: "🐑",
    desc: "Mutton sheep and wool breeds for slaughter, breeding, and fibre production.",
    tagline: "Mutton & Wool",
    video: "/sheep-video.mp4",
    poster: "/livestock-hero.png",
    gradient: "from-blue-950/80 via-blue-900/60 to-transparent",
    accent: "text-blue-300", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    value: "pigs", label: "Pigs", emoji: "🐷",
    desc: "Large White, Landrace and crossbred pigs at market weight from established piggeries.",
    tagline: "Large White & Landrace",
    video: "/pigs-video.mp4",
    poster: "/livestock-hero.png",
    gradient: "from-pink-950/80 via-pink-900/60 to-transparent",
    accent: "text-pink-300", badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    value: "poultry", label: "Poultry", emoji: "🐔",
    desc: "Day-old chicks, market-ready broilers, and productive laying hens.",
    tagline: "Broilers & Layers",
    video: "/poultry-video.mp4",
    poster: "/livestock-poultry.png",
    gradient: "from-yellow-950/80 via-yellow-900/60 to-transparent",
    accent: "text-yellow-300", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  {
    value: "rabbits", label: "Rabbits", emoji: "🐇",
    desc: "Meat rabbits — New Zealand White, Californian, and local breeds.",
    tagline: "Meat Rabbits",
    video: "/rabbits-video.mp4",
    poster: "/livestock-hero.png",
    gradient: "from-purple-950/80 via-purple-900/60 to-transparent",
    accent: "text-purple-300", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
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
    location: "Mkushi, Central", verified: true, vaccinated: true,
    farmerName: "Chisulo Farm", rating: 4.9, reviews: 12, hot: true,
    image: "/livestock-cow.png",
    desc: "Well-fed Brahman cross bull, excellent conformation, suitable for breeding or beef.",
  },
  {
    id: 104, type: "Heifer Cattle", category: "cattle", emoji: "🐄",
    age: "2 years", weight: "320kg avg", breed: "Angus Cross",
    price: 5400, unit: "per head", qty: 6,
    location: "Livingstone, Southern", verified: false, vaccinated: true,
    farmerName: "Mwanza Ranch", rating: 4.5, reviews: 8, hot: false,
    image: "/livestock-hero.png",
    desc: "Good quality Angus cross heifers, ready for breeding or feedlot.",
  },
  {
    id: 105, type: "Friesian Dairy Cows", category: "cattle", emoji: "🐄",
    age: "4 years", weight: "420kg avg", breed: "Friesian",
    price: 8200, unit: "per head", qty: 3,
    location: "Kabwe, Central", verified: true, vaccinated: true,
    farmerName: "Green Valley Dairy", rating: 4.9, reviews: 19, hot: false,
    image: "/livestock-cow.png",
    desc: "High-yielding Friesian dairy cows producing 20+ litres/day. All in calf.",
  },
  {
    id: 102, type: "Boer Goats", category: "goats", emoji: "🐐",
    age: "18 months", weight: "35kg avg", breed: "Boer",
    price: 850, unit: "per head", qty: 15,
    location: "Choma, Southern", verified: true, vaccinated: true,
    farmerName: "Tembo Livestock", rating: 4.8, reviews: 24, hot: true,
    image: "/livestock-goats.png",
    desc: "Pure Boer goats, fully vaccinated, dewormed and ready for collection.",
  },
  {
    id: 107, type: "Local Goats", category: "goats", emoji: "🐐",
    age: "12 months", weight: "22kg avg", breed: "Local Breed",
    price: 450, unit: "per head", qty: 30,
    location: "Chipata, Eastern", verified: true, vaccinated: false,
    farmerName: "Banda Goat Farm", rating: 4.4, reviews: 7, hot: false,
    image: "/livestock-goats.png",
    desc: "Hardy local breed goats, excellent for meat production in any climate.",
  },
  {
    id: 108, type: "Mutton Sheep", category: "sheep", emoji: "🐑",
    age: "18 months", weight: "40kg avg", breed: "Dorper Cross",
    price: 950, unit: "per head", qty: 20,
    location: "Mazabuka, Southern", verified: true, vaccinated: true,
    farmerName: "Kaunda Sheep Farm", rating: 4.6, reviews: 10, hot: false,
    image: null,
    desc: "Plump Dorper cross sheep ready for slaughter or breeding.",
  },
  {
    id: 109, type: "Wool Sheep", category: "sheep", emoji: "🐑",
    age: "2 years", weight: "50kg avg", breed: "Merino",
    price: 1200, unit: "per head", qty: 8,
    location: "Mongu, Western", verified: false, vaccinated: true,
    farmerName: "Western Wool Farm", rating: 4.3, reviews: 4, hot: false,
    image: null,
    desc: "Merino wool sheep producing fine fibre, dual-purpose for wool and meat.",
  },
  {
    id: 106, type: "Market Pigs", category: "pigs", emoji: "🐷",
    age: "5 months", weight: "65kg avg", breed: "Large White Cross",
    price: 1100, unit: "per head", qty: 10,
    location: "Chipata, Eastern", verified: true, vaccinated: false,
    farmerName: "Banda Piggery", rating: 4.3, reviews: 5, hot: false,
    image: null,
    desc: "Ready-to-slaughter pigs at good market weight.",
  },
  {
    id: 110, type: "Breeding Sows", category: "pigs", emoji: "🐷",
    age: "1 year", weight: "90kg avg", breed: "Landrace",
    price: 2200, unit: "per head", qty: 4,
    location: "Lusaka, Lusaka", verified: true, vaccinated: true,
    farmerName: "Capitol Piggery", rating: 4.7, reviews: 14, hot: true,
    image: null,
    desc: "Productive Landrace sows, already farrowed once, proven breeders.",
  },
  {
    id: 103, type: "Broiler Chickens", category: "poultry", emoji: "🐔",
    age: "6 weeks", weight: "2.2kg avg", breed: "Ross 308",
    price: 88, unit: "per bird", qty: 500,
    location: "Lusaka, Lusaka", verified: true, vaccinated: true,
    farmerName: "Sunrise Poultry", rating: 4.7, reviews: 67, hot: true,
    image: "/livestock-poultry.png",
    desc: "Market-ready Ross 308 broilers, vaccinated, well-fed on quality feed.",
  },
  {
    id: 111, type: "Layer Hens", category: "poultry", emoji: "🐓",
    age: "20 weeks", weight: "1.8kg avg", breed: "Lohmann Brown",
    price: 95, unit: "per bird", qty: 300,
    location: "Ndola, Copperbelt", verified: true, vaccinated: true,
    farmerName: "Copperbelt Layers", rating: 4.8, reviews: 41, hot: false,
    image: "/livestock-poultry.png",
    desc: "Peak production Lohmann Brown hens laying 300+ eggs per year.",
  },
  {
    id: 112, type: "Meat Rabbits", category: "rabbits", emoji: "🐇",
    age: "3 months", weight: "2.5kg avg", breed: "New Zealand White",
    price: 180, unit: "per rabbit", qty: 50,
    location: "Lusaka, Lusaka", verified: true, vaccinated: false,
    farmerName: "Lusaka Rabbit Farm", rating: 4.5, reviews: 9, hot: false,
    image: null,
    desc: "Fast-growing New Zealand White rabbits, excellent feed conversion ratio.",
  },
  {
    id: 113, type: "Californian Rabbits", category: "rabbits", emoji: "🐇",
    age: "4 months", weight: "3kg avg", breed: "Californian",
    price: 220, unit: "per rabbit", qty: 30,
    location: "Kabwe, Central", verified: false, vaccinated: false,
    farmerName: "Central Rabbit Farm", rating: 4.2, reviews: 3, hot: false,
    image: null,
    desc: "Plump Californian rabbits with excellent meat-to-bone ratio.",
  },
]

function ListingCard({ listing }: { listing: typeof SAMPLE_LISTINGS[0] }) {
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-w-[280px] w-72 shrink-0">
      <div className="relative h-40 overflow-hidden">
        {listing.image ? (
          <img src={listing.image} alt={listing.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center">
            <span className="text-7xl">{listing.emoji}</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {listing.hot && <Badge className="bg-orange-500 text-white border-0 text-xs gap-1"><Flame className="w-3 h-3" />Hot</Badge>}
          {listing.vaccinated && <Badge className="bg-blue-600 text-white border-0 text-xs gap-1"><Syringe className="w-3 h-3" />Vax</Badge>}
        </div>
        {listing.verified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-white border-0 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Verified</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">{listing.type}</h3>
            <p className="text-xs text-muted-foreground">{listing.breed} · {listing.age} · {listing.weight}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">K{listing.price.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{listing.unit}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{listing.desc}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3 shrink-0" />{listing.location} · Qty: {listing.qty}
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{listing.rating}</span>
            <span className="text-[10px] text-muted-foreground">({listing.reviews})</span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{listing.farmerName}</span>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 gap-1 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 h-8 text-xs" size="sm">
            <ShoppingBag className="w-3 h-3" /> Buy Now
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
            <MessageCircle className="w-3 h-3" /> Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CategorySection({
  cat, listings, search,
}: {
  cat: typeof LIVESTOCK_CATEGORIES[0]
  listings: typeof SAMPLE_LISTINGS
  search: string
}) {
  const filtered = listings.filter((l) => {
    const matchSearch = !search ||
      l.type.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.breed.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  if (filtered.length === 0) return null

  return (
    <section className="mb-12">
      {/* Video Banner */}
      <div className="relative h-52 md:h-64 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={cat.poster}
        >
          <source src={cat.video} type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <Badge className={`${cat.badge} border w-fit mb-2 text-xs px-3 py-1`}>
            {cat.emoji} {cat.tagline}
          </Badge>
          <h2 className={`text-3xl md:text-4xl font-bold text-white mb-1`}>
            {cat.label}
          </h2>
          <p className="text-white/75 text-sm max-w-lg">{cat.desc}</p>
        </div>

        {/* Listing count badge top-right */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Horizontal scroll listings */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {/* View all card */}
        <div className="shrink-0 w-44 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
          <span className="text-4xl">{cat.emoji}</span>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Post a {cat.label.slice(0, -1) || cat.label} listing
          </p>
          <Link href="/new-listing">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <ChevronRight className="w-3 h-3" /> List Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LivestockPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")
  const { user } = useAuth()

  const visibleCategories = selectedCategory === "all"
    ? LIVESTOCK_CATEGORIES
    : LIVESTOCK_CATEGORIES.filter((c) => c.value === selectedCategory)

  const listingsForCategory = (catValue: string) =>
    SAMPLE_LISTINGS.filter((l) => l.category === catValue)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        <video
          autoPlay muted loop playsInline
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
        {/* Category Filter Tabs */}
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
                <span>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type, breed, location..."
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {/* Category Sections — each with its own video banner */}
        {visibleCategories.map((cat) => (
          <CategorySection
            key={cat.value}
            cat={cat}
            listings={listingsForCategory(cat.value)}
            search={search}
          />
        ))}

        {/* Trust Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-12 mt-4">
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

        {/* Farmer CTA */}
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
