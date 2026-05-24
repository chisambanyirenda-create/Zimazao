import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import { ArrowRight, CheckCircle, Star, Users, TrendingUp } from "lucide-react"

const benefits = [
  "Free to list your crops — forever",
  "Direct connection with verified buyers",
  "Secure MTN & Airtel mobile money payments",
  "AI-powered disease detection for any crop",
  "Live market prices from 5 major Zambian markets",
  "Crop calendar with planting & harvest schedules",
]

const miniStats = [
  { icon: Users, value: "10,000+", label: "Farmers" },
  { icon: TrendingUp, value: "ZMW5M+", label: "Sales" },
  { icon: Star, value: "4.9★", label: "Rating" },
]

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-800" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-5 bg-white/15 text-white border-white/25 text-sm px-4 py-1.5">
              🇿🇲 Proudly Zambian
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to Grow Your Farm Business?
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Join thousands of Zambian farmers already using Zimazao to sell crops, protect harvests, and increase income. It's 100% free to start.
            </p>
            <ul className="space-y-2.5 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-300 shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 text-base px-8 font-semibold shadow-xl h-12">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
            <div className="flex gap-6">
              {miniStats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-white/10 rounded-full" />
              <div className="absolute inset-6 bg-white/10 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[130px]">🌱</span>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-muted-foreground">Today's Top Sale</p>
                <p className="font-bold text-primary text-sm">🌽 ZMW 450/bag</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-muted-foreground">New Farmer Today</p>
                <p className="font-bold text-foreground text-sm">👨‍🌾 +12 joined</p>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-muted-foreground">Disease Scans</p>
                <p className="font-bold text-blue-600 text-sm">🔬 847 today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
