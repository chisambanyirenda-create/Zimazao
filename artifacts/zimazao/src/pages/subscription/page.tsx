import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Link, useLocation } from "wouter"
import {
  Check, X, Crown, Leaf, Zap, BarChart3, Star, Shield,
  Smartphone, Loader2, CreditCard,
} from "lucide-react"

const PLAN_PRICE = 80

interface SubStatus {
  plan: "free" | "pro"
  status: string
  endDate?: string
  limits: { listings: number | null; diseaseScans: number | null }
}

function PaymentModal({
  open,
  onClose,
  onSuccess,
}: { open: boolean; onClose: () => void; onSuccess: (ref: string) => void }) {
  const [phone, setPhone] = useState("")
  const [method, setMethod] = useState<"mtn_mobile_money" | "airtel_money">("mtn_mobile_money")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"form" | "verify">("form")
  const [reference, setReference] = useState("")
  const { toast } = useToast()

  if (!open) return null

  const handleInitiate = async () => {
    if (!phone.trim()) { toast({ title: "Enter phone number", variant: "destructive" }); return }
    setLoading(true)
    try {
      const res = await api.payments.initiate({ amount: PLAN_PRICE, method, phone, purpose: "subscription" })
      setReference(res.reference)
      setStep("verify")
      if (res.testMode) {
        toast({ title: "Test mode", description: "Simulating payment approval..." })
        setTimeout(() => { onSuccess(res.reference) }, 1500)
      } else {
        toast({ title: "Prompt sent!", description: "Check your phone for the mobile money prompt." })
      }
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const res = await api.payments.verify(reference)
      if (res.status === "successful") {
        onSuccess(reference)
      } else {
        toast({ title: "Payment not yet confirmed", description: "Please approve the prompt on your phone and try again." })
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Pay with Mobile Money</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {step === "form" ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">ZMW {PLAN_PRICE}</p>
              <p className="text-sm text-amber-600">Pro Plan — 1 Month</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "mtn_mobile_money" as const, label: "MTN MoMo", color: "bg-yellow-400" },
                  { value: "airtel_money" as const, label: "Airtel Money", color: "bg-red-500" },
                ]).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${method === m.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${m.color}`} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
              <div className="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 ring-primary/30">
                <span className="px-3 py-2.5 bg-muted text-sm text-muted-foreground border-r">+260</span>
                <input
                  type="tel"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                  placeholder="97XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleInitiate} disabled={loading} className="w-full h-12 text-base gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              {loading ? "Sending prompt..." : "Pay ZMW 80"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">You will receive a mobile money prompt on your phone</p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-amber-600" />
            </div>
            <p className="font-semibold">Check your phone!</p>
            <p className="text-sm text-muted-foreground">Approve the mobile money prompt on your phone, then click verify below.</p>
            <Button onClick={handleVerify} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? "Verifying..." : "I've approved — Verify Payment"}
            </Button>
            <button onClick={() => setStep("form")} className="text-sm text-muted-foreground hover:underline">← Start over</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [, setLocation] = useLocation()
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      api.subscription.status().then(setSubStatus).catch(() => {})
    }
  }, [user])

  const handlePaymentSuccess = async (reference: string) => {
    setShowPayment(false)
    setUpgrading(true)
    try {
      await api.subscription.upgrade("pro", reference)
      toast({ title: "🎉 Welcome to Pro!", description: "You now have unlimited listings and scans." })
      const updated = await api.subscription.status()
      setSubStatus(updated)
    } catch (err: any) {
      toast({ title: "Upgrade failed", description: err.message, variant: "destructive" })
    } finally {
      setUpgrading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to manage your subscription</h1>
          <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    )
  }

  const isPro = subStatus?.plan === "pro"

  const features = [
    { label: "Active crop listings", free: "3 max", pro: "Unlimited", icon: Leaf },
    { label: "Disease scans per month", free: "5 scans", pro: "Unlimited", icon: Zap },
    { label: "Price analytics & trends", free: false, pro: true, icon: BarChart3 },
    { label: "Priority search placement", free: false, pro: true, icon: Star },
    { label: "Pro Farmer badge", free: false, pro: true, icon: Crown },
    { label: "Marketplace access", free: true, pro: true, icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Grow your farm business with the right tools</p>
        </div>

        {isPro && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">You are on the Pro Plan 🎉</p>
              <p className="text-sm text-amber-700">
                {subStatus?.endDate
                  ? `Active until ${new Date(subStatus.endDate).toLocaleDateString("en-ZM", { day: "numeric", month: "long", year: "numeric" })}`
                  : "Active"}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card className={`border-2 ${!isPro ? "border-primary" : "border-border"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Free</CardTitle>
                {!isPro && <Badge className="bg-primary/10 text-primary border-0">Current Plan</Badge>}
              </div>
              <p className="text-3xl font-bold">ZMW 0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground">Get started at no cost</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    {f.free === false ? (
                      <X className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span className={f.free === false ? "text-muted-foreground" : ""}>
                      {f.label}
                      {typeof f.free === "string" && <span className="ml-1 text-muted-foreground">({f.free})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className={`border-2 relative overflow-hidden ${isPro ? "border-amber-400" : "border-amber-300"}`}>
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" /> Pro
                </CardTitle>
                {isPro && <Badge className="bg-amber-100 text-amber-700 border-0">Active</Badge>}
              </div>
              <p className="text-3xl font-bold">ZMW {PLAN_PRICE}<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground">For serious farmers</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      {f.label}
                      {typeof f.pro === "string" && <span className="ml-1 text-muted-foreground">({f.pro})</span>}
                    </span>
                  </li>
                ))}
              </ul>

              {!isPro && (
                <Button
                  onClick={() => setShowPayment(true)}
                  disabled={upgrading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 h-11"
                >
                  {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {upgrading ? "Upgrading..." : "Upgrade to Pro — ZMW 80/month"}
                </Button>
              )}
              {isPro && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  ✅ You're already on Pro! Enjoy unlimited access.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                { q: "How is payment made?", a: "Via MTN Mobile Money or Airtel Money. You'll receive a prompt on your phone to confirm." },
                { q: "When does my Pro plan start?", a: "Immediately after payment is confirmed. You get 30 days of Pro access." },
                { q: "What happens when Pro expires?", a: "You drop back to the Free plan. Your existing listings remain but you can't add more beyond the limit." },
                { q: "Is there a contract?", a: "No contracts. Pay month-to-month and cancel anytime." },
              ].map((faq) => (
                <div key={faq.q} className="p-4 bg-muted/40 rounded-xl">
                  <p className="font-medium mb-1">{faq.q}</p>
                  <p className="text-muted-foreground text-xs">{faq.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
