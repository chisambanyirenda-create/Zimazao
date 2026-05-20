import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ArrowRight, ShoppingCart, CheckCircle2, TrendingUp } from "lucide-react"
import { Link } from "wouter"

const featuredCrops = [
  {
    id: 1,
    name: "White Maize",
    farmer: "John Mwansa",
    location: "Choma, Southern",
    price: 450,
    prevPrice: 420,
    unit: "50kg bag",
    rating: 4.8,
    reviews: 23,
    quantity: "500 bags",
    image: "🌽",
    verified: true,
    category: "Cereals",
    gradient: "from-yellow-100 to-amber-50",
  },
  {
    id: 2,
    name: "Groundnuts (Shelled)",
    farmer: "Mary Banda",
    location: "Chipata, Eastern",
    price: 380,
    prevPrice: 370,
    unit: "25kg bag",
    rating: 4.9,
    reviews: 45,
    quantity: "200 bags",
    image: "🥜",
    verified: true,
    category: "Legumes",
    gradient: "from-orange-100 to-amber-50",
  },
  {
    id: 3,
    name: "Soybeans",
    farmer: "Peter Phiri",
    location: "Mkushi, Central",
    price: 520,
    prevPrice: 540,
    unit: "50kg bag",
    rating: 4.7,
    reviews: 18,
    quantity: "300 bags",
    image: "🫘",
    verified: true,
    category: "Legumes",
    gradient: "from-green-100 to-emerald-50",
  },
  {
    id: 4,
    name: "Sunflower Seeds",
    farmer: "Grace Tembo",
    location: "Mazabuka, Southern",
    price: 280,
    prevPrice: 260,
    unit: "25kg bag",
    rating: 4.6,
    reviews: 12,
    quantity: "150 bags",
    image: "🌻",
    verified: false,
    category: "Oilseeds",
    gradient: "from-yellow-100 to-orange-50",
  },
  {
    id: 5,
    name: "Sweet Potatoes",
    farmer: "Ruth Chanda",
    location: "Kasama, Northern",
    price: 120,
    prevPrice: 115,
    unit: "25kg bag",
    rating: 4.5,
    reviews: 8,
    quantity: "250 bags",
    image: "🍠",
    verified: true,
    category: "Tubers",
    gradient: "from-purple-100 to-pink-50",
  },
  {
    id: 6,
    name: "Sorghum",
    farmer: "James Mumba",
    location: "Mansa, Luapula",
    price: 315,
    prevPrice: 310,
    unit: "50kg bag",
    rating: 4.4,
    reviews: 9,
    quantity: "400 bags",
    image: "🌾",
    verified: true,
    category: "Cereals",
    gradient: "from-amber-100 to-yellow-50",
  },
  {
    id: 7,
    name: "Cassava (Dried)",
    farmer: "David Nkonde",
    location: "Samfya, Luapula",
    price: 200,
    prevPrice: 195,
    unit: "50kg bag",
    rating: 4.6,
    reviews: 14,
    quantity: "600 bags",
    image: "🥔",
    verified: true,
    category: "Tubers",
    gradient: "from-stone-100 to-gray-50",
  },
  {
    id: 8,
    name: "Mixed Tomatoes",
    farmer: "Agnes Phiri",
    location: "Chongwe, Lusaka",
    price: 80,
    prevPrice: 90,
    unit: "20kg crate",
    rating: 4.7,
    reviews: 31,
    quantity: "100 crates",
    image: "🍅",
    verified: true,
    category: "Vegetables",
    gradient: "from-red-100 to-rose-50",
  },
]

export function FeaturedCrops() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-medium">Live Listings</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Crops
            </h2>
            <p className="text-muted-foreground">
              Fresh produce from verified farmers across all 10 provinces
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5">
              View All Crops <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map((crop) => {
            const priceUp = crop.price > crop.prevPrice
            const priceDown = crop.price < crop.prevPrice
            return (
              <Card key={crop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border-0 shadow-md">
                <div className={`bg-gradient-to-br ${crop.gradient} h-44 flex items-center justify-center relative`}>
                  <span className="text-8xl">{crop.image}</span>
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <Badge className="bg-white/90 text-foreground text-xs border-0 shadow-sm">
                      {crop.category}
                    </Badge>
                    {crop.verified && (
                      <Badge className="bg-primary text-primary-foreground text-xs border-0 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  {(priceUp || priceDown) && (
                    <div className={`absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${priceUp ? "bg-primary/90 text-white" : "bg-destructive/90 text-white"}`}>
                      <TrendingUp className={`w-3 h-3 ${priceDown ? "rotate-180" : ""}`} />
                      {priceUp ? "+" : "-"}{Math.abs(Math.round(((crop.price - crop.prevPrice) / crop.prevPrice) * 100))}%
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">{crop.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {crop.farmer}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{crop.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl font-bold text-primary">K{crop.price}</p>
                        <p className="text-xs text-muted-foreground line-through">K{crop.prevPrice}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm text-foreground">{crop.rating}</span>
                      <span className="text-muted-foreground text-xs">({crop.reviews})</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{crop.quantity} available</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/listing/${crop.id}`} className="w-full">
                    <Button className="w-full gap-2 group">
                      <ShoppingCart className="w-4 h-4" /> View & Order
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-muted-foreground text-sm mb-4">Showing 8 of 200+ fresh listings updated daily</p>
          <Link href="/marketplace">
            <Button size="lg" variant="outline" className="gap-2 px-10">
              Browse All 200+ Crops <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
