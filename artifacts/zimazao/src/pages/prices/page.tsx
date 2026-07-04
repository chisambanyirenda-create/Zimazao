import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, RefreshCw, Info, Bell, Search, BarChart3 } from "lucide-react"

const marketPrices = [
  {
    crop: "White Maize", emoji: "🌽", unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 450, change: 5.2 },
      { name: "Ndola", price: 440, change: 3.1 },
      { name: "Kitwe", price: 445, change: 2.8 },
      { name: "Livingstone", price: 460, change: -1.5 },
      { name: "Chipata", price: 430, change: 4.0 },
    ],
    average: 445, weeklyChange: 3.1,
    history: [
      { week: "W1 Mar", price: 415 }, { week: "W2 Mar", price: 420 },
      { week: "W3 Mar", price: 428 }, { week: "W4 Mar", price: 432 },
      { week: "W1 Apr", price: 438 }, { week: "W2 Apr", price: 441 },
      { week: "W3 Apr", price: 445 },
    ],
  },
  {
    crop: "Groundnuts (Shelled)", emoji: "🥜", unit: "25kg bag",
    markets: [
      { name: "Lusaka", price: 380, change: 2.5 },
      { name: "Ndola", price: 370, change: 1.8 },
      { name: "Kitwe", price: 375, change: 2.0 },
      { name: "Livingstone", price: 390, change: 3.2 },
      { name: "Chipata", price: 365, change: 0.5 },
    ],
    average: 376, weeklyChange: 2.0,
    history: [
      { week: "W1 Mar", price: 360 }, { week: "W2 Mar", price: 362 },
      { week: "W3 Mar", price: 365 }, { week: "W4 Mar", price: 368 },
      { week: "W1 Apr", price: 370 }, { week: "W2 Apr", price: 373 },
      { week: "W3 Apr", price: 376 },
    ],
  },
  {
    crop: "Soybeans", emoji: "🫘", unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 520, change: -1.2 },
      { name: "Ndola", price: 510, change: -0.8 },
      { name: "Kitwe", price: 515, change: -1.0 },
      { name: "Livingstone", price: 530, change: 0.5 },
      { name: "Chipata", price: 500, change: -2.0 },
    ],
    average: 515, weeklyChange: -0.9,
    history: [
      { week: "W1 Mar", price: 530 }, { week: "W2 Mar", price: 528 },
      { week: "W3 Mar", price: 525 }, { week: "W4 Mar", price: 522 },
      { week: "W1 Apr", price: 520 }, { week: "W2 Apr", price: 518 },
      { week: "W3 Apr", price: 515 },
    ],
  },
  {
    crop: "Sunflower Seeds", emoji: "🌻", unit: "25kg bag",
    markets: [
      { name: "Lusaka", price: 280, change: 4.5 },
      { name: "Ndola", price: 275, change: 3.8 },
      { name: "Kitwe", price: 278, change: 4.0 },
      { name: "Livingstone", price: 285, change: 5.0 },
      { name: "Chipata", price: 270, change: 3.2 },
    ],
    average: 278, weeklyChange: 4.1,
    history: [
      { week: "W1 Mar", price: 255 }, { week: "W2 Mar", price: 260 },
      { week: "W3 Mar", price: 265 }, { week: "W4 Mar", price: 268 },
      { week: "W1 Apr", price: 272 }, { week: "W2 Apr", price: 275 },
      { week: "W3 Apr", price: 278 },
    ],
  },
  {
    crop: "Cassava (Fresh)", emoji: "🥔", unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 150, change: 0.0 },
      { name: "Ndola", price: 145, change: -0.5 },
      { name: "Kitwe", price: 148, change: 0.2 },
      { name: "Livingstone", price: 155, change: 1.0 },
      { name: "Chipata", price: 140, change: -1.0 },
    ],
    average: 148, weeklyChange: 0.0,
    history: [
      { week: "W1 Mar", price: 148 }, { week: "W2 Mar", price: 147 },
      { week: "W3 Mar", price: 149 }, { week: "W4 Mar", price: 148 },
      { week: "W1 Apr", price: 149 }, { week: "W2 Apr", price: 148 },
      { week: "W3 Apr", price: 148 },
    ],
  },
  {
    crop: "Sorghum", emoji: "🌾", unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 320, change: 2.0 },
      { name: "Ndola", price: 310, change: 1.5 },
      { name: "Kitwe", price: 315, change: 1.8 },
      { name: "Livingstone", price: 325, change: 2.5 },
      { name: "Chipata", price: 305, change: 1.0 },
    ],
    average: 315, weeklyChange: 1.8,
    history: [
      { week: "W1 Mar", price: 300 }, { week: "W2 Mar", price: 303 },
      { week: "W3 Mar", price: 307 }, { week: "W4 Mar", price: 309 },
      { week: "W1 Apr", price: 311 }, { week: "W2 Apr", price: 313 },
      { week: "W3 Apr", price: 315 },
    ],
  },
]

const CHART_COLORS = [
  "oklch(0.45 0.12 145)", "oklch(0.75 0.14 80)", "oklch(0.55 0.22 25)",
  "oklch(0.65 0.15 100)", "oklch(0.50 0.10 220)", "oklch(0.60 0.14 145)",
]

function PricesContent() {
  const [selectedMarket, setSelectedMarket] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCrops, setSelectedCrops] = useState<string[]>(["White Maize", "Groundnuts (Shelled)", "Sunflower Seeds"])
  const [apiPrices, setApiPrices] = useState<typeof marketPrices | null>(null)
  const [alertPhone, setAlertPhone] = useState("")

  useEffect(() => {
    api.prices.list().then((data) => setApiPrices(data as typeof marketPrices)).catch(() => {})
  }, [])

  const prices = apiPrices ?? marketPrices
  const filtered = prices.filter((p) =>
    p.crop.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-primary" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-primary"
    if (change < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  const toggleCrop = (cropName: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropName) ? prev.filter((c) => c !== cropName) : [...prev, cropName]
    )
  }

  const chartData = marketPrices[0].history.map((h, i) => {
    const point: Record<string, string | number> = { week: h.week }
    selectedCrops.forEach((cropName) => {
      const crop = marketPrices.find((p) => p.crop === cropName)
      if (crop) point[cropName] = crop.history[i]?.price ?? 0
    })
    return point
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">📊 Live Market Prices</h1>
              <p className="text-white/80">Real-time commodity prices from 5 major Zambian markets</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-44 bg-white/10 border-white/20 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="lusaka">Lusaka</SelectItem>
                  <SelectItem value="ndola">Ndola</SelectItem>
                  <SelectItem value="kitwe">Kitwe</SelectItem>
                  <SelectItem value="livingstone">Livingstone</SelectItem>
                  <SelectItem value="chipata">Chipata</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-white/15 text-white border-white/20 gap-1.5 py-2 px-3">
                <RefreshCw className="w-3.5 h-3.5" />
                Updated today, 10:30 AM
              </Badge>
              <a href="/price-alerts">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-300 font-semibold text-sm rounded-xl hover:bg-white/90 transition-colors shadow-sm">
                  <Bell className="w-4 h-4" /> Set Alerts
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Market Insights */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-300">Top Gainer This Week</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌻</span>
                <div>
                  <p className="font-bold text-foreground text-lg">Sunflower Seeds</p>
                  <p className="text-emerald-300 font-bold text-xl">+4.1%</p>
                  <p className="text-muted-foreground text-xs">ZMW 278 avg · 25kg bag</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500/10 to-rose-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <p className="text-sm font-semibold text-red-300">Top Decliner This Week</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🫘</span>
                <div>
                  <p className="font-bold text-foreground text-lg">Soybeans</p>
                  <p className="text-red-500 font-bold text-xl">-0.9%</p>
                  <p className="text-muted-foreground text-xs">ZMW 515 avg · 50kg bag</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-300" />
                <p className="text-sm font-semibold text-blue-300">Most Traded Crop</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌽</span>
                <div>
                  <p className="font-bold text-foreground text-lg">White Maize</p>
                  <p className="text-blue-300 font-bold text-xl">+3.1%</p>
                  <p className="text-muted-foreground text-xs">ZMW 445 avg · Highest volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Trend Chart */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <CardTitle className="text-lg">7-Week Price Trends</CardTitle>
              <div className="flex flex-wrap gap-2">
                {marketPrices.map((p, i) => (
                  <button
                    key={p.crop}
                    onClick={() => toggleCrop(p.crop)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedCrops.includes(p.crop)
                        ? "text-white border-transparent shadow-sm"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                    }`}
                    style={selectedCrops.includes(p.crop) ? { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] } : {}}
                  >
                    {p.emoji} {p.crop.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 90)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `ZMW${v}`} domain={["auto", "auto"]} />
                <Tooltip formatter={(v: number, name: string) => [`ZMW ${v}`, name]} />
                <Legend />
                {selectedCrops.map((crop) => {
                  const idx = marketPrices.findIndex((p) => p.crop === crop)
                  return (
                    <Line
                      key={crop}
                      type="monotone"
                      dataKey={crop}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">How these prices work</p>
              <p className="text-sm text-muted-foreground">
                Prices are updated daily from verified traders in 5 major markets. Use them as guidance — actual prices may vary based on crop quality, quantity, and transport costs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Price Cards */}
        <div className="grid gap-5">
          {filtered.map((item) => (
            <Card key={item.crop} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{item.emoji}</span>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">{item.crop}</h3>
                      <p className="text-sm text-muted-foreground">per {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">National Average</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-foreground">ZMW {item.average}</p>
                      <Badge className={`gap-1 border-0 ${item.weeklyChange >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {getTrendIcon(item.weeklyChange)}
                        {item.weeklyChange > 0 ? "+" : ""}{item.weeklyChange}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last week</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {item.markets
                    .filter((m) => selectedMarket === "all" || m.name.toLowerCase() === selectedMarket)
                    .map((market) => (
                      <div
                        key={market.name}
                        className={`p-4 rounded-xl text-center border transition-all ${
                          selectedMarket === market.name.toLowerCase()
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "bg-muted/40 border-transparent"
                        }`}
                      >
                        <p className="text-sm text-muted-foreground font-medium mb-1">{market.name}</p>
                        <p className="text-xl font-bold text-foreground">ZMW {market.price}</p>
                        <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${getTrendColor(market.change)}`}>
                          {getTrendIcon(market.change)}
                          <span>{market.change > 0 ? "+" : ""}{market.change}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price Alert CTA */}
        <Card className="mt-10 border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-emerald-700 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-yellow-300" />
                  <h3 className="text-xl font-bold">Get SMS Price Alerts</h3>
                </div>
                <p className="text-white/80 max-w-md">
                  Never miss a good selling opportunity. Get SMS notifications when crop prices reach your target — straight to your Zambian phone number.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="+260 97X XXX XXX"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  className="bg-white/15 border-white/30 text-white placeholder:text-white/50 w-full sm:w-52 h-11"
                />
                <Button className="bg-white text-primary hover:bg-white/90 font-semibold h-11 px-6">
                  Set Alert
                </Button>
              </div>
            </div>
          </div>
        </Card>

      </main>
      <Footer />
    </div>
  )
}

export default function PricesPage() {
  return <PricesContent />
}
