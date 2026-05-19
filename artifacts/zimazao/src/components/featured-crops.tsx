import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ArrowRight } from "lucide-react"
import { Link } from "wouter"

const featuredCrops = [
  {
    id: 1,
    name: "White Maize",
    farmer: "John Mwansa",
    location: "Choma, Southern",
    price: 450,
    unit: "50kg bag",
    rating: 4.8,
    reviews: 23,
    quantity: "500 bags",
    image: "🌽",
    verified: true,
  },
  {
    id: 2,
    name: "Groundnuts (Shelled)",
    farmer: "Mary Banda",
    location: "Chipata, Eastern",
    price: 380,
    unit: "25kg bag",
    rating: 4.9,
    reviews: 45,
    quantity: "200 bags",
    image: "🥜",
    verified: true,
  },
  {
    id: 3,
    name: "Soybeans",
    farmer: "Peter Phiri",
    location: "Mkushi, Central",
    price: 520,
    unit: "50kg bag",
    rating: 4.7,
    reviews: 18,
    quantity: "300 bags",
    image: "🫘",
    verified: true,
  },
  {
    id: 4,
    name: "Sunflower Seeds",
    farmer: "Grace Tembo",
    location: "Mazabuka, Southern",
    price: 280,
    unit: "25kg bag",
    rating: 4.6,
    reviews: 12,
    quantity: "150 bags",
    image: "🌻",
    verified: false,
  },
]

export function FeaturedCrops() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Crops
            </h2>
            <p className="text-muted-foreground">
              Fresh produce from verified farmers across Zambia
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2">
              View All Crops <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map((crop) => (
            <Card key={crop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="bg-muted h-40 flex items-center justify-center relative">
                  <span className="text-7xl">{crop.image}</span>
                  {crop.verified && (
                    <Badge className="absolute top-3 right-3 bg-primary">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-foreground mb-1">{crop.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">by {crop.farmer}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  {crop.location}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">K{crop.price}</p>
                    <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-medium">{crop.rating}</span>
                    <span className="text-muted-foreground text-sm">({crop.reviews})</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
