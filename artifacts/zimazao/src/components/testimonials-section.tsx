import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "John Mwansa",
    role: "Maize Farmer",
    location: "Choma, Southern Province",
    avatar: "👨🏾‍🌾",
    rating: 5,
    text: "Zimazao changed my life. I used to sell to middlemen at very low prices. Now I sell directly to buyers in Lusaka and make 40% more profit every season. My family's income has doubled!",
    crop: "White Maize",
    income: "+40% income",
  },
  {
    name: "Grace Tembo",
    role: "Groundnut Farmer",
    location: "Chipata, Eastern Province",
    avatar: "👩🏾‍🌾",
    rating: 5,
    text: "The disease detector saved my entire groundnut harvest. I spotted early blight within minutes and got treatment advice immediately. I lost almost nothing compared to my neighbors.",
    crop: "Groundnuts",
    income: "Harvest saved",
  },
  {
    name: "Peter Phiri",
    role: "Soybean & Maize Farmer",
    location: "Mkushi, Central Province",
    avatar: "👨🏿‍🌾",
    rating: 5,
    text: "Checking market prices before harvesting helps me know when to sell. Last season I waited two weeks and got ZMW 520 per bag instead of ZMW 480. That is a big difference across 300 bags!",
    crop: "Soybeans",
    income: "ZMW 12,000 extra",
  },
  {
    name: "Mary Banda",
    role: "Vegetable Farmer",
    location: "Kabwe, Central Province",
    avatar: "👩🏽‍🌾",
    rating: 5,
    text: "As a young farmer, I was worried nobody would trust me. But with my verified badge, buyers come to me. I sold all 200 bags within 3 days of listing. Zimazao is incredible!",
    crop: "Mixed Vegetables",
    income: "200 bags in 3 days",
  },
  {
    name: "James Mumba",
    role: "Cassava Farmer",
    location: "Mansa, Luapula Province",
    avatar: "👨🏾‍🌾",
    rating: 5,
    text: "I live far from the city but Zimazao connects me to buyers everywhere in Zambia. I no longer worry about transport or finding markets. Everything comes to me now.",
    crop: "Cassava",
    income: "3x more buyers",
  },
  {
    name: "Ruth Chanda",
    role: "Sunflower Farmer",
    location: "Kasama, Northern Province",
    avatar: "👩🏿‍🌾",
    rating: 5,
    text: "The crop calendar reminded me exactly when to plant and fertilize. My yield went from 800kg per hectare to 1,200kg. Zimazao is not just a marketplace, it is a farming partner.",
    crop: "Sunflower",
    income: "+50% yield",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            Farmer Stories
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Real Farmers. Real Results.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Over 10,000 farmers across all 10 provinces of Zambia are growing their income with Zimazao.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground/80 mb-6 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 mb-1 justify-end">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs font-bold text-primary">
                      {t.income}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
