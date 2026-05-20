import { useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { MapPin, ShoppingCart, CheckCircle2, Star, X, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ApiListing } from "@/lib/api"

type CropWithExtras = ApiListing & { verified?: boolean; rating?: number; reviews?: number; hot?: boolean }

interface MarketplaceMapProps {
  listings: CropWithExtras[]
}

// Approximate coordinates for major Zambian cities/districts
const ZAMBIA_CITY_COORDS: Record<string, [number, number]> = {
  lusaka: [-15.4167, 28.2833],
  ndola: [-12.9586, 28.6366],
  kitwe: [-12.8024, 28.2132],
  livingstone: [-17.8419, 25.8562],
  chipata: [-13.6469, 32.6449],
  kasama: [-10.2108, 31.1811],
  mansa: [-11.2003, 28.8904],
  mongu: [-15.2558, 23.1208],
  solwezi: [-12.1732, 26.3969],
  choma: [-16.8061, 26.9968],
  mkushi: [-13.6281, 29.3936],
  mazabuka: [-15.8600, 27.7600],
  chongwe: [-15.3329, 28.7073],
  samfya: [-11.3639, 29.5498],
  kabwe: [-14.4386, 28.4440],
  kapiri: [-13.9747, 28.6814],
  serenje: [-13.2300, 30.2300],
  petauke: [-14.2500, 31.3250],
  lundazi: [-12.2868, 33.1680],
  isoka: [-10.1524, 32.6386],
  mpika: [-11.8343, 31.4495],
  nakonde: [-9.3625, 32.7486],
  mbala: [-8.8394, 31.3769],
  luwingu: [-10.2700, 29.9100],
  nchelenge: [-9.3500, 28.7300],
  kawambwa: [-9.7875, 29.0789],
  mwense: [-10.3611, 28.7028],
  samfwa: [-11.3639, 29.5498],
  siavonga: [-16.5386, 28.7122],
  gwembe: [-16.5000, 27.5500],
  sinazongwe: [-17.2600, 27.4600],
  namwala: [-15.7411, 26.4369],
  kalomo: [-16.9694, 26.5000],
  zimba: [-17.2333, 26.9000],
  kazungula: [-17.7833, 25.2667],
  sesheke: [-17.4756, 24.3075],
  kaoma: [-14.7858, 24.7975],
  lukulu: [-14.3767, 23.2431],
  senanga: [-16.1197, 23.2706],
  shangombo: [-15.3333, 22.7333],
  mufumbwe: [-13.5461, 24.7903],
  kasempa: [-13.4644, 25.8392],
  mwinilunga: [-11.7383, 24.4311],
  zambezi: [-13.5361, 23.1078],
  chililabombwe: [-12.3626, 27.8299],
  chingola: [-12.5282, 27.8614],
  luanshya: [-13.1358, 28.4125],
  mufulira: [-12.5497, 28.2380],
  kalulushi: [-12.8378, 28.1003],
}

const CATEGORY_COLORS: Record<string, string> = {
  cereals: "#f59e0b",
  legumes: "#10b981",
  tubers: "#f97316",
  oilseeds: "#eab308",
  vegetables: "#22c55e",
  fruits: "#ef4444",
  livestock: "#8b5cf6",
  poultry: "#ec4899",
  cash_crops: "#6366f1",
  other: "#64748b",
}

const CATEGORY_EMOJI: Record<string, string> = {
  cereals: "🌽", legumes: "🫘", tubers: "🥔", oilseeds: "🌻",
  vegetables: "🥬", fruits: "🍎", livestock: "🐄", poultry: "🐔",
  cash_crops: "🌿", other: "🌾",
}

function getCoords(listing: CropWithExtras): [number, number] | null {
  // Use actual coordinates if stored
  if ((listing as any).latitude && (listing as any).longitude) {
    return [parseFloat((listing as any).latitude), parseFloat((listing as any).longitude)]
  }
  // Fall back to city lookup from location string
  const loc = listing.location.toLowerCase()
  for (const [city, coords] of Object.entries(ZAMBIA_CITY_COORDS)) {
    if (loc.includes(city)) {
      // Add a tiny random jitter so overlapping pins are visible
      const jitter = () => (Math.random() - 0.5) * 0.08
      return [coords[0] + jitter(), coords[1] + jitter()]
    }
  }
  return null
}

function createMarkerIcon(L: typeof import("leaflet"), color: string, emoji: string) {
  return L.divIcon({
    html: `
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${color};border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${emoji}</span>
      </div>
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  })
}

export function MarketplaceMap({ listings }: MarketplaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<import("leaflet").Marker[]>([])
  const [selectedListing, setSelectedListing] = useState<CropWithExtras | null>(null)
  const [mappedCount, setMappedCount] = useState(0)

  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    async function initMap() {
      const L = await import("leaflet")
      if (cancelled || !mapRef.current) return
      if (leafletMapRef.current) {
        // Map already exists — just update markers
        updateMarkers(L)
        return
      }

      const map = L.map(mapRef.current, {
        center: [-13.5, 28.5],
        zoom: 6,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      leafletMapRef.current = map
      updateMarkers(L)
    }

    function updateMarkers(L: typeof import("leaflet")) {
      const map = leafletMapRef.current
      if (!map) return

      // Clear old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      let count = 0
      listings.forEach((listing) => {
        const coords = getCoords(listing)
        if (!coords) return
        count++

        const color = CATEGORY_COLORS[listing.category] ?? "#64748b"
        const emoji = CATEGORY_EMOJI[listing.category] ?? "🌾"
        const icon = createMarkerIcon(L, color, emoji)

        const marker = L.marker(coords, { icon }).addTo(map)
        marker.on("click", () => setSelectedListing(listing))
        markersRef.current.push(marker)
      })
      setMappedCount(count)
    }

    initMap()
    return () => { cancelled = true }
  }, [listings])

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: "600px" }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Stats overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow text-sm font-medium">
          📍 {mappedCount} listings on map
        </div>
      </div>

      {/* Category legend */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Categories</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(CATEGORY_EMOJI)
              .filter(([k]) => k !== "other")
              .map(([key, emoji]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[key] }} />
                  <span>{emoji} {key.replace("_", " ")}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Listing popup panel */}
      {selectedListing && (
        <div className="absolute top-3 right-3 z-[1000] w-72 bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_EMOJI[selectedListing.category] ?? "🌾"}</span>
              <div>
                <h3 className="font-bold text-foreground text-sm leading-tight">{selectedListing.cropName}</h3>
                <p className="text-xs text-muted-foreground">{selectedListing.farmerName ?? "Farmer"}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedListing(null)}
              className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-4 pb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">K{parseFloat(selectedListing.price).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per {selectedListing.unit}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {(selectedListing as any).verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </Badge>
                )}
                {(selectedListing as any).rating && (
                  <div className="flex items-center gap-1 bg-yellow-50 rounded-lg px-2 py-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{(selectedListing as any).rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              {selectedListing.location}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedListing.quantity} {selectedListing.unit}s available
            </p>

            {selectedListing.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{selectedListing.description}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Link href={`/listing/${selectedListing.id}`} className="flex-1">
                <Button size="sm" className="w-full gap-1 h-9 text-xs bg-gradient-to-r from-primary to-emerald-600">
                  <ShoppingCart className="w-3 h-3" /> View & Order
                </Button>
              </Link>
              <Link href={`/farmer/${selectedListing.farmerId}`}>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
