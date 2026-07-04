import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Camera, BarChart3, Wallet, CalendarDays, MessageCircle, ArrowRight, Zap, Beef } from "lucide-react"
import { Link } from "wouter"

const features = [
  {
    icon: ShoppingBag,
    title: "Crop Marketplace",
    description: "List and sell your maize, groundnuts, soybeans, cassava, and other crops directly to verified buyers across Zambia.",
    link: "/marketplace",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
    tag: "Most Popular",
    tagColor: "bg-emerald-400/90 text-emerald-950",
  },
  {
    icon: Beef,
    title: "Livestock Exchange",
    description: "Buy and sell cattle, goats, pigs, and poultry. Verified sellers, vaccination records, and live livestock price index.",
    link: "/livestock",
    chip: "bg-amber-400/15 text-amber-300 border-amber-300/20",
    tag: "New",
    tagColor: "bg-amber-300/90 text-amber-950",
  },
  {
    icon: Camera,
    title: "AI Disease Detection",
    description: "Upload photos of your crops to get instant AI-powered diagnosis and treatment recommendations in seconds.",
    link: "/disease-detector",
    chip: "bg-sky-500/15 text-sky-300 border-sky-400/20",
    tag: "AI Powered",
    tagColor: "bg-sky-400/90 text-sky-950",
  },
  {
    icon: BarChart3,
    title: "Live Market Prices",
    description: "Real-time commodity prices from Lusaka, Ndola, Kitwe and 5 major markets. Know the best time to sell.",
    link: "/prices",
    chip: "bg-violet-500/15 text-violet-300 border-violet-400/20",
    tag: "Live Data",
    tagColor: "bg-violet-400/90 text-violet-950",
  },
  {
    icon: Wallet,
    title: "Mobile Money Payments",
    description: "Receive payments instantly via MTN Mobile Money, Airtel Money, or Zamtel Kwacha — no bank account needed.",
    link: "/",
    chip: "bg-teal-500/15 text-teal-300 border-teal-400/20",
    tag: "Secure",
    tagColor: "bg-teal-400/90 text-teal-950",
  },
  {
    icon: CalendarDays,
    title: "Crop Calendar",
    description: "Province-specific planting, fertilizing, and harvesting schedules based on Zambia's rainfall patterns.",
    link: "/crop-calendar",
    chip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/20",
    tag: "Seasonal",
    tagColor: "bg-fuchsia-400/90 text-fuchsia-950",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Chat directly with buyers or sellers. Negotiate prices, arrange delivery, and close deals — all in one place.",
    link: "/messages",
    chip: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    tag: "Real-time",
    tagColor: "bg-rose-400/90 text-rose-950",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#03100a] py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[46rem] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[100px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <Badge className="mb-4 border-amber-300/25 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-300">
            <Zap className="mr-1 h-3.5 w-3.5" /> Platform Features
          </Badge>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold text-white md:text-5xl">
            Everything to grow your farm business
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Zimazao gives Zambian farmers powerful tools to sell crops, protect harvests, and increase profits — all in one app.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              <Link href={feature.link}>
                <div className="group h-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300/30 hover:bg-white/[0.05] hover:shadow-[0_0_44px_-10px_rgba(245,200,90,0.35)]">
                  <div className="mb-5 flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${feature.chip} transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <Badge className={`border-0 text-xs font-semibold ${feature.tagColor}`}>{feature.tag}</Badge>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-bold text-white transition-colors group-hover:text-amber-200">
                    {feature.title}
                  </h3>
                  <p className="mb-4 leading-relaxed text-white/60">{feature.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 transition-all group-hover:gap-2.5">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
