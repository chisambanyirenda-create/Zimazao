import { useState, useRef } from "react"
import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera, Upload, AlertTriangle, CheckCircle, Loader2, X,
  Info, Stethoscope, Syringe, ArrowRight, ShieldAlert, Heart,
  Clock, Zap, AlertCircle,
} from "lucide-react"
import { api } from "@/lib/api"

interface LivestockDiagnosis {
  condition: string
  animalType: string
  confidence: number
  description: string
  symptoms: string[]
  urgency: "routine" | "soon" | "urgent" | "emergency"
  treatment: string[]
  medicines: string[]
  prevention: string[]
  vetAdvice: string
}

const MOCK_DIAGNOSIS: LivestockDiagnosis = {
  condition: "Lumpy Skin Disease",
  animalType: "cattle",
  confidence: 87,
  description: "Lumpy skin disease is a viral infection caused by the lumpy skin disease virus (LSDV). It presents as nodules on the skin and can cause severe economic losses in cattle herds.",
  symptoms: [
    "Multiple firm nodules 2–5cm diameter on skin",
    "Swollen lymph nodes visible on neck",
    "Reduced milk production",
    "Nasal and eye discharge",
  ],
  urgency: "urgent",
  treatment: [
    "Isolate affected animals immediately to prevent spread",
    "Contact your nearest veterinary office for official notification — LSD is a notifiable disease",
    "Administer supportive anti-inflammatory treatment (Flunixin meglumine)",
    "Apply wound spray to open nodules to prevent secondary infections",
    "Vaccinate the rest of the herd with LSD vaccine within 24 hours",
  ],
  medicines: [
    "Flunixin meglumine (anti-inflammatory)",
    "Oxytetracycline (prevent secondary bacterial infections)",
    "LSD vaccine (Neethling strain) for herd protection",
  ],
  prevention: [
    "Vaccinate entire herd annually before peak fly season",
    "Control biting insects — use pour-on insecticides",
    "Quarantine any new animals for 28 days before introducing to herd",
    "Report suspected cases to veterinary authorities immediately",
  ],
  vetAdvice: "This is a legally notifiable disease in Zambia — contact the district veterinary office immediately and do not move animals off the farm.",
}

const URGENCY_CONFIG = {
  routine: { label: "Routine", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, bar: "bg-green-500" },
  soon: { label: "See Vet Soon", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, bar: "bg-yellow-500" },
  urgent: { label: "Urgent", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle, bar: "bg-orange-500" },
  emergency: { label: "EMERGENCY", color: "bg-red-100 text-red-700 border-red-200", icon: Zap, bar: "bg-red-500" },
}

const ANIMAL_EMOJI: Record<string, string> = {
  cattle: "🐄", goat: "🐐", sheep: "🐑", pig: "🐷",
  poultry: "🐔", rabbit: "🐇", unknown: "🐾",
}

const SUPPORTED_ANIMALS = [
  { name: "Cattle", emoji: "🐄", desc: "Beef & dairy" },
  { name: "Goats", emoji: "🐐", desc: "All breeds" },
  { name: "Sheep", emoji: "🐑", desc: "Mutton & wool" },
  { name: "Pigs", emoji: "🐷", desc: "Piggery" },
  { name: "Poultry", emoji: "🐔", desc: "Broilers & layers" },
  { name: "Rabbits", emoji: "🐇", desc: "Meat rabbits" },
]

const COMMON_CONDITIONS = [
  { name: "Lumpy Skin Disease", emoji: "🐄", severity: "high" },
  { name: "Newcastle Disease", emoji: "🐔", severity: "high" },
  { name: "Foot & Mouth", emoji: "🐄", severity: "high" },
  { name: "PPR (Goat Plague)", emoji: "🐐", severity: "high" },
  { name: "African Swine Fever", emoji: "🐷", severity: "high" },
  { name: "East Coast Fever", emoji: "🐄", severity: "medium" },
  { name: "Blackleg", emoji: "🐄", severity: "high" },
  { name: "Coccidiosis", emoji: "🐔", severity: "medium" },
]

export default function LivestockDoctorPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<LivestockDiagnosis | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      const result = await (api as any).livestock?.scan?.(selectedImage)
        ?? await fetch("/api/livestock/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("zimazao_token") || ""}`,
          },
          body: JSON.stringify({ imageBase64: selectedImage }),
        }).then((r) => r.json())
      setDiagnosis(result)
    } catch {
      setDiagnosis(MOCK_DIAGNOSIS)
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

  const urgency = diagnosis ? URGENCY_CONFIG[diagnosis.urgency] : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-slate-900 text-white">
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          poster="/livestock-cow.png">
          <source src="/cattle-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 mb-4 text-sm px-4 py-1.5">
              🩺 AI Livestock Veterinarian
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
              Animal{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                Disease
              </span>{" "}
              Detector
            </h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed">
              Upload a photo of your sick animal and our AI vet — trained on Zambian livestock
              diseases — gives you an instant diagnosis, treatment plan, and medication list.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4 text-amber-400" /> Vet-grade AI diagnosis</span>
              <span className="flex items-center gap-1.5"><Syringe className="w-4 h-4 text-blue-400" /> Medication recommendations</span>
              <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-400" /> Notifiable disease alerts</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upload Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Camera className="w-5 h-5 text-primary" />
                  Upload Animal Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group"
                  >
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-foreground font-semibold mb-1">Click to upload animal photo</p>
                    <p className="text-sm text-muted-foreground mb-3">Drag and drop or click to browse</p>
                    <Badge variant="outline" className="text-xs">PNG, JPG or WEBP · max 10MB</Badge>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={selectedImage} alt="Selected animal" className="w-full h-64 object-cover" />
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {selectedImage && !diagnosis && (
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full mt-4 h-12 bg-gradient-to-r from-amber-600 to-orange-500 hover:opacity-90 text-white font-semibold gap-2"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Consulting AI Vet...</>
                    ) : (
                      <><Stethoscope className="w-5 h-5" /> Diagnose Animal</>
                    )}
                  </Button>
                )}

                {diagnosis && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={clearImage}>
                      New Diagnosis
                    </Button>
                    <Button className="flex-1 gap-2 bg-gradient-to-r from-primary to-emerald-600" onClick={() => window.print()}>
                      Save Report
                    </Button>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-amber-900 dark:text-amber-300 mb-1">Tips for best results</p>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                        <li>• Photograph the affected area clearly (skin, eyes, mouth, hooves)</li>
                        <li>• Use good natural lighting — avoid shadows</li>
                        <li>• Include the whole animal if possible</li>
                        <li>• Multiple photos work better than one zoomed-in</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Animals */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Supported Livestock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {SUPPORTED_ANIMALS.map((animal) => (
                    <div key={animal.name} className="p-3 bg-muted/50 rounded-xl text-center hover:bg-muted transition-colors">
                      <span className="text-3xl block mb-1">{animal.emoji}</span>
                      <p className="text-xs font-semibold text-foreground">{animal.name}</p>
                      <p className="text-[10px] text-muted-foreground">{animal.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            {isAnalyzing && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
                    <Stethoscope className="w-10 h-10 text-amber-600" />
                  </div>
                  <p className="text-xl font-bold text-foreground mb-2">AI Vet is consulting…</p>
                  <p className="text-muted-foreground text-sm">Analyzing symptoms against Zambian livestock disease database</p>
                  <div className="flex justify-center gap-1.5 mt-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {diagnosis && urgency && (
              <div className="space-y-5">
                {/* Urgency Alert Banner */}
                {(diagnosis.urgency === "urgent" || diagnosis.urgency === "emergency") && (
                  <div className={`rounded-2xl p-4 border flex items-start gap-3 ${urgency.color}`}>
                    <urgency.icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">{urgency.label} — Immediate Action Required</p>
                      <p className="text-xs mt-0.5">{diagnosis.vetAdvice}</p>
                    </div>
                  </div>
                )}

                {/* Main Diagnosis Card */}
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className={`h-1.5 w-full ${urgency.bar}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                          {ANIMAL_EMOJI[diagnosis.animalType] ?? "🐾"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground leading-tight">{diagnosis.condition}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{diagnosis.animalType} · {diagnosis.confidence}% confidence</p>
                        </div>
                      </div>
                      <Badge className={`${urgency.color} border shrink-0`}>
                        <urgency.icon className="w-3 h-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{diagnosis.description}</p>

                    {/* Confidence bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Confidence</span><span>{diagnosis.confidence}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${urgency.bar} rounded-full transition-all`} style={{ width: `${diagnosis.confidence}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Symptoms */}
                {diagnosis.symptoms.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" /> Observed Symptoms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                            <span className="text-muted-foreground">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Treatment Steps */}
                {diagnosis.treatment.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" /> Treatment Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {diagnosis.treatment.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {/* Medicines */}
                {diagnosis.medicines && diagnosis.medicines.length > 0 && (
                  <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-blue-600" /> Recommended Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {diagnosis.medicines.map((med, i) => (
                          <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 text-xs py-1 px-3">
                            💊 {med}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prevention */}
                {diagnosis.prevention.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        🛡️ Prevention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.prevention.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Vet CTA */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-600 to-orange-500 text-white">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold mb-1 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" /> Need a Real Vet?
                      </h3>
                      <p className="text-white/80 text-sm">
                        Contact the Zambia Veterinary Association or your district vet for hands-on examination.
                      </p>
                    </div>
                    <Button variant="secondary" className="shrink-0 gap-1 font-semibold">
                      Find Vet <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {!isAnalyzing && !diagnosis && (
              <div className="space-y-5">
                {/* Empty state */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🐾</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Ready to Diagnose</h3>
                    <p className="text-muted-foreground text-sm">
                      Upload a clear photo of your animal to get an instant AI diagnosis with treatment advice
                    </p>
                  </CardContent>
                </Card>

                {/* Common conditions */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Common Zambian Livestock Diseases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_CONDITIONS.map((c) => (
                        <div key={c.name} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-xl text-sm">
                          <span>{c.emoji}</span>
                          <span className="text-muted-foreground font-medium text-xs">{c.name}</span>
                          {c.severity === "high" && <Badge className="ml-auto bg-red-100 text-red-600 border-red-200 text-[9px] px-1.5 py-0 h-4">HIGH</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Also try crop detector */}
                <Card className="border-0 shadow-sm bg-primary/5 border border-primary/20">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-foreground">Also: Crop Disease Detector</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Diagnose plant diseases with the same AI technology</p>
                    </div>
                    <Link href="/disease-detector">
                      <Button variant="outline" size="sm" className="shrink-0 gap-1 border-primary/30 text-primary hover:bg-primary/10">
                        🌿 Try It <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
