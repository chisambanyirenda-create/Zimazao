import { Navbar } from "@/components/navbar";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { FeaturedCrops } from "@/components/featured-crops";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { TrustSection } from "@/components/trust-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { WeatherWidget } from "@/components/weather-widget";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Beef, ArrowRight, Shield, Syringe, Scale } from "lucide-react";
import { Link } from "wouter";

const quickPrices = [
  { name: "White Maize", emoji: "🌽", price: 450, change: 3.1 },
  { name: "Groundnuts", emoji: "🥜", price: 380, change: 2.0 },
  { name: "Soybeans", emoji: "🫘", price: 520, change: -0.9 },
  { name: "Sunflower", emoji: "🌻", price: 280, change: 4.1 },
  { name: "Cassava", emoji: "🥔", price: 150, change: 0.0 },
];

function QuickPriceBar() {
  return (
    <div className="bg-primary/95 text-primary-foreground py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <Badge className="bg-white/20 text-white border-0 shrink-0 text-xs">
            📊 Live Prices
          </Badge>
          {quickPrices.map((p) => (
            <Link key={p.name} href="/prices" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
              <span>{p.emoji}</span>
              <span className="font-medium text-sm">{p.name}</span>
              <span className="font-bold text-sm">K{p.price}</span>
              <span className={`flex items-center text-xs ${p.change > 0 ? "text-green-300" : p.change < 0 ? "text-red-300" : "text-white/60"}`}>
                {p.change > 0 ? <TrendingUp className="w-3 h-3" /> : p.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {p.change > 0 ? "+" : ""}{p.change}%
              </span>
            </Link>
          ))}
          <Badge className="bg-white/15 text-white/70 border-0 shrink-0 text-xs">
            Updated: Today 10:30 AM
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <QuickPriceBar />
      <main>
        <HeroSlideshow />
        <StatsSection />
        <FeaturesSection />

        {/* Weather + Promo Banner */}
        <section className="py-10 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6">
              <WeatherWidget />
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary to-emerald-700">
                <CardContent className="p-6 text-white h-full flex flex-col justify-between">
                  <div>
                    <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">🤖 AI Feature</Badge>
                    <h3 className="text-xl font-bold mb-2">Detect Crop Diseases Instantly</h3>
                    <p className="text-white/80 text-sm mb-4 leading-relaxed">
                      Simply take a photo of your sick crop. Our AI powered by Google Gemini gives you diagnosis, symptoms and treatment in seconds.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-3xl">🌽 🫘 🌻 🥬</div>
                    <Link href="/disease-detector">
                      <button className="bg-white text-primary font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
                        Try Free Now →
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Livestock Promo Section */}
        <section className="py-0 overflow-hidden">
          <div className="relative bg-gradient-to-br from-slate-950 via-emerald-950 to-amber-950 text-white">
            {/* Background video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              poster="/livestock-hero.png"
            >
              <source src="/cattle-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/80 to-slate-900/40" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-5 text-sm px-4 py-1.5">
                    🐄 NEW — Livestock Exchange
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    Zambia's First{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                      Livestock
                    </span>{" "}
                    Marketplace
                  </h2>
                  <p className="text-white/70 text-lg mb-6 leading-relaxed">
                    Cattle, goats, pigs, and poultry — buy and sell with verified farmers.
                    Live price index, vaccination certificates, and secure transactions.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    {[
                      { emoji: "🐄", label: "Cattle" },
                      { emoji: "🐐", label: "Goats" },
                      { emoji: "🐷", label: "Pigs" },
                      { emoji: "🐔", label: "Poultry" },
                      { emoji: "🐑", label: "Sheep" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Link href="/livestock">
                      <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl gap-2 flex items-center shadow-lg transition-all">
                        <Beef className="w-4 h-4" /> Browse Livestock <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  {[
                    { image: "/livestock-cow.png", label: "Brahman Bull", price: "K9,500", tag: "per head" },
                    { image: "/livestock-goats.png", label: "Boer Goats", price: "K850", tag: "per head" },
                    { image: "/livestock-poultry.png", label: "Broilers", price: "K88", tag: "per bird" },
                    { image: "/livestock-hero.png", label: "Heifer Cattle", price: "K5,400", tag: "per head" },
                  ].map((item) => (
                    <div key={item.label} className="relative rounded-xl overflow-hidden group cursor-pointer">
                      <img src={item.image} alt={item.label} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium">{item.label}</p>
                        <p className="text-amber-400 text-sm font-bold">{item.price} <span className="text-white/60 text-xs font-normal">{item.tag}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <FeaturedCrops />
        <TestimonialsSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
