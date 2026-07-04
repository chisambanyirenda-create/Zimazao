import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ArrowRight, ShoppingCart, CheckCircle2, TrendingUp } from "lucide-react"
import { Link } from "wouter"

const featuredCrops = [
  { id: 1, name: "White Maize", farmer: "John Mwansa", location: "Choma, Southern", price: 450, prevPrice: 420, unit: "50kg bag", rating: 4.8, reviews: 23, quantity: "500 bags", img: "/crops/maize.jpg", verified: true, category: "Cereals" },
  { id: 2, name: "Groundnuts (Shelled)", farmer: "Mary Banda", location: "Chipata, Eastern", price: 380, prevPrice: 370, unit: "25kg bag", rating: 4.9, reviews: 45, quantity: "200 bags", img: "/crops/groundnuts.jpg", verified: true, category: "Legumes" },
  { id: 3, name: "Soybeans", farmer: "Peter Phiri", location: "Mkushi, Central", price: 520, prevPrice: 540, unit: "50kg bag", rating: 4.7, reviews: 18, quantity: "300 bags", img: "/crops/soybeans.jpg", verified: true, category: "Legumes" },
  { id: 4, name: "Sunflower Seeds", farmer: "Grace Tembo", location: "Mazabuka, Southern", price: 280, prevPrice: 260, unit: "25kg bag", rating: 4.6, reviews: 12, quantity: "150 bags", img: "/crops/sunflower.jpg", verified: false, category: "Oilseeds" },
  { id: 5, name: "Sweet Potatoes", farmer: "Ruth Chanda", location: "Kasama, Northern", price: 120, prevPrice: 115, unit: "25kg bag", rating: 4.5, reviews: 8, quantity: "250 bags", img: "/crops/cassava.jpg", verified: true, category: "Tubers" },
  { id: 6, name: "Sorghum", farmer: "James Mumba", location: "Mansa, Luapula", price: 315, prevPrice: 310, unit: "50kg bag", rating: 4.4, reviews: 9, quantity: "400 bags", img: "/crops/maize.jpg", verified: true, category: "Cereals" },
  { id: 7, name: "Cassava (Dried)", farmer: "David Nkonde", location: "Samfya, Luapula", price: 200, prevPrice: 195, unit: "50kg bag", rating: 4.6, reviews: 14, quantity: "600 bags", img: "/crops/cassava.jpg", verified: true, category: "Tubers" },
  { id: 8, name: "Mixed Tomatoes", farmer: "Agnes Phiri", location: "Chongwe, Lusaka", price: 80, prevPrice: 90, unit: "20kg crate", rating: 4.7, reviews: 31, quantity: "100 crates", img: "/crops/tomato.jpg", verified: true, category: "Vegetables" },
]

export function FeaturedCrops() {
  return (
    <section className="relative overflow-hidden bg-[#020c07] py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-medium text-emerald-300">Live Listings</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Featured crops</h2>
            <p className="mt-1 text-white/60">Fresh produce from verified farmers across all 10 provinces</p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              View All Crops <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCrops.map((crop, i) => {
            const priceUp = crop.price > crop.prevPrice
            const priceDown = crop.price < crop.prevPrice
            return (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/30 hover:shadow-[0_0_44px_-12px_rgba(52,211,153,0.4)]"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={crop.img} alt={crop.name} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/25" />
                  <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                    <Badge className="border-white/10 bg-black/40 text-xs text-white/80 backdrop-blur-md">{crop.category}</Badge>
                    {crop.verified && (
                      <Badge className="gap-1 border-emerald-400/30 bg-emerald-400/15 text-xs text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  {(priceUp || priceDown) && (
                    <div className={`absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${priceUp ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"}`}>
                      <TrendingUp className={`h-3 w-3 ${priceDown ? "rotate-180" : ""}`} />
                      {priceUp ? "+" : "-"}{Math.abs(Math.round(((crop.price - crop.prevPrice) / crop.prevPrice) * 100))}%
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <h3 className="mb-1 font-display text-lg font-bold text-white">{crop.name}</h3>
                  <p className="mb-2 text-sm text-white/55">by {crop.farmer}</p>
                  <div className="mb-3 flex items-center gap-1 text-sm text-white/55">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{crop.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <p className="font-display text-2xl font-bold text-amber-300 tabular-nums">ZMW {crop.price}</p>
                        <p className="text-xs text-white/40 line-through">ZMW {crop.prevPrice}</p>
                      </div>
                      <p className="text-xs text-white/50">per {crop.unit}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      <span className="text-sm font-bold text-white">{crop.rating}</span>
                      <span className="text-xs text-white/50">({crop.reviews})</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/50">{crop.quantity} available</p>
                </div>
                <div className="p-4 pt-0">
                  <Link href={`/listing/${crop.id}`} className="block w-full">
                    <Button className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500">
                      <ShoppingCart className="h-4 w-4" /> View &amp; Order
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-white/50">Showing 8 of 200+ fresh listings updated daily</p>
          <Link href="/marketplace">
            <Button size="lg" variant="outline" className="gap-2 border-white/20 bg-white/5 px-10 text-white hover:bg-white/15 hover:text-white">
              Browse All 200+ Crops <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
