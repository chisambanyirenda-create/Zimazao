import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye } from "lucide-react"

const LOCATIONS = [
  { name: "Lusaka", lat: -15.4166, lon: 28.2833 },
  { name: "Ndola", lat: -12.9587, lon: 28.6366 },
  { name: "Kitwe", lat: -12.8024, lon: 28.2132 },
  { name: "Livingstone", lat: -17.8616, lon: 25.8543 },
  { name: "Chipata", lat: -13.6428, lon: 32.6450 },
  { name: "Kasama", lat: -10.2144, lon: 31.1823 },
  { name: "Solwezi", lat: -12.1747, lon: 26.3969 },
  { name: "Mongu", lat: -15.2558, lon: 23.1203 },
]

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  weatherCode: number
  description: string
  icon: React.FC<{ className?: string }>
}

function getWeatherInfo(code: number): { description: string; icon: React.FC<{ className?: string }> } {
  if (code === 0) return { description: "Clear Sky", icon: Sun }
  if (code <= 3) return { description: "Partly Cloudy", icon: Cloud }
  if (code <= 49) return { description: "Foggy", icon: Cloud }
  if (code <= 67) return { description: "Rainy", icon: CloudRain }
  if (code <= 77) return { description: "Snow", icon: CloudSnow }
  if (code <= 82) return { description: "Rain Showers", icon: CloudRain }
  return { description: "Thunderstorm", icon: CloudRain }
}

function getFarmingAdvice(code: number, temp: number): { advice: string; color: string } {
  if (code >= 61) return { advice: "Good day for indoor tasks. Check your drainage channels.", color: "text-blue-500" }
  if (code >= 1 && code <= 3) return { advice: "Good conditions for field work. Monitor moisture levels.", color: "text-yellow-500" }
  if (temp > 30) return { advice: "Hot day — water crops early morning or evening.", color: "text-orange-500" }
  return { advice: "Excellent farming conditions today!", color: "text-primary" }
}

export function WeatherWidget() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&timezone=Africa%2FLusaka`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const c = data.current
        const { description, icon } = getWeatherInfo(c.weather_code)
        setWeather({
          temperature: Math.round(c.temperature_2m),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          precipitation: c.precipitation,
          weatherCode: c.weather_code,
          description,
          icon,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedLocation])

  const advice = weather ? getFarmingAdvice(weather.weatherCode, weather.temperature) : null

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-br from-blue-500/10 via-primary/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              🌤️ Farming Weather
            </CardTitle>
            <Select
              value={selectedLocation.name}
              onValueChange={(v) => setSelectedLocation(LOCATIONS.find((l) => l.name === v)!)}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <weather.icon className="w-12 h-12 text-yellow-400" />
                  <div>
                    <p className="text-4xl font-bold text-foreground">{weather.temperature}°C</p>
                    <p className="text-muted-foreground text-sm">{weather.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Wind className="w-3.5 h-3.5 text-gray-400" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>{weather.precipitation}mm</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span>Feels {weather.temperature - 2}°</span>
                  </div>
                </div>
              </div>
              {advice && (
                <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                  <Eye className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <p className={`text-sm font-medium ${advice.color}`}>{advice.advice}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">Weather unavailable</p>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
