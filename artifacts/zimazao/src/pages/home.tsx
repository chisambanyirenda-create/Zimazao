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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
