import { useEffect, useRef, useState } from "react"
import { motion, useInView, animate } from "framer-motion"
import { TrendingUp, Users, ShoppingBag, Shield, Leaf, MapPin } from "lucide-react"

type Accent = "emerald" | "gold"

const stats: {
  icon: typeof Users
  value: number
  prefix?: string
  suffix?: string
  label: string
  sublabel: string
  accent: Accent
}[] = [
  { icon: Users, value: 10000, suffix: "+", label: "Active Farmers", sublabel: "Across all 10 provinces", accent: "emerald" },
  { icon: ShoppingBag, value: 50000, suffix: "+", label: "Crops Sold", sublabel: "This farming season", accent: "gold" },
  { icon: TrendingUp, value: 5, prefix: "ZMW ", suffix: "M+", label: "Total Sales Value", sublabel: "Processed securely", accent: "gold" },
  { icon: Shield, value: 99, suffix: "%", label: "Secure Transactions", sublabel: "Bank-grade escrow", accent: "emerald" },
  { icon: Leaf, value: 12, label: "Crop Categories", sublabel: "Maize to exotic fruits", accent: "emerald" },
  { icon: MapPin, value: 10, label: "Provinces Covered", sublabel: "Nationwide coverage", accent: "gold" },
]

function formatValue(n: number) {
  const rounded = Math.round(n)
  if (rounded >= 1000) return (rounded / 1000).toFixed(0) + "K"
  return String(rounded)
}

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatValue(display)}
      {suffix}
    </span>
  )
}

const accentMap: Record<Accent, { chip: string; ring: string; text: string; glow: string }> = {
  emerald: {
    chip: "from-emerald-400/20 to-emerald-600/10 text-emerald-300",
    ring: "group-hover:border-emerald-400/40",
    text: "text-emerald-300",
    glow: "group-hover:shadow-[0_0_36px_-6px_rgba(52,211,153,0.35)]",
  },
  gold: {
    chip: "from-amber-300/25 to-amber-500/10 text-amber-300",
    ring: "group-hover:border-amber-300/45",
    text: "text-amber-300",
    glow: "group-hover:shadow-[0_0_36px_-6px_rgba(245,200,90,0.40)]",
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#04130c] py-20">
      {/* ambient depth */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-96 rounded-full bg-amber-400/10 blur-[90px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300/80">
            Trusted across Zambia
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            The numbers behind the movement
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, i) => {
            const a = accentMap[stat.accent]
            return (
              <motion.div
                key={stat.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${a.ring} ${a.glow}`}
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${a.chip}`}
                >
                  <stat.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p className={`font-display text-3xl font-bold ${a.text} mb-1`}>
                  <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="text-sm font-medium text-white">{stat.label}</p>
                <p className="mt-0.5 hidden text-xs text-white/50 md:block">{stat.sublabel}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
