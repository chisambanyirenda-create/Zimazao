import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Camera, BarChart3, Wallet, CalendarDays, MessageCircle, ArrowRight, Zap, Beef } from "lucide-react"
import { Link } from "wouter"

const features = [
  {
    icon: ShoppingBag,
    title: "Crop Marketplace",
    description: "List and sell your maize, groundnuts, soybeans, cassava, and other crops directly to verified buyers across Zambia.",
    link: "/marketplace",
    color: "text-primary",
    bgColor: "bg-primary/10",
    tag: "Most Popular",
    tagColor: "bg-primary text-primary-foreground",
  },
  {
    icon: Beef,
    title: "Livestock Exchange",
    description: "Buy and sell cattle, goats, pigs, and poultry. Verified sellers, vaccination records, and live livestock price index.",
    link: "/livestock",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    tag: "New",
    tagColor: "bg-amber-500 text-white",
  },
  {
    icon: Camera,
    title: "AI Disease Detection",
    description: "Upload photos of your crops to get instant AI-powered diagnosis and treatment recommendations in seconds.",
    link: "/disease-detector",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    tag: "AI Powered",
    tagColor: "bg-blue-600 text-white",
  },
  {
    icon: BarChart3,
    title: "Live Market Prices",
    description: "Real-time commodity prices from Lusaka, Ndola, Kitwe and 5 major markets. Know the best time to sell.",
    link: "/prices",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    tag: "Live Data",
    tagColor: "bg-violet-600 text-white",
  },
  {
    icon: Wallet,
    title: "Mobile Money Payments",
    description: "Receive payments instantly via MTN Mobile Money, Airtel Money, or Zamtel Kwacha — no bank account needed.",
    link: "/",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    tag: "Secure",
    tagColor: "bg-emerald-600 text-white",
  },
  {
    icon: CalendarDays,
    title: "Crop Calendar",
    description: "Province-specific planting, fertilizing, and harvesting schedules based on Zambia's rainfall patterns.",
    link: "/crop-calendar",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    tag: "Seasonal",
    tagColor: "bg-purple-600 text-white",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Chat directly with buyers or sellers. Negotiate prices, arrange delivery, and close deals — all in one place.",
    link: "/messages",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    tag: "Real-time",
    tagColor: "bg-rose-600 text-white",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 mr-1" /> Platform Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything to Grow Your Farm Business
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Zimazao gives Zambian farmers powerful tools to sell crops, protect harvests, and increase profits — all in one app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link}>
              <div className="bg-card rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border border-border hover:border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <Badge className={`text-xs ${feature.tagColor} border-0`}>{feature.tag}</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                <span className="inline-flex items-center gap-1.5 text-primary text-sm font-medium group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
