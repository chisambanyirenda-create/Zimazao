import { useEffect, useRef, useState } from "react"
import { TrendingUp, Users, ShoppingBag, Shield, Leaf, MapPin } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Active Farmers",
    sublabel: "Across all 10 provinces",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: ShoppingBag,
    value: 50000,
    suffix: "+",
    label: "Crops Sold",
    sublabel: "This farming season",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: TrendingUp,
    value: 5,
    prefix: "K",
    suffix: "M+",
    label: "Total Sales Value",
    sublabel: "Processed securely",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: Shield,
    value: 99,
    suffix: "%",
    label: "Secure Transactions",
    sublabel: "Bank-grade encryption",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    icon: Leaf,
    value: 12,
    suffix: "",
    label: "Crop Categories",
    sublabel: "Maize to exotic fruits",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    borderColor: "border-chart-1/20",
  },
  {
    icon: MapPin,
    value: 10,
    suffix: "",
    label: "Provinces Covered",
    sublabel: "Nationwide coverage",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
]

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let start = 0
          const duration = 1800
          const step = Math.ceil(value / (duration / 16))
          const timer = setInterval(() => {
            start = Math.min(start + step, value)
            setDisplay(start)
            if (start >= value) clearInterval(timer)
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {prefix}{display >= 1000 ? (display / 1000).toFixed(0) + "K" : display}{suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-muted-foreground text-lg">
            Trusted by farmers and buyers across 🇿🇲 Zambia
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-card rounded-2xl p-5 text-center border ${stat.borderColor} hover:shadow-md transition-shadow`}>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="font-medium text-foreground text-sm">{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5 hidden md:block">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
