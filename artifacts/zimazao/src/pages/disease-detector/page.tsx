import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import {
  Camera, Upload, AlertTriangle, CheckCircle, Loader2, X, Info, ArrowRight, Crown, Phone,
} from "lucide-react"

interface SponsoredProduct {
  id: number
  companyName: string
  productName: string
  productImage: string | null
  description: string | null
  price: string | null
  targetDisease: string
  contactNumber: string | null
}

interface DiagnosisResult {
  disease: string
  confidence: number
  description: string
  symptoms: string[]
  treatment: string[]
  prevention: string[]
  severity: "low" | "medium" | "high"
  medicines?: string[]
  sponsoredProducts?: SponsoredProduct[]
}

function DiseaseDetectorContent() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [scanError, setScanError] = useState<{ code?: string; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setDiagnosis(null)
        setScanError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return
    setIsAnalyzing(true)
    setScanError(null)
    try {
      const { api } = await import("@/lib/api")
      const result = await api.disease.scan(selectedImage)
      setDiagnosis(result)
    } catch (err: any) {
      const code = err?.code
      setScanError({ code, message: err.message || "Analysis failed" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setDiagnosis(null)
    setScanError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-primary/10 text-primary"
      case "medium": return "bg-amber-500/20 text-amber-300"
      case "high": return "bg-destructive/10 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Crop Disease Detector</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your crop and our AI will analyze it for diseases, providing instant diagnosis and treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Upload Crop Image</CardTitle>
            </CardHeader>
            <CardContent>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WEBP (max. 10MB)</p>
                </div>
              ) : (
                <div className="relative">
                  <img src={selectedImage} alt="Selected crop" className="w-full h-64 object-cover rounded-xl" />
                  <button onClick={clearImage} className="absolute top-3 right-3 w-8 h-8 bg-foreground/80 rounded-full flex items-center justify-center text-background hover:bg-foreground transition-colors" aria-label="Remove image">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedImage && !diagnosis && !scanError && (
                <Button onClick={analyzeImage} disabled={isAnalyzing} className="w-full mt-4 h-12">
                  {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing...</> : <><Camera className="w-5 h-5 mr-2" />Analyze Image</>}
                </Button>
              )}

              {scanError && (
                <div className="mt-4">
                  {scanError.code === "SCAN_LIMIT_REACHED" ? (
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
                      <p className="text-sm text-red-300 mt-1">{scanError.message}</p>
                      <Button onClick={analyzeImage} variant="outline" className="mt-3">Try Again</Button>
                    </div>
                  )}
                </div>
              )}

              {diagnosis && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearImage}>Upload New Image</Button>
                  <Button className="flex-1" onClick={() => window.print()}>Download Report</Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Tips for best results</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Take photos in good natural lighting</li>
                      <li>• Focus on the affected area of the plant</li>
                      <li>• Include both healthy and diseased parts if possible</li>
                      <li>• Avoid blurry or out-of-focus images</li>
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
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-medium text-foreground mb-2">Analyzing your crop...</p>
                  <p className="text-muted-foreground">Our AI is examining the image for signs of disease</p>
                </CardContent>
              </Card>
            )}

            {diagnosis && (
              <div className="space-y-6 neon-scan-result rounded-2xl p-1 -m-1">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{diagnosis.disease}</h3>
                          <p className="text-sm text-muted-foreground">{diagnosis.confidence}% confidence</p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{diagnosis.description}</p>
                  </CardContent>
                </Card>

                {diagnosis.symptoms.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Symptoms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.symptoms.map((symptom, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 shrink-0" />
                            <span className="text-muted-foreground">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.treatment.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" />Recommended Treatment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {diagnosis.treatment.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium shrink-0">{i + 1}</span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.sponsoredProducts && diagnosis.sponsoredProducts.length > 0 && (
                  <Card className="border-amber-500/25 bg-amber-500/15/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        🛒 Recommended Products
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/25 text-xs font-normal">Sponsored</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {diagnosis.sponsoredProducts.map((p) => (
                          <div key={p.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-500/20">
                            {p.productImage ? (
                              <img src={p.productImage} alt={p.productName} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className="w-14 h-14 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 text-2xl">🧪</div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm">{p.productName}</p>
                                {p.price && <p className="text-sm font-bold text-amber-300">ZMW {Number(p.price).toLocaleString()}</p>}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{p.companyName}</p>
                              {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                              {p.contactNumber && (
                                <a href={`tel:${p.contactNumber}`} className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline">
                                  <Phone className="w-3 h-3" /> {p.contactNumber}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Sponsored agricultural products — always consult an agronomist</p>
                    </CardContent>
                  </Card>
                )}

                {diagnosis.prevention.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🛡️ Prevention Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {diagnosis.prevention.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                    <p className="text-primary-foreground/80 mb-4">Connect with agricultural experts in your area for personalized advice.</p>
                    <Button variant="secondary" className="gap-2">Find Agricultural Expert <ArrowRight className="w-4 h-4" /></Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {!isAnalyzing && !diagnosis && !scanError && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Image Selected</h3>
                  <p className="text-muted-foreground">Upload a photo of your crop to get started with the disease analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-12">
          <CardHeader><CardTitle>Supported Crops</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { name: "Maize", emoji: "🌽" }, { name: "Groundnuts", emoji: "🥜" },
                { name: "Soybeans", emoji: "🫘" }, { name: "Cassava", emoji: "🥔" },
                { name: "Tomatoes", emoji: "🍅" }, { name: "Cotton", emoji: "🧶" },
              ].map((crop) => (
                <div key={crop.name} className="p-4 bg-muted/50 rounded-xl text-center hover:bg-muted transition-colors">
                  <span className="text-4xl block mb-2">{crop.emoji}</span>
                  <span className="text-sm text-muted-foreground">{crop.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function DiseaseDetectorPage() {
  return <DiseaseDetectorContent />
}
