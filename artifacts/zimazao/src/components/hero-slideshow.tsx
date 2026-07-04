import { useCallback, useEffect, useRef, useState } from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"

type Slide = {
  id: number
  badge: string
  title: string
  titleHighlight: string
  description: string
  cta: string
  ctaLink: string
  secondaryCta: string
  secondaryCtaLink: string
  bg: string
  glow1: string
  glow2: string
  image: string
  stat: { value: string; label: string }
}

const slides: Slide[] = [
  {
    id: 1,
    badge: "🌽 #1 Farm Marketplace in Zambia",
    title: "Sell Your Harvest",
    titleHighlight: "Direct to Buyers",
    description:
      "Skip the middlemen. Connect directly with verified buyers across all 10 provinces of Zambia and earn up to 40% more from your crops.",
    cta: "Start Selling Free",
    ctaLink: "/register",
    secondaryCta: "Browse Crops",
    secondaryCtaLink: "/marketplace",
    bg: "from-[#04170f] via-[#06281a] to-[#0a3a24]",
    glow1: "oklch(0.62 0.17 150 / 0.55)",
    glow2: "oklch(0.78 0.17 85 / 0.40)",
    image: "🌽",
    stat: { value: "ZMW 5M+", label: "sold this season" },
  },
  {
    id: 2,
    badge: "🤖 AI-Powered Technology",
    title: "Detect Crop Diseases",
    titleHighlight: "Before They Spread",
    description:
      "Snap a photo and get instant AI diagnosis with treatment plans in seconds. Protect your harvest before it's too late.",
    cta: "Try Disease Detector",
    ctaLink: "/disease-detector",
    secondaryCta: "See How It Works",
    secondaryCtaLink: "/how-it-works",
    bg: "from-[#040f1f] via-[#071d38] to-[#0a2c52]",
    glow1: "oklch(0.65 0.16 235 / 0.55)",
    glow2: "oklch(0.62 0.17 150 / 0.35)",
    image: "🔬",
    stat: { value: "95%", label: "detection accuracy" },
  },
  {
    id: 3,
    badge: "📊 Live Market Data",
    title: "Know the Best Price",
    titleHighlight: "Before You Sell",
    description:
      "Real-time commodity prices from Lusaka, Ndola, Kitwe, Livingstone and Chipata. Never undersell your crops again.",
    cta: "View Live Prices",
    ctaLink: "/prices",
    secondaryCta: "Set Price Alert",
    secondaryCtaLink: "/price-alerts",
    bg: "from-[#1a0f04] via-[#2c1a06] to-[#3a2708]",
    glow1: "oklch(0.78 0.17 85 / 0.55)",
    glow2: "oklch(0.68 0.19 55 / 0.40)",
    image: "📈",
    stat: { value: "12", label: "crops tracked daily" },
  },
  {
    id: 4,
    badge: "👨‍🌾 10,000+ Farmers Trust Us",
    title: "Join Zambia's",
    titleHighlight: "Farming Revolution",
    description:
      "From Luapula to Southern Province, farmers are transforming their businesses with Zimazao. Your turn starts today.",
    cta: "Join for Free",
    ctaLink: "/register",
    secondaryCta: "Read Stories",
    secondaryCtaLink: "/how-it-works",
    bg: "from-[#0c0718] via-[#160a2c] to-[#241042]",
    glow1: "oklch(0.60 0.20 300 / 0.50)",
    glow2: "oklch(0.78 0.17 85 / 0.35)",
    image: "🚜",
    stat: { value: "10K+", label: "active farmers" },
  },
]

const SLIDE_MS = 7000

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const riseVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(6px)",
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] as const },
  },
}

export function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const slide = slides[index]

  // Cursor-follow spotlight
  const mx = useMotionValue(50)
  const my = useMotionValue(35)
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${mx}% ${my}%, rgba(255,255,255,0.10), transparent 60%)`
  const sectionRef = useRef<HTMLElement>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect) return
      mx.set(((e.clientX - rect.left) / rect.width) * 100)
      my.set(((e.clientY - rect.top) / rect.height) * 100)
    },
    [mx, my],
  )

  const go = useCallback((n: number) => setIndex((n + slides.length) % slides.length), [])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  // Auto-advance
  useEffect(() => {
    if (paused || reduceMotion) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [index, paused, reduceMotion])

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden min-h-[600px] md:min-h-[720px] flex items-center isolate"
      aria-roledescription="carousel"
    >
      {/* Crossfading gradient base */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          className={`absolute inset-0 -z-10 bg-gradient-to-br ${slide.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Aurora light blobs (recolour per slide) */}
      <motion.div
        key={`a-${slide.id}`}
        className="cine-blob cine-blob-a -z-10"
        style={{ background: slide.glow1, width: 620, height: 620, top: "-12%", right: "-8%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        key={`b-${slide.id}`}
        className="cine-blob cine-blob-b -z-10"
        style={{ background: slide.glow2, width: 460, height: 460, bottom: "-14%", left: "-6%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2 }}
      />

      {/* Cursor spotlight + film grain + vignette */}
      <motion.div className="absolute inset-0 -z-10" style={{ background: spotlight }} />
      <div className="cine-grain -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.div variants={riseVariants}>
                <Badge className="mb-5 bg-white/10 text-white border-white/20 text-sm px-4 py-1.5 backdrop-blur-md">
                  {slide.badge}
                </Badge>
              </motion.div>

              <motion.h1
                variants={riseVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight"
              >
                {slide.title}
              </motion.h1>
              <motion.h1
                variants={riseVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.08] tracking-tight cine-gold-flow"
              >
                {slide.titleHighlight}
              </motion.h1>

              <motion.p
                variants={riseVariants}
                className="text-lg text-white/75 mb-8 max-w-lg leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div variants={riseVariants} className="flex flex-col sm:flex-row gap-4">
                <Link href={slide.ctaLink}>
                  <Button
                    size="lg"
                    className="cine-sheen bg-white text-primary hover:bg-white text-base px-8 font-semibold gap-2 shadow-xl h-12 glow-gold"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={slide.secondaryCtaLink}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white text-base px-8 gap-2 h-12 backdrop-blur-md"
                  >
                    <Play className="w-4 h-4" /> {slide.secondaryCta}
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={riseVariants}
                className="mt-8 inline-flex items-center gap-3 bg-white/8 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/15"
              >
                <span className="text-2xl font-bold text-white tabular-nums">{slide.stat.value}</span>
                <span className="text-white/70 text-sm">{slide.stat.label}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Visual */}
          <div className="hidden md:flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                className="relative"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cine-kenburns w-72 h-72 rounded-full overflow-hidden shadow-2xl border border-white/15 glow-gold">
                  <img
                    src={({ 1: "/crops/maize.jpg", 2: "/crops/tomato.jpg", 3: "/crops/watermelon.jpg", 4: "/livestock-cow.png" } as Record<number, string>)[slide.id]}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 bg-white/12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/15"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/15"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-3xl">🇿🇲</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/8 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg border border-white/15 text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/8 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg border border-white/15 text-white"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Progress segments */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            className="h-1.5 w-10 rounded-full bg-white/25 overflow-hidden"
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.span
              className="block h-full rounded-full bg-white"
              initial={{ width: i < index ? "100%" : "0%" }}
              animate={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
              transition={
                i === index && !paused && !reduceMotion
                  ? { duration: SLIDE_MS / 1000, ease: "linear" }
                  : { duration: 0.3 }
              }
              style={{ width: i > index ? "0%" : undefined }}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
