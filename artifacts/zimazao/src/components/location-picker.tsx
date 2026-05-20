import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LocationPickerProps {
  latitude?: number | null
  longitude?: number | null
  locationText?: string
  onLocationChange: (lat: number, lng: number, address: string) => void
}

// Lazy-load leaflet to avoid SSR issues
let L: typeof import("leaflet") | null = null

async function getLeaflet() {
  if (!L) {
    L = await import("leaflet")
    // Fix default icon paths
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }
  return L
}

const ZAMBIA_BOUNDS = {
  center: [-13.133897, 27.849332] as [number, number],
  zoom: 6,
}

export function LocationPicker({ latitude, longitude, locationText, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import("leaflet").Map | null>(null)
  const markerRef = useRef<import("leaflet").Marker | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [displayAddr, setDisplayAddr] = useState(locationText || "")

  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    getLeaflet().then((Leaflet) => {
      if (cancelled || !mapRef.current) return
      if (leafletMapRef.current) return

      const map = Leaflet.map(mapRef.current, {
        center: latitude && longitude
          ? [latitude, longitude]
          : ZAMBIA_BOUNDS.center,
        zoom: latitude && longitude ? 12 : ZAMBIA_BOUNDS.zoom,
        zoomControl: true,
      })

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      leafletMapRef.current = map

      if (latitude && longitude) {
        const marker = Leaflet.marker([latitude, longitude], { draggable: true }).addTo(map)
        markerRef.current = marker
        marker.on("dragend", () => {
          const pos = marker.getLatLng()
          reverseGeocode(pos.lat, pos.lng)
        })
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng
        placeMarker(Leaflet, lat, lng)
        reverseGeocode(lat, lng)
      })
    })

    return () => { cancelled = true }
  }, [])

  function placeMarker(Leaflet: typeof import("leaflet"), lat: number, lng: number) {
    if (!leafletMapRef.current) return
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      const marker = Leaflet.marker([lat, lng], { draggable: true }).addTo(leafletMapRef.current)
      markerRef.current = marker
      marker.on("dragend", () => {
        const pos = marker.getLatLng()
        reverseGeocode(pos.lat, pos.lng)
      })
    }
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      const parts = []
      if (data.address?.town) parts.push(data.address.town)
      else if (data.address?.city) parts.push(data.address.city)
      else if (data.address?.village) parts.push(data.address.village)
      if (data.address?.state) parts.push(data.address.state)
      const address = parts.length ? parts.join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setDisplayAddr(address)
      onLocationChange(lat, lng, address)
    } catch {
      const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setDisplayAddr(address)
      onLocationChange(lat, lng, address)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !leafletMapRef.current) return
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Zambia")}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        const Leaflet = await getLeaflet()
        leafletMapRef.current.setView([parseFloat(lat), parseFloat(lon)], 13)
        placeMarker(Leaflet, parseFloat(lat), parseFloat(lon))
        reverseGeocode(parseFloat(lat), parseFloat(lon))
      }
    } catch { /* ignore */ }
    finally { setIsSearching(false) }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      const Leaflet = await getLeaflet()
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 13)
        placeMarker(Leaflet, lat, lng)
        reverseGeocode(lat, lng)
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search city, district or village..."
            className="pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleSearch} disabled={isSearching} size="icon">
          <Search className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" onClick={useMyLocation} size="icon" title="Use my location">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} style={{ height: "300px", width: "100%" }} />
        <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none">
          {displayAddr && (
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow text-sm max-w-full">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-foreground truncate font-medium">{displayAddr}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Click on the map or drag the pin to set your exact location
      </p>
    </div>
  )
}
