"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { HeroSlideshow } from "@/components/hero-slideshow"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { FeaturedCrops } from "@/components/featured-crops"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSlideshow />
          <StatsSection />
          <FeaturesSection />
          <FeaturedCrops />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
