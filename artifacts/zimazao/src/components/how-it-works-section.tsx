import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { UserPlus, Camera, ShoppingBag, Banknote, ArrowRight } from "lucide-react"

const steps = [
  { number: "01", icon: UserPlus, title: "Create Free Account", description: "Register as a farmer or buyer in 2 minutes. Verify your phone number with your Zambian mobile number." },
  { number: "02", icon: Camera, title: "List Your Crops", description: "Take photos of your crops and post your listing. Add price, quantity, and location to reach buyers nationwide." },
  { number: "03", icon: ShoppingBag, title: "Connect with Buyers", description: "Verified buyers from Lusaka, Ndola, Kitwe and across Zambia will contact you directly through the app." },
  { number: "04", icon: Banknote, title: "Get Paid Instantly", description: "Receive payment securely via MTN Mobile Money, Airtel Money, or Zamtel Kwacha — straight to your phone." },
]

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-[#04120b] py-24">
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-96 rounded-full bg-amber-400/8 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <Badge className="mb-4 border-amber-300/25 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-300">
            Simple Process
          </Badge>
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
            Start selling in 4 easy steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Join thousands of farmers who are already earning more from their harvests. It's completely free to get started.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-14 hidden h-px bg-gradient-to-r from-emerald-400/40 via-amber-300/40 to-emerald-400/40 lg:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/30 bg-[#04120b] font-display text-sm font-bold text-amber-300">
                {step.number}
              </div>
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-400/30 group-hover:shadow-[0_0_36px_-8px_rgba(52,211,153,0.4)]">
                <step.icon className="h-9 w-9 text-emerald-300" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="leading-relaxed text-white/60">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/register">
            <Button
              size="lg"
              className="cine-sheen gap-2 bg-gradient-to-r from-amber-300 to-amber-500 px-10 py-6 text-lg font-semibold text-amber-950 shadow-xl hover:from-amber-200 hover:to-amber-400 glow-gold"
            >
              Start for Free Today <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-white/50">No credit card required. Free forever for farmers.</p>
        </div>
      </div>
    </section>
  )
}
