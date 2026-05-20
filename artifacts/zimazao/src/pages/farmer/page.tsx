import { useState, useEffect } from "react"
import { useParams, Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { api, type ApiFarmerProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin, Phone, User, Package, ArrowLeft, Loader2, AlertCircle, CalendarDays
} from "lucide-react"

const CROP_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", other: "🌿",
}

export default function FarmerProfilePage() {
  const params = useParams<{ id: string }>()
  const farmerId = parseInt(params.id ?? "", 10)
  const [farmer, setFarmer] = useState<ApiFarmerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isNaN(farmerId)) { setError(true); setLoading(false); return }
    api.farmers.get(farmerId)
      .then(setFarmer)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [farmerId])

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
      <Footer />
    </div>
  )

  if (error || !farmer) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Farmer not found</h2>
        <Link href="/marketplace"><Button>Back to Marketplace</Button></Link>
      </div>
      <Footer />
    </div>
  )

  const whatsappUrl = farmer.phone
    ? `https://wa.me/${farmer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${farmer.name}, I found your profile on Zimazao and I'd like to buy some crops.`)}`
    : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Farmer Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{farmer.name}</h1>
                {farmer.location && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{farmer.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground text-sm mt-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>Member since {new Date(farmer.createdAt).getFullYear()}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 text-center">
                    <p className="text-2xl font-bold text-primary">{farmer.totalListings}</p>
                    <p className="text-xs text-muted-foreground">Active Listings</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
                      <Phone className="w-4 h-4" /> Contact on WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farmer's Listings */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Listings by {farmer.name}
        </h2>

        {farmer.listings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active listings at the moment</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmer.listings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.cropName} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <span className="text-6xl">{CROP_EMOJI[listing.category] ?? "🌿"}</span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{listing.cropName}</h3>
                        <Badge variant="secondary" className="text-xs capitalize mt-1">{listing.category}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">K{parseFloat(listing.price).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">/{listing.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <MapPin className="w-3 h-3" />{listing.location}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
