import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Sun, CloudRain, Wind } from "lucide-react"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface Crop {
  name: string
  emoji: string
  category: string
  plant: number[] // 0-indexed month ranges
  harvest: number[]
  provinces: string[]
  tip: string
}

const CROPS: Crop[] = [
  {
    name: "White Maize", emoji: "🌽", category: "Cereals",
    plant: [10, 11], harvest: [3, 4, 5],
    provinces: ["All provinces"],
    tip: "Plant after first rains. Needs 500–800mm of rainfall. Harvest when husks are dry.",
  },
  {
    name: "Groundnuts", emoji: "🥜", category: "Legumes",
    plant: [10, 11], harvest: [3, 4],
    provinces: ["Eastern", "Southern", "Central"],
    tip: "Well-drained sandy loam soil is best. Rotate with maize to fix nitrogen.",
  },
  {
    name: "Soybeans", emoji: "🫘", category: "Legumes",
    plant: [10, 11], harvest: [3, 4],
    provinces: ["Central", "Copperbelt", "Eastern"],
    tip: "High-value export crop. Inoculate seed with rhizobium for best yields.",
  },
  {
    name: "Sunflower", emoji: "🌻", category: "Oilseeds",
    plant: [10, 11, 0], harvest: [3, 4, 5],
    provinces: ["Central", "Eastern", "Southern"],
    tip: "Drought-tolerant. Plant in rows to ease mechanical harvesting.",
  },
  {
    name: "Cotton", emoji: "🌿", category: "Cash Crops",
    plant: [10, 11], harvest: [4, 5, 6],
    provinces: ["Eastern", "Southern", "Luapula"],
    tip: "High value cash crop. Plant on well-drained soils, avoid waterlogging.",
  },
  {
    name: "Cassava", emoji: "🥔", category: "Tubers",
    plant: [10, 11, 0], harvest: [11, 0, 1, 2],
    provinces: ["Luapula", "Northern", "Muchinga", "Western"],
    tip: "Drought-resistant staple. Matures in 12–18 months. Can be left in ground as storage.",
  },
  {
    name: "Sweet Potatoes", emoji: "🍠", category: "Tubers",
    plant: [8, 9, 10], harvest: [0, 1, 2],
    provinces: ["Southern", "Eastern", "Central"],
    tip: "Thrives in warm weather. Plant vines, not seeds. Harvest before heavy rains.",
  },
  {
    name: "Sorghum", emoji: "🌾", category: "Cereals",
    plant: [10, 11], harvest: [3, 4, 5],
    provinces: ["Southern", "Western", "Eastern"],
    tip: "More drought-tolerant than maize. Ideal for low-rainfall areas.",
  },
  {
    name: "Wheat", emoji: "🌾", category: "Cereals",
    plant: [4, 5], harvest: [8, 9],
    provinces: ["Southern", "Central"],
    tip: "Winter/dry-season crop. Requires irrigation. High demand for bread flour in Zambia.",
  },
  {
    name: "Beans (Sugar)", emoji: "🫘", category: "Legumes",
    plant: [10, 11], harvest: [2, 3],
    provinces: ["Eastern", "Northern", "Muchinga"],
    tip: "Popular in Eastern Province. Short-season crop, good for intercropping with maize.",
  },
]

const SEASONS = [
  { label: "Rainy Season", months: [10, 11, 0, 1, 2, 3], color: "bg-blue-100 text-blue-700", icon: CloudRain },
  { label: "Cool Dry", months: [4, 5, 6, 7], color: "bg-slate-100 text-slate-600", icon: Wind },
  { label: "Hot Dry", months: [8, 9], color: "bg-orange-100 text-orange-700", icon: Sun },
]

function getSeasonForMonth(m: number) {
  return SEASONS.find((s) => s.months.includes(m)) ?? SEASONS[1]
}

export default function CropCalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Zambia Crop Calendar
          </h1>
          <p className="text-muted-foreground text-lg">
            Best planting and harvesting times for major crops across all Zambian provinces
          </p>
        </div>

        {/* Season Legend */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {SEASONS.map((s) => (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.months.map((m) => MONTHS[m]).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Grid */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Planting & Harvest Calendar</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 w-36 font-semibold text-sm">Crop</th>
                  {MONTHS.map((m, i) => {
                    const season = getSeasonForMonth(i)
                    return (
                      <th key={m} className={`text-center py-2 px-1 text-xs font-medium w-12 ${season.color} first:rounded-tl-lg last:rounded-tr-lg`}>
                        {m}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {CROPS.map((crop, ci) => (
                  <tr key={crop.name} className={ci % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-2 px-3 text-sm font-medium whitespace-nowrap">
                      {crop.emoji} {crop.name}
                    </td>
                    {MONTHS.map((_, mi) => {
                      const isPlant = crop.plant.includes(mi)
                      const isHarvest = crop.harvest.includes(mi)
                      return (
                        <td key={mi} className="text-center py-1 px-0.5">
                          {isPlant && (
                            <div className="mx-auto w-7 h-7 bg-primary rounded-md flex items-center justify-center" title="Plant">
                              <span className="text-xs text-primary-foreground font-bold">P</span>
                            </div>
                          )}
                          {isHarvest && (
                            <div className="mx-auto w-7 h-7 bg-accent rounded-md flex items-center justify-center" title="Harvest">
                              <span className="text-xs text-accent-foreground font-bold">H</span>
                            </div>
                          )}
                          {!isPlant && !isHarvest && (
                            <div className="mx-auto w-7 h-7 rounded-md" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-bold">P</span>
                </div>
                Plant
              </span>
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                  <span className="text-xs text-accent-foreground font-bold">H</span>
                </div>
                Harvest
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Crop Cards */}
        <h2 className="text-xl font-bold mb-4">Crop Growing Guides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CROPS.map((crop) => (
            <Card key={crop.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{crop.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{crop.name}</h3>
                    <Badge variant="secondary" className="text-xs">{crop.category}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <p className="text-primary font-medium mb-0.5">🌱 Plant</p>
                    <p className="text-foreground">{crop.plant.map((m) => MONTHS[m]).join(", ")}</p>
                  </div>
                  <div className="bg-accent/20 rounded-lg p-2">
                    <p className="text-accent-foreground font-medium mb-0.5">🌾 Harvest</p>
                    <p className="text-foreground">{crop.harvest.map((m) => MONTHS[m]).join(", ")}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{crop.tip}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {crop.provinces.map((p) => (
                    <span key={p} className="text-xs bg-muted px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
