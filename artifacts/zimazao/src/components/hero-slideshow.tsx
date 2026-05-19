

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

const slides = [
  {
    id: 1,
    title: "Sell Your Harvest",
    subtitle: "Connect directly with buyers across Zambia",
    description: "Get the best prices for your maize, groundnuts, soybeans, and more. No middlemen, just fair trade.",
    cta: "Start Selling",
    ctaLink: "/register",
    bgColor: "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
    image: "🌽",
  },
  {
    id: 2,
    title: "Detect Crop Diseases",
    subtitle: "AI-powered plant health analysis",
    description: "Simply snap a photo of your crops and get instant diagnosis with treatment recommendations.",
    cta: "Try Disease Detector",
    ctaLink: "/disease-detector",
    bgColor: "bg-gradient-to-br from-accent/20 via-accent/10 to-background",
    image: "🔬",
  },
  {
    id: 3,
    title: "Real-Time Prices",
    subtitle: "Stay informed on market trends",
    description: "Access live commodity prices from markets across Zambia to make informed selling decisions.",
    cta: "View Prices",
    ctaLink: "/prices",
    bgColor: "bg-gradient-to-br from-secondary/30 via-secondary/10 to-background",
    image: "📈",
  },
  {
    id: 4,
    title: "Trusted by 10,000+ Farmers",
    subtitle: "Join the Zimazao community",
    description: "Farmers across all provinces are growing their income with Zimazao. Join them today.",
    cta: "Join Now",
    ctaLink: "/register",
    bgColor: "bg-gradient-to-br from-chart-1/20 via-chart-1/5 to-background",
    image: "👨‍🌾",
  },
]

export function HeroSlideshow() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="relative overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <div className={`${slide.bgColor} min-h-[500px] md:min-h-[600px] flex items-center`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="animate-slide-up">
                      <p className="text-primary font-medium mb-2">{slide.subtitle}</p>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                        {slide.description}
                      </p>
                      <Link href={slide.ctaLink}>
                        <Button size="lg" className="text-lg px-8 py-6">
                          {slide.cta}
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <span className="text-[180px] animate-fade-in">{slide.image}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-card transition-colors shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-card transition-colors shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
