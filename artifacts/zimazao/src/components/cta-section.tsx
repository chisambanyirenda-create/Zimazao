import { motion } from "framer-motion"
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
  { icon: TrendingUp, value: "ZMW 5M+", label: "Sales" },
  { icon: Star, value: "4.9★", label: "Rating" },
]

const floatingCards = [
  { pos: "-top-4 -right-4", label: "Today's Top Sale", value: "🌽 ZMW 450/bag", accent: "text-amber-300" },
  { pos: "-bottom-4 -left-4", label: "New Farmers Today", value: "👨‍🌾 +12 joined", accent: "text-emerald-300" },
  { pos: "top-1/2 -right-12 -translate-y-1/2", label: "Disease Scans", value: "🔬 847 today", accent: "text-sky-300" },
]

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#040f0a] py-24">
      {/* Aurora glow */}
      <div className="pointer-events-none absolute -right-24 top-0 h-[30rem] w-[30rem] rounded-full bg-emerald-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-amber-400/15 blur-[110px]" />
      <div className="cine-grain" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge className="mb-5 border-amber-300/25 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-300">
              🇿🇲 Proudly Zambian
            </Badge>
            <h2 className="mb-4 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
              Ready to grow your{" "}
              <span className="cine-gold-flow">farm business?</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/70">
              Join thousands of Zambian farmers already using Zimazao to sell crops, protect harvests, and increase income. It's 100% free to start.
            </p>
            <ul className="mb-8 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-amber-300" strokeWidth={1.75} />
                  <span className="text-white/85">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="cine-sheen h-12 gap-2 bg-gradient-to-r from-amber-300 to-amber-500 px-8 text-base font-semibold text-amber-950 shadow-xl hover:from-amber-200 hover:to-amber-400 glow-gold"
                >
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/25 bg-white/5 px-8 text-base text-white backdrop-blur-md hover:bg-white/15 hover:text-white"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </div>
            <div className="flex gap-8">
              {miniStats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="hidden items-center justify-center md:flex">
            <motion.div
              className="relative h-80 w-80"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md glow-gold" />
              <div className="absolute inset-6 rounded-full border border-white/10 bg-white/[0.03]" />
              <div className="cine-kenburns absolute inset-0 flex items-center justify-center">
                <span className="text-[130px] drop-shadow-2xl">🌱</span>
              </div>
              {floatingCards.map((c, i) => (
                <motion.div
                  key={c.label}
                  className={`absolute ${c.pos} rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-xl shadow-2xl`}
                  animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-xs text-white/50">{c.label}</p>
                  <p className={`text-sm font-bold ${c.accent}`}>{c.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
