import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"

const slides = [
  {
    id: 1,
    badge: "🌽 #1 Farm Marketplace in Zambia",
    title: "Sell Your Harvest",
    titleHighlight: "Direct to Buyers",
    description: "Skip the middlemen. Connect directly with verified buyers across all 10 provinces of Zambia and earn up to 40% more from your crops.",
    cta: "Start Selling Free",
    ctaLink: "/register",
    secondaryCta: "Browse Crops",
    secondaryCtaLink: "/marketplace",
    bg: "from-emerald-950 via-green-900 to-emerald-800",
    image: "🌽",
    stat: { value: "K5M+", label: "sold this season" },
  },
  {
    id: 2,
    badge: "🤖 AI-Powered Technology",
    title: "Detect Crop Diseases",
    titleHighlight: "Before They Spread",
    description: "Snap a photo and get instant AI diagnosis with treatment plans in seconds. Protect your harvest before it's too late.",
    cta: "Try Disease Detector",
    ctaLink: "/disease-detector",
    secondaryCta: "See How It Works",
    secondaryCtaLink: "/",
    bg: "from-blue-950 via-blue-900 to-indigo-800",
    image: "🔬",
    stat: { value: "95%", label: "detection accuracy" },
  },
  {
    id: 3,
    badge: "📊 Live Market Data",
    title: "Know the Best Price",
    titleHighlight: "Before You Sell",
    description: "Real-time commodity prices from Lusaka, Ndola, Kitwe, Livingstone and Chipata. Never undersell your crops again.",
    cta: "View Live Prices",
    ctaLink: "/prices",
    secondaryCta: "Set Price Alert",
    secondaryCtaLink: "/prices",
    bg: "from-amber-950 via-orange-900 to-yellow-800",
    image: "📈",
    stat: { value: "12", label: "crops tracked daily" },
  },
  {
    id: 4,
    badge: "👨‍🌾 10,000+ Farmers Trust Us",
    title: "Join Zambia's",
    titleHighlight: "Farming Revolution",
    description: "From Luapula to Southern Province, farmers are transforming their businesses with Zimazao. Your turn starts today.",
    cta: "Join for Free",
    ctaLink: "/register",
    secondaryCta: "Read Stories",
    secondaryCtaLink: "/",
    bg: "from-purple-950 via-violet-900 to-purple-800",
    image: "🚜",
    stat: { value: "10K+", label: "active farmers" },
  },
]

export function HeroSlideshow() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

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
              <div className={`bg-gradient-to-br ${slide.bg} min-h-[580px] md:min-h-[680px] flex items-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.03] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full relative z-10">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge className="mb-5 bg-white/15 text-white border-white/20 text-sm px-4 py-1.5 backdrop-blur-sm">
                        {slide.badge}
                      </Badge>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
                        {slide.title}
                      </h1>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                        {slide.titleHighlight}
                      </h1>
                      <p className="text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={slide.ctaLink}>
                          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-8 font-semibold gap-2 shadow-xl h-12">
                            {slide.cta} <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={slide.secondaryCtaLink}>
                          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 gap-2 h-12">
                            <Play className="w-4 h-4" /> {slide.secondaryCta}
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/15">
                        <span className="text-2xl font-bold text-white">{slide.stat.value}</span>
                        <span className="text-white/70 text-sm">{slide.stat.label}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <div className="relative">
                        <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
                          <span className="text-[140px]">{slide.image}</span>
                        </div>
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                          <span className="text-4xl">✨</span>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                          <span className="text-3xl">🇿🇲</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg border border-white/10 text-white" aria-label="Previous slide">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg border border-white/10 text-white" aria-label="Next slide">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === selectedIndex ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/60"}`} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}
