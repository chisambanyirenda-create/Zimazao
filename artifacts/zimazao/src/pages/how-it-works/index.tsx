import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart, Tractor, ShieldCheck, Banknote, Truck,
  CheckCircle2, MessageCircle, Star, AlertTriangle, HeadphonesIcon,
  ArrowRight, Smartphone, Lock,
} from "lucide-react"

function Step({ number, icon: Icon, title, description, color }: {
  number: number; icon: any; title: string; description: string; color: string
}) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-muted-foreground">STEP {number}</span>
        </div>
        <h3 className="font-bold text-base mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">How Zimazao Works</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Safe & Fair for Everyone</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Zimazao connects Zambian farmers directly with buyers. Our escrow system protects every transaction â€” farmers get paid, buyers get their crops.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* Payment Methods */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Two Ways to Pay</h2>
            <p className="text-muted-foreground">Choose what works best for you</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <Badge className="bg-primary/10 text-primary border-0 mb-3">Recommended</Badge>
                <h3 className="text-xl font-bold mb-2">Online Payment (Escrow)</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  Pay online via mobile money. Your money is held securely by Zimazao until you confirm you received your crops â€” then and only then is the farmer paid. You're always protected.
                </p>
                <ul className="space-y-2 text-sm">
                  {["Money held safely until delivery confirmed", "Full refund if something goes wrong", "48-hour auto-release if you don't respond", "Dispute resolution by our team"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Banknote className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cash on Delivery</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  Prefer to pay in cash when you receive the crops? Choose Cash on Delivery. The order is recorded, both parties are notified, and you settle payment directly when the crops arrive.
                </p>
                <ul className="space-y-2 text-sm">
                  {["No online payment required", "Order tracked by Zimazao system", "Farmer invoiced for 3% commission", "Suitable for local, in-person deals"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buyer flow */}
        <section className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-xl font-bold">For Buyers</h2>
            </div>
            <div className="space-y-6">
              <Step number={1} icon={ShoppingCart} color="bg-blue-500" title="Browse & Order"
                description="Search the marketplace for fresh crops from verified farmers across all 10 provinces. Filter by category, province, or price." />
              <Step number={2} icon={Smartphone} color="bg-purple-500" title="Choose Payment Method"
                description="Select Online Payment (escrow via mobile money) or Cash on Delivery when placing your order." />
              <Step number={3} icon={MessageCircle} color="bg-green-500" title="Coordinate with Farmer"
                description="Message the farmer directly through Zimazao to arrange pickup, delivery logistics, and timing." />
              <Step number={4} icon={Truck} color="bg-orange-500" title="Receive Your Crops"
                description="Receive your crops as arranged. For online payments, the money is held securely until this step." />
              <Step number={5} icon={CheckCircle2} color="bg-emerald-600" title="Confirm Delivery"
                description="Click Confirm Delivery once you're satisfied. This releases the payment to the farmer. If there's a problem, click Report Problem instead." />
              <Step number={6} icon={Star} color="bg-yellow-500" title="Rate the Farmer"
                description="Leave a star rating and review to help other buyers and reward reliable farmers." />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Tractor className="w-5 h-5 text-green-300" />
              </div>
              <h2 className="text-xl font-bold">For Farmers</h2>
            </div>
            <div className="space-y-6">
              <Step number={1} icon={Tractor} color="bg-green-500" title="List Your Crops"
                description="Create a listing with your crop name, quantity, price, unit, and province. Add a photo for better visibility." />
              <Step number={2} icon={CheckCircle2} color="bg-blue-500" title="Confirm Orders"
                description="When a buyer orders, you'll receive a message notification. Confirm the order and update the status as you prepare." />
              <Step number={3} icon={Truck} color="bg-orange-500" title="Dispatch & Deliver"
                description="Mark your order as Dispatched when goods are on the way. Keep the buyer informed via the messaging system." />
              <Step number={4} icon={ShieldCheck} color="bg-primary" title="Get Paid (Online)"
                description="For online orders, funds are released to your Zimazao wallet as soon as the buyer confirms delivery (or automatically after 48 hours)." />
              <Step number={5} icon={Banknote} color="bg-amber-500" title="Cash on Delivery"
                description="For COD orders, collect payment directly from the buyer and mark the order Complete. Zimazao will invoice you for the 3% commission." />
              <Step number={6} icon={Smartphone} color="bg-purple-500" title="Request Withdrawal"
                description="Request a payout from your wallet to your MTN or Airtel mobile money at any time. Processed within 1â€“3 business hours." />
            </div>
          </div>
        </section>

        {/* Escrow Explanation */}
        <section className="bg-gradient-to-r from-primary/5 to-emerald-500/10 rounded-2xl p-8 border border-primary/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">How Escrow Protects You</h2>
              <p className="text-muted-foreground text-sm">Your money is never at risk</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            {[
              { icon: Lock, title: "Funds Held Safely", desc: "When you pay online, funds are held by Zimazao â€” not sent to the farmer yet." },
              { icon: CheckCircle2, title: "Released on Confirmation", desc: "Only after you confirm you received the correct crops does the payment reach the farmer." },
              { icon: AlertTriangle, title: "48-Hour Auto-Release", desc: "If you don't confirm or dispute within 48 hours of delivery, funds are automatically released to the farmer." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dispute */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
            <h2 className="text-xl font-bold">Dispute Resolution</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <p className="font-semibold text-base">When to raise a dispute</p>
                <ul className="space-y-2 text-muted-foreground">
                  {["Wrong product received", "Quantity was incorrect", "Product was damaged or spoiled", "Payment issue or double charge", "Any other serious problem"].map((r) => (
                    <li key={r} className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <p className="font-semibold text-base">What happens next</p>
                <ul className="space-y-2 text-muted-foreground">
                  {["Transaction is immediately frozen", "Both parties are notified", "CEO reviews all evidence provided", "Resolution: refund, release, or request more info", "Both parties notified of outcome"].map((r, i) => (
                    <li key={r} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Join thousands of farmers and buyers already trading safely on Zimazao.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register">
              <Button className="gap-2 bg-gradient-to-r from-primary to-emerald-600 h-11 px-6">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" className="h-11 px-6 gap-2">
                <ShoppingCart className="w-4 h-4" /> Browse Marketplace
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            By using Zimazao you agree to our <Link href="/terms" className="underline text-primary">Terms and Conditions</Link>
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}
