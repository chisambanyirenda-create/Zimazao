import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useLocation } from "wouter"
import { Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown, CheckCircle2, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface PriceAlert {
  id: string
  cropName: string
  targetPrice: number
  direction: "above" | "below"
  unit: string
  createdAt: string
  triggered?: boolean
  currentPrice?: number
}

const CROP_SUGGESTIONS = [
  "Maize", "Soybeans", "Groundnuts", "Sunflower", "Wheat", "Sorghum",
  "Sweet Potatoes", "Cassava", "Beans", "Cotton", "Tobacco", "Rice",
  "Tomatoes", "Onions", "Cabbage", "Pumpkins",
]

const UNIT_OPTIONS = ["50kg bag", "25kg bag", "per kg", "per tonne", "per crate", "per head"]

// Demo current prices for simulation
const DEMO_PRICES: Record<string, number> = {
  Maize: 450, Soybeans: 880, Groundnuts: 620, Sunflower: 510,
  Wheat: 520, Sorghum: 390, "Sweet Potatoes": 150, Cassava: 180,
  Beans: 750, Cotton: 340, Tobacco: 1200, Rice: 680,
  Tomatoes: 95, Onions: 120, Cabbage: 80, Pumpkins: 60,
}

const STORAGE_KEY = "zimazao_price_alerts"

function loadAlerts(): PriceAlert[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch { return [] }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

function checkTrigger(alert: PriceAlert): boolean {
  const current = DEMO_PRICES[alert.cropName]
  if (!current) return false
  return alert.direction === "above" ? current >= alert.targetPrice : current <= alert.targetPrice
}

export default function PriceAlertsPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const { toast } = useToast()

  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [cropName, setCropName] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [direction, setDirection] = useState<"above" | "below">("below")
  const [unit, setUnit] = useState("50kg bag")
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    const stored = loadAlerts()
    // Enrich with current demo prices and trigger status
    const enriched = stored.map((a) => ({
      ...a,
      currentPrice: DEMO_PRICES[a.cropName],
      triggered: checkTrigger(a),
    }))
    setAlerts(enriched)
  }, [user])

  const filteredSuggestions = CROP_SUGGESTIONS.filter((c) =>
    c.toLowerCase().includes(cropName.toLowerCase()) && cropName.length > 0
  )

  const handleAdd = () => {
    if (!cropName.trim() || !targetPrice || isNaN(Number(targetPrice))) {
      toast({ title: "Please fill in all fields correctly", variant: "destructive" })
      return
    }
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      cropName: cropName.trim(),
      targetPrice: Number(targetPrice),
      direction,
      unit,
      createdAt: new Date().toISOString(),
      currentPrice: DEMO_PRICES[cropName.trim()],
      triggered: false,
    }
    newAlert.triggered = checkTrigger(newAlert)
    const updated = [newAlert, ...alerts]
    setAlerts(updated)
    saveAlerts(updated.map(({ currentPrice: _, triggered: __, ...a }) => a))
    setCropName("")
    setTargetPrice("")
    setShowForm(false)
    toast({
      title: newAlert.triggered ? "Alert Already Triggered! 🔔" : "Price Alert Set! ✅",
      description: newAlert.triggered
        ? `${cropName} is already ${direction} ZMW ${targetPrice} (current: ZMW ${newAlert.currentPrice}).`
        : `You'll be notified when ${cropName} goes ${direction} ZMW ${targetPrice}/${unit}.`,
    })
  }

  const handleDelete = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id)
    setAlerts(updated)
    saveAlerts(updated.map(({ currentPrice: _, triggered: __, ...a }) => a))
  }

  const triggeredCount = alerts.filter((a) => a.triggered).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BellRing className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Price Alerts</h1>
                  <p className="text-white/70 text-sm">Get notified when crop prices hit your target</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {triggeredCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-xl">
                  <Bell className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-200 text-sm font-semibold">{triggeredCount} alert{triggeredCount !== 1 ? "s" : ""} triggered!</span>
                </div>
              )}
              <Button
                onClick={() => setShowForm((p) => !p)}
                className="gap-2 bg-white text-emerald-700 hover:bg-white/90 font-semibold"
              >
                <Plus className="w-4 h-4" /> New Alert
              </Button>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
              <Bell className="w-4 h-4 text-white/70" />
              <span>{alerts.length} active alert{alerts.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Checks against live market prices</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Add Alert Form */}
        {showForm && (
          <Card className="border-emerald-500/25 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Set a New Price Alert
                </CardTitle>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Crop name */}
              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Crop Name</label>
                <Input
                  value={cropName}
                  onChange={(e) => { setCropName(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. Maize, Soybeans, Groundnuts…"
                  className="h-10"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                    {filteredSuggestions.slice(0, 6).map((s) => (
                      <button
                        key={s}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                        onMouseDown={() => { setCropName(s); setShowSuggestions(false) }}
                      >
                        <span>{s}</span>
                        {DEMO_PRICES[s] && (
                          <span className="text-xs text-muted-foreground">Currently ZMW {DEMO_PRICES[s]}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Direction */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Alert me when price goes</label>
                  <div className="flex rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setDirection("below")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                        direction === "below" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" /> Below
                    </button>
                    <button
                      onClick={() => setDirection("above")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                        direction === "above" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> Above
                    </button>
                  </div>
                </div>

                {/* Target price */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Target Price (ZMW)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">ZMW</span>
                    <Input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="e.g. 400"
                      className="h-10 pl-14"
                    />
                  </div>
                  {cropName && DEMO_PRICES[cropName] && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: ZMW {DEMO_PRICES[cropName]}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Per Unit</label>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                    >
                      {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button onClick={handleAdd} className="gap-2 flex-1">
                  <Bell className="w-4 h-4" /> Set Alert
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert List */}
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/5 border border-primary/15 rounded-3xl flex items-center justify-center mb-5">
              <BellRing className="w-9 h-9 text-primary/30" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No price alerts yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Set up alerts and we'll notify you when a crop's market price hits your target — so you never miss the right moment to buy or sell.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-foreground">{alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Alert
              </button>
            </div>
            {alerts.map((alert) => {
              const isTriggered = alert.triggered
              const current = alert.currentPrice
              const priceDiff = current != null ? current - alert.targetPrice : null
              return (
                <Card key={alert.id} className={`border transition-all ${isTriggered ? "border-amber-300 bg-amber-500/15/50 shadow-amber-100 shadow-md" : "border-border hover:shadow-md"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isTriggered ? "bg-amber-500/20" : alert.direction === "below" ? "bg-blue-500/15" : "bg-emerald-500/15"
                      }`}>
                        {isTriggered
                          ? <BellRing className="w-5 h-5 text-amber-300" />
                          : alert.direction === "below"
                            ? <TrendingDown className="w-5 h-5 text-blue-300" />
                            : <TrendingUp className="w-5 h-5 text-emerald-300" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-bold text-foreground text-base">{alert.cropName}</p>
                          {isTriggered && (
                            <Badge className="bg-amber-500 text-white border-0 text-xs animate-pulse">🔔 Triggered!</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Alert when price goes{" "}
                          <span className={`font-semibold ${alert.direction === "below" ? "text-blue-300" : "text-emerald-300"}`}>
                            {alert.direction}
                          </span>
                          {" "}
                          <span className="font-bold text-foreground">ZMW {alert.targetPrice.toLocaleString()}</span>
                          <span className="text-muted-foreground"> / {alert.unit}</span>
                        </p>
                        {current != null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current market price: <span className="font-semibold text-foreground">ZMW {current.toLocaleString()}</span>
                            {priceDiff != null && (
                              <span className={` ml-1 ${priceDiff > 0 ? "text-emerald-300" : "text-red-500"}`}>
                                ({priceDiff > 0 ? "+" : ""}{priceDiff.toLocaleString()} ZMW)
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/15 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* How it works */}
        <Card className="bg-muted/40 border-0 mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> How Price Alerts Work
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "1", icon: "🎯", title: "Set Your Target", desc: "Choose a crop and the price you want to buy or sell at." },
                { step: "2", icon: "👁️", title: "We Watch Prices", desc: "Zimazao monitors market prices across all provinces in real time." },
                { step: "3", icon: "🔔", title: "Get Notified", desc: "When the price hits your target, you'll see a notification in-app." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-0.5">{item.icon} {item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
