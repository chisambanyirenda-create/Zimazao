import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { api, type ApiOrderDetail } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { X, MapPin, Loader2, Navigation, Wifi, WifiOff, AlertCircle, Truck, User } from "lucide-react"
import { Button } from "@/components/ui/button"

// Fix Leaflet's default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const FARMER_ICON = L.divIcon({
  html: `<div style="background:#16a34a;border:3px solid white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-size:18px;">🚜</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
})

const BUYER_ICON = L.divIcon({
  html: `<div style="background:#2563eb;border:3px solid white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-size:18px;">📦</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
})

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
    } else if (positions.length === 1) {
      map.setView(positions[0], 13)
    }
  }, [positions.map((p) => p.join(",")).join("|")])
  return null
}

interface LocationData {
  lat: number
  lng: number
  updatedAt: number
}

interface Props {
  order: ApiOrderDetail
  onClose: () => void
}

export function LiveTrackingModal({ order, onClose }: Props) {
  const { user } = useAuth()
  const [myLoc, setMyLoc] = useState<GeolocationCoordinates | null>(null)
  const [otherLoc, setOtherLoc] = useState<LocationData | null>(null)
  const [otherIsOnline, setOtherIsOnline] = useState(false)
  const [geoError, setGeoError] = useState("")
  const [sharing, setSharing] = useState(false)
  const [lastPoll, setLastPoll] = useState<Date | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isFarmer = user?.userType === "farmer"
  const myRole = isFarmer ? "farmer" : "buyer"
  const otherRole = isFarmer ? "buyer" : "farmer"
  const otherName = isFarmer ? order.buyerName : order.farmerName

  // Upload my location to API
  const uploadLocation = useCallback(async (coords: GeolocationCoordinates) => {
    try {
      await api.orders.updateLocation(order.id, coords.latitude, coords.longitude)
    } catch {}
  }, [order.id])

  // Poll other person's location
  const pollOtherLocation = useCallback(async () => {
    try {
      const data = await api.orders.getLocations(order.id)
      const loc: LocationData | undefined = (data as any)[otherRole]
      if (loc) {
        setOtherLoc(loc)
        setOtherIsOnline(Date.now() - loc.updatedAt < 30_000)
      } else {
        setOtherIsOnline(false)
      }
      setLastPoll(new Date())
    } catch {}
  }, [order.id, otherRole])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location sharing.")
      return
    }

    setGeoError("")
    setSharing(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLoc(pos.coords)
        uploadLocation(pos.coords)
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? "Location access denied. Please allow location in your browser."
            : "Could not get your location. Make sure GPS is on."
        )
        setSharing(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    // Upload every 8 seconds even if position didn't change
    uploadTimerRef.current = setInterval(() => {
      if (myLoc) uploadLocation(myLoc)
    }, 8000)

    // Poll other's location every 5 seconds
    pollTimerRef.current = setInterval(pollOtherLocation, 5000)
    pollOtherLocation()
  }, [uploadLocation, pollOtherLocation, myLoc])

  useEffect(() => {
    startTracking()
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

  const myPos: [number, number] | null = myLoc ? [myLoc.latitude, myLoc.longitude] : null
  const otherPos: [number, number] | null = otherLoc ? [otherLoc.lat, otherLoc.lng] : null

  const allPos: [number, number][] = [myPos, otherPos].filter(Boolean) as [number, number][]
  const defaultCenter: [number, number] = [-15.4167, 28.2833] // Lusaka, Zambia

  const distance = myPos && otherPos
    ? getDistanceKm(myPos[0], myPos[1], otherPos[0], otherPos[1])
    : null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-emerald-700 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Live Tracking</p>
            <p className="text-white/75 text-xs mt-0.5">Order #{order.id} · {order.cropName}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border shrink-0 overflow-x-auto">
        {/* My status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sharing && myLoc ? "bg-green-500/20 text-green-300" : "bg-muted text-muted-foreground"}`}>
          <div className={`w-2 h-2 rounded-full ${sharing && myLoc ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
          {isFarmer ? "🚜" : "📦"} You ({sharing && myLoc ? "Live" : "Starting…"})
        </div>

        {/* Other's status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${otherIsOnline ? "bg-blue-500/20 text-blue-300" : "bg-muted text-muted-foreground"}`}>
          <div className={`w-2 h-2 rounded-full ${otherIsOnline ? "bg-blue-500 animate-pulse" : "bg-muted-foreground"}`} />
          {isFarmer ? "📦" : "🚜"} {otherName?.split(" ")[0] ?? otherRole} ({otherIsOnline ? "Live" : "Waiting…"})
        </div>

        {distance !== null && (
          <div className="flex items-center gap-1 text-xs font-semibold text-orange-300 bg-orange-500/15 px-2.5 py-1 rounded-full ml-auto shrink-0">
            <MapPin className="w-3 h-3" />
            {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {geoError && (
          <div className="absolute top-3 left-3 right-3 z-[1000] bg-destructive/90 text-white text-xs p-3 rounded-xl flex items-start gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{geoError}</span>
          </div>
        )}

        {!myLoc && !geoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Getting your location…</p>
              <p className="text-xs text-muted-foreground mt-1">Please allow location access</p>
            </div>
          </div>
        )}

        <MapContainer
          center={allPos[0] ?? defaultCenter}
          zoom={12}
          className="w-full h-full"
          style={{ height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <FitBounds positions={allPos} />

          {myPos && (
            <Marker position={myPos} icon={isFarmer ? FARMER_ICON : BUYER_ICON}>
              <Popup>
                <div className="text-sm font-semibold">{isFarmer ? "🚜" : "📦"} You (live)</div>
              </Popup>
            </Marker>
          )}

          {otherPos && (
            <Marker position={otherPos} icon={isFarmer ? BUYER_ICON : FARMER_ICON}>
              <Popup>
                <div className="text-sm font-semibold">
                  {isFarmer ? "📦" : "🚜"} {otherName ?? otherRole}
                  {otherLoc && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Updated {Math.round((Date.now() - otherLoc.updatedAt) / 1000)}s ago
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {myPos && otherPos && (
            <Polyline
              positions={[myPos, otherPos]}
              pathOptions={{ color: "#16a34a", weight: 3, dashArray: "8 6", opacity: 0.7 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-card border-t border-border shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {lastPoll ? (
              <><Wifi className="w-3.5 h-3.5 text-green-500" /> Last updated {lastPoll.toLocaleTimeString()}</>
            ) : (
              <><WifiOff className="w-3.5 h-3.5" /> Connecting…</>
            )}
          </div>
          {!sharing && !geoError && (
            <Button size="sm" onClick={startTracking} className="gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Share My Location
            </Button>
          )}
          {geoError && (
            <Button size="sm" variant="outline" onClick={startTracking} className="gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
