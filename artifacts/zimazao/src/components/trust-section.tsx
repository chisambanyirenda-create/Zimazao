import { Badge } from "@/components/ui/badge"
import { Shield, Award, Users, Lock, Smartphone, Headphones } from "lucide-react"

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Farmers",
    description: "Every seller is verified with a valid Zambian phone number and NRC.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "All transactions are protected with bank-grade encryption.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    description: "Seamless integration with MTN, Airtel Money & Zamtel Kwacha.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: Award,
    title: "Quality Graded",
    description: "Crops are graded to Zambia Bureau of Standards quality levels.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Users,
    title: "Buyer Protection",
    description: "Our escrow system holds payment until delivery is confirmed.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our team speaks Nyanja, Bemba, Tonga & English to help you.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
]

const partners = [
  { name: "Ministry of Agriculture", emoji: "🏛️" },
  { name: "Zambia Farmers Union", emoji: "🌾" },
  { name: "MTN Zambia", emoji: "📱" },
  { name: "Airtel Zambia", emoji: "📡" },
  { name: "ZNFU", emoji: "🤝" },
  { name: "ZABS", emoji: "✅" },
]

export function TrustSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            Why Farmers Trust Us
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Built for Zambian Farmers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We understand the challenges of farming in Zambia. Every feature is designed with your success in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {trustFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-6">
            Trusted & Recognized By
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 bg-card rounded-full shadow-sm border border-border">
                <span className="text-xl">{p.emoji}</span>
                <span className="text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
