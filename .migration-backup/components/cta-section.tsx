import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"

const benefits = [
  "Free to list your crops",
  "Direct connection with buyers",
  "Secure mobile money payments",
  "AI-powered disease detection",
]

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Ready to Grow Your Farm Business?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join thousands of Zambian farmers who are already using Zimazao to sell their crops and increase their income.
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-primary-foreground/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-48 h-48 bg-primary-foreground/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <span className="text-[120px] relative z-10">🌱</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
