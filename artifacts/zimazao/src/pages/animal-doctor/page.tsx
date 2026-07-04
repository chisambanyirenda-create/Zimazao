import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import {
  Camera, Upload, AlertTriangle, CheckCircle, Loader2, X, Info, ArrowRight,
  Crown, Phone, Stethoscope, Syringe, Heart, Clock, Zap, AlertCircle, ShieldAlert,
} from "lucide-react"
import { api, type ApiLivestockScanResult } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const URGENCY_CONFIG = {
  routine: { label: "Routine", color: "bg-green-500/20 text-green-200 border-green-500/25", icon: Clock },
  soon: { label: "See Vet Soon", color: "bg-yellow-500/20 text-yellow-200 border-yellow-500/25", icon: AlertCircle },
  urgent: { label: "Urgent", color: "bg-orange-500/20 text-orange-200 border-orange-500/25", icon: AlertTriangle },
  emergency: { label: "EMERGENCY", color: "bg-red-500/20 text-red-200 border-red-500/25", icon: ShieldAlert },
}

const ANIMAL_TYPES = [
  { emoji: "🐄", name: "Cattle", desc: "Cows, bulls, oxen" },
  { emoji: "🐐", name: "Goats", desc: "All breeds" },
  { emoji: "🐖", name: "Pigs", desc: "Swine" },
  { emoji: "🐔", name: "Poultry", desc: "Chickens, ducks, turkeys" },
  { emoji: "🐑", name: "Sheep", desc: "All breeds" },
  { emoji: "🐇", name: "Rabbits", desc: "All breeds" },
]

function AnimalDoctorContent() {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<ApiLivestockScanResult | null>(null)
  const [error, setError] = useState<{ code?: string; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setDiagnosis(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return
    setIsAnalyzing(true)
    setError(null)
    try {
      const result = await api.livestock.scan(selectedImage)
      setDiagnosis(result)
    } catch (err: any) {
      setError({ code: err?.code, message: err.message || "Analysis failed" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setDiagnosis(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const urgencyConfig = diagnosis ? (URGENCY_CONFIG[diagnosis.urgency] ?? URGENCY_CONFIG.routine) : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Animal Doctor</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your sick livestock and our AI vet will diagnose the condition, recommend treatment, and advise when to call a real vet.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="outline" className="text-amber-300 border-amber-300 bg-amber-500/15">
              <Zap className="w-3 h-3 mr-1" /> AI-Powered
            </Badge>
            <Badge variant="outline" className="text-green-300 border-green-300 bg-green-500/15">
              <Heart className="w-3 h-3 mr-1" /> Livestock Health
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-300" />
                Upload Animal Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/25 rounded-xl p-12 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-500/15/50 transition-all"
                >
                  <Upload className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WEBP (max. 10MB)</p>
                  <p className="text-xs text-muted-foreground mt-2">Works best with clear photos of the affected area</p>
                </div>
              ) : (
                <div className="relative">
                  <img src={selectedImage} alt="Selected animal" className="w-full h-64 object-cover rounded-xl" />
                  <button onClick={clearImage} className="absolute top-3 right-3 w-8 h-8 bg-foreground/80 rounded-full flex items-center justify-center text-background hover:bg-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedImage && !diagnosis && !error && (
                <Button onClick={analyzeImage} disabled={isAnalyzing} className="w-full mt-4 h-12 bg-amber-600 hover:bg-amber-700">
                  {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Diagnosing...</> : <><Stethoscope className="w-5 h-5 mr-2" />Diagnose Animal</>}
                </Button>
              )}

              {error && (
                <div className="mt-4">
                  {error.code === "SCAN_LIMIT_REACHED" ? (
                    <div className="p-4 bg-amber-500/15 border border-amber-500/25 rounded-xl text-center">
                      <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="font-semibold text-amber-200 mb-1">Monthly scan limit reached</p>
                      <p className="text-sm text-amber-300 mb-3">Free plan allows 5 scans/month. Upgrade to Pro for unlimited scans.</p>
                      <Link href="/subscription">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                          <Crown className="w-4 h-4" /> Upgrade to Pro — ZMW 80/month
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/15 border border-red-500/25 rounded-xl text-center">
                      <p className="font-semibold text-red-300">Analysis failed</p>
                      <p className="text-sm text-red-300 mt-1">{error.message}</p>
                      <Button onClick={analyzeImage} variant="outline" className="mt-3">Try Again</Button>
                    </div>
                  )}
                </div>
              )}

              {diagnosis && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearImage}>Upload New Photo</Button>
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => window.print()}>Save Report</Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-500/15 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Tips for best results</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Take clear photos in good daylight</li>
                      <li>• Show the affected area clearly</li>
                      <li>• Include the animal's face if possible</li>
                      <li>• Multiple angles help with diagnosis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            {isAnalyzing && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-amber-300 animate-spin" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Diagnosing your animal...</p>
                  <p className="text-muted-foreground">Our AI vet is examining the image for signs of disease</p>
                </CardContent>
              </Card>
            )}

            {diagnosis && urgencyConfig && (
              <div className="space-y-6">
                <Card className={`border-2 ${diagnosis.urgency === "emergency" ? "border-red-300" : diagnosis.urgency === "urgent" ? "border-orange-300" : "border-amber-500/25"}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{diagnosis.condition}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{diagnosis.animalType} · {diagnosis.confidence}% confidence</p>
                        </div>
                      </div>
                      <Badge className={`${urgencyConfig.color} border text-sm shrink-0`}>
                        <urgencyConfig.icon className="w-3.5 h-3.5 mr-1" />{urgencyConfig.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{diagnosis.description}</p>
                    {diagnosis.urgency === "emergency" && (
                      <div className="mt-4 p-3 bg-red-500/15 border border-red-500/25 rounded-lg">
                        <p className="text-red-300 font-semibold text-sm flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> EMERGENCY — Call a vet immediately!
                        </p>
                        <p className="text-red-300 text-xs mt-1">{diagnosis.vetAdvice}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {diagnosis.symptoms.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Observed Symptoms</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 shrink-0" />
                            <span className="text-muted-foreground">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.treatment.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-300" />Treatment Plan</CardTitle></CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {diagnosis.treatment.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center text-sm font-medium shrink-0">{i + 1}</span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.medicines.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Syringe className="w-5 h-5 text-blue-300" />Recommended Medicines</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {diagnosis.medicines.map((med, i) => (
                          <Badge key={i} variant="outline" className="text-blue-300 border-blue-300 bg-blue-500/15">{med}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.prevention.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Prevention Tips</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.prevention.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.vetAdvice && diagnosis.urgency !== "emergency" && (
                  <Card className="bg-amber-500/15 border-amber-500/25">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-amber-300" /> Vet Advice
                      </h3>
                      <p className="text-muted-foreground">{diagnosis.vetAdvice}</p>
                      <Button className="mt-4 bg-amber-600 hover:bg-amber-700 gap-2">
                        Find a Vet Near You <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!isAnalyzing && !diagnosis && !error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Photo Selected</h3>
                  <p className="text-muted-foreground">Upload a photo of your sick animal to get an AI diagnosis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-12">
          <CardHeader><CardTitle>Supported Animals</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {ANIMAL_TYPES.map((animal) => (
                <div key={animal.name} className="p-4 bg-amber-500/15 rounded-xl text-center hover:bg-amber-500/20 transition-colors">
                  <span className="text-4xl block mb-2">{animal.emoji}</span>
                  <span className="text-sm font-medium text-foreground block">{animal.name}</span>
                  <span className="text-xs text-muted-foreground">{animal.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Also check your crops</h3>
              <p className="text-white/80">Use our Crop Disease Detector for plant health analysis</p>
            </div>
            <Link href="/disease-detector">
              <Button variant="secondary" className="gap-2 shrink-0">
                <Camera className="w-4 h-4" /> Open Crop Doctor
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AnimalDoctorPage() {
  return <AnimalDoctorContent />
}
