import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { UserPlus, Camera, ShoppingBag, Banknote, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Free Account",
    description: "Register as a farmer or buyer in 2 minutes. Verify your phone number with your Zambian mobile number.",
    color: "from-primary to-primary/70",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    number: "02",
    icon: Camera,
    title: "List Your Crops",
    description: "Take photos of your crops and post your listing. Add price, quantity, and location to reach buyers nationwide.",
    color: "from-chart-2 to-chart-2/70",
    bgColor: "bg-chart-2/10",
    iconColor: "text-chart-2",
  },
  {
    number: "03",
    icon: ShoppingBag,
    title: "Connect with Buyers",
    description: "Verified buyers from Lusaka, Ndola, Kitwe and across Zambia will contact you directly through the app.",
    color: "from-accent to-accent/70",
    bgColor: "bg-accent/10",
    iconColor: "text-accent-foreground",
  },
  {
    number: "04",
    icon: Banknote,
    title: "Get Paid Instantly",
    description: "Receive payment securely via MTN Mobile Money, Airtel Money, or Zamtel Kwacha — straight to your phone.",
    color: "from-chart-4 to-chart-4/70",
    bgColor: "bg-chart-4/10",
    iconColor: "text-chart-4",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Start Selling in 4 Easy Steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of farmers who are already earning more from their harvests. It's completely free to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-accent to-chart-4 opacity-20" />

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              {/* Number badge */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold flex items-center justify-center mb-4 shadow-lg`}>
                {step.number}
              </div>

              {/* Icon circle */}
              <div className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <step.icon className={`w-10 h-10 ${step.iconColor}`} />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link href="/register">
            <Button size="lg" className="text-lg px-10 py-6 shadow-lg gap-2">
              Start for Free Today <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-3">No credit card required. Free forever for farmers.</p>
        </div>
      </div>
    </section>
  )
}
