

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, RefreshCw, Info } from "lucide-react"

const marketPrices = [
  {
    crop: "White Maize",
    emoji: "🌽",
    unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 450, change: 5.2 },
      { name: "Ndola", price: 440, change: 3.1 },
      { name: "Kitwe", price: 445, change: 2.8 },
      { name: "Livingstone", price: 460, change: -1.5 },
      { name: "Chipata", price: 430, change: 4.0 },
    ],
    average: 445,
    weeklyChange: 3.1,
  },
  {
    crop: "Groundnuts (Shelled)",
    emoji: "🥜",
    unit: "25kg bag",
    markets: [
      { name: "Lusaka", price: 380, change: 2.5 },
      { name: "Ndola", price: 370, change: 1.8 },
      { name: "Kitwe", price: 375, change: 2.0 },
      { name: "Livingstone", price: 390, change: 3.2 },
      { name: "Chipata", price: 365, change: 0.5 },
    ],
    average: 376,
    weeklyChange: 2.0,
  },
  {
    crop: "Soybeans",
    emoji: "🫘",
    unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 520, change: -1.2 },
      { name: "Ndola", price: 510, change: -0.8 },
      { name: "Kitwe", price: 515, change: -1.0 },
      { name: "Livingstone", price: 530, change: 0.5 },
      { name: "Chipata", price: 500, change: -2.0 },
    ],
    average: 515,
    weeklyChange: -0.9,
  },
  {
    crop: "Sunflower Seeds",
    emoji: "🌻",
    unit: "25kg bag",
    markets: [
      { name: "Lusaka", price: 280, change: 4.5 },
      { name: "Ndola", price: 275, change: 3.8 },
      { name: "Kitwe", price: 278, change: 4.0 },
      { name: "Livingstone", price: 285, change: 5.0 },
      { name: "Chipata", price: 270, change: 3.2 },
    ],
    average: 278,
    weeklyChange: 4.1,
  },
  {
    crop: "Cassava (Fresh)",
    emoji: "🥔",
    unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 150, change: 0.0 },
      { name: "Ndola", price: 145, change: -0.5 },
      { name: "Kitwe", price: 148, change: 0.2 },
      { name: "Livingstone", price: 155, change: 1.0 },
      { name: "Chipata", price: 140, change: -1.0 },
    ],
    average: 148,
    weeklyChange: 0.0,
  },
  {
    crop: "Sorghum",
    emoji: "🌾",
    unit: "50kg bag",
    markets: [
      { name: "Lusaka", price: 320, change: 2.0 },
      { name: "Ndola", price: 310, change: 1.5 },
      { name: "Kitwe", price: 315, change: 1.8 },
      { name: "Livingstone", price: 325, change: 2.5 },
      { name: "Chipata", price: 305, change: 1.0 },
    ],
    average: 315,
    weeklyChange: 1.8,
  },
]

function PricesContent() {
  const [selectedMarket, setSelectedMarket] = useState("all")

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Live Market Prices
            </h1>
            <p className="text-muted-foreground">
              Real-time commodity prices from major markets across Zambia
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select market" />
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
            <Badge variant="outline" className="gap-2 py-2">
              <RefreshCw className="w-3 h-3" />
              Updated: Today, 10:30 AM
            </Badge>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Price Information</p>
              <p className="text-sm text-muted-foreground">
                Prices are updated daily from verified sources in major markets. Use these prices as a guide when negotiating with buyers. Actual prices may vary based on quality, quantity, and location.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Price Cards */}
        <div className="grid gap-6">
          {marketPrices.map((item) => (
            <Card key={item.crop} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{item.emoji}</span>
                    <div>
                      <CardTitle className="text-xl">{item.crop}</CardTitle>
                      <p className="text-sm text-muted-foreground">per {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">National Average</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-foreground">K{item.average}</p>
                      <Badge className={`${item.weeklyChange >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {getTrendIcon(item.weeklyChange)}
                        <span className="ml-1">
                          {item.weeklyChange > 0 ? "+" : ""}
                          {item.weeklyChange}%
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last week</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {item.markets.map((market) => (
                    <div
                      key={market.name}
                      className="p-4 bg-muted/50 rounded-xl text-center"
                    >
                      <p className="text-sm text-muted-foreground mb-1">{market.name}</p>
                      <p className="text-xl font-bold text-foreground">K{market.price}</p>
                      <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(market.change)}`}>
                        {getTrendIcon(market.change)}
                        <span>
                          {market.change > 0 ? "+" : ""}
                          {market.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Insights */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Gainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌻</span>
                <div>
                  <p className="font-semibold text-foreground">Sunflower Seeds</p>
                  <p className="text-primary font-bold">+4.1% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Top Decliner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🫘</span>
                <div>
                  <p className="font-semibold text-foreground">Soybeans</p>
                  <p className="text-destructive font-bold">-0.9% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 Most Traded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌽</span>
                <div>
                  <p className="font-semibold text-foreground">White Maize</p>
                  <p className="text-muted-foreground">Highest volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Alerts CTA */}
        <Card className="mt-8 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Get Price Alerts</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              Never miss a good selling opportunity. Set up price alerts and get notified when prices reach your target.
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function PricesPage() {
  return (
    <PricesContent />
  )
}
