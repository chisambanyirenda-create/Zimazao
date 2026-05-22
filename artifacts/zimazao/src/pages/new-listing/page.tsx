import { useState, useRef } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Loader2, Leaf, ArrowLeft, CheckCircle, X, ImageIcon, MapPin } from "lucide-react"
import { Link } from "wouter"
import { api } from "@/lib/api"
import { LocationPicker } from "@/components/location-picker"

const cropCategories = [
  { value: "cereals", label: "🌽 Cereals (Maize, Sorghum, Millet)" },
  { value: "legumes", label: "🫘 Legumes (Groundnuts, Soybeans, Beans)" },
  { value: "tubers", label: "🥔 Tubers (Cassava, Sweet Potatoes)" },
  { value: "oilseeds", label: "🌻 Oilseeds (Sunflower, Cotton)" },
  { value: "vegetables", label: "🥬 Vegetables" },
  { value: "fruits", label: "🍎 Fruits" },
  { value: "livestock", label: "🐄 Livestock (Cattle, Goats, Sheep, Pigs)" },
  { value: "poultry", label: "🐔 Poultry (Chickens, Ducks, Turkeys)" },
  { value: "other", label: "🌾 Other" },
]

const isLivestockCategory = (cat: string) => cat === "livestock" || cat === "poultry"

const provinces = [
  "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka",
  "Muchinga", "Northern", "North-Western", "Southern", "Western",
]

function NewListingContent() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    cropName: "",
    category: "",
    quantity: "",
    unit: "50kg bag",
    price: "",
    description: "",
    province: "",
    district: "",
  })
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [livestockData, setLivestockData] = useState({
    breed: "",
    age: "",
    weight: "",
    vaccinated: false,
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB")
      return
    }

    setUploadError(null)
    setImageFile(file)
    setImageUrl(null)

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const result = await api.upload.image(file)
      setImageUrl(result.url)
    } catch (err: any) {
      setUploadError(err.message || "Upload failed — please try again")
      setImageFile(null)
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const isLivestock = isLivestockCategory(formData.category)
      const extraDesc = isLivestock
        ? [
            livestockData.breed && `Breed: ${livestockData.breed}`,
            livestockData.age && `Age: ${livestockData.age}`,
            livestockData.weight && `Weight: ${livestockData.weight}`,
            livestockData.vaccinated ? "Vaccinated: Yes" : null,
            formData.description,
          ].filter(Boolean).join(" | ")
        : formData.description
      await api.listings.create({
        cropName: formData.cropName,
        price: parseFloat(formData.price),
        unit: formData.unit,
        quantity: formData.quantity,
        location: formData.province + (formData.district ? `, ${formData.district}` : ""),
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        category: formData.category,
        description: extraDesc || undefined,
        imageUrl: imageUrl || undefined,
      })
      setSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create listing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to create a listing</p>
            <Link href="/login"><Button className="w-full">Sign In</Button></Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (user.userType === "buyer") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto text-center p-8 border-0 shadow-lg">
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🚜</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Farmer Mode Required</h2>
            <p className="text-muted-foreground mb-2">You are currently in <strong>Buyer mode</strong>.</p>
            <p className="text-muted-foreground text-sm mb-6">
              To create listings and sell your crops, switch to Farmer mode from your account menu.
            </p>
            <Link href="/dashboard">
              <Button className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600">
                <Leaf className="w-4 h-4" /> Go to Dashboard & Switch Mode
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Listing Created!</h2>
            <p className="text-muted-foreground mb-6">
              Your crop listing has been submitted and will be visible to buyers shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={() => {
                setSubmitted(false)
                setFormData({ cropName: "", category: "", quantity: "", unit: "50kg bag", price: "", description: "", province: "", district: "" })
                removeImage()
              }}>
                Create Another Listing
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Listing</CardTitle>
            <p className="text-muted-foreground">
              Fill in the details about the crop you want to sell
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Crop Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Crop Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cropName">Crop Name *</Label>
                    <Input
                      id="cropName"
                      placeholder="e.g., White Maize"
                      value={formData.cropName}
                      onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[200]">
                        {cropCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" className="z-[200]">
                        <SelectItem value="50kg bag">50kg Bag</SelectItem>
                        <SelectItem value="25kg bag">25kg Bag</SelectItem>
                        <SelectItem value="90kg bag">90kg Bag</SelectItem>
                        <SelectItem value="tonne">Tonne</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Unit (ZMW) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 450"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Location</h3>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {showMap ? "Hide map" : "Pin on map (optional)"}
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[200]">
                        {provinces.map((prov) => (
                          <SelectItem key={prov} value={prov.toLowerCase()}>{prov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="e.g., Chongwe"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>
                {showMap && (
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    locationText={formData.district ? `${formData.district}, ${formData.province}` : ""}
                    onLocationChange={(lat, lng, addr) => {
                      setLatitude(lat)
                      setLongitude(lng)
                      if (!formData.district && addr) {
                        const parts = addr.split(", ")
                        if (parts[0]) setFormData(prev => ({ ...prev, district: parts[0] }))
                      }
                    }}
                  />
                )}
                {latitude && longitude && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location pinned: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Livestock-specific fields */}
              {isLivestockCategory(formData.category) && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    🐄 Livestock Details
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Breed</Label>
                      <Input
                        placeholder="e.g., Brahman, Boer"
                        value={livestockData.breed}
                        onChange={(e) => setLivestockData({ ...livestockData, breed: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        placeholder="e.g., 2 years, 6 months"
                        value={livestockData.age}
                        onChange={(e) => setLivestockData({ ...livestockData, age: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Weight</Label>
                      <Input
                        placeholder="e.g., 350kg, 2.2kg"
                        value={livestockData.weight}
                        onChange={(e) => setLivestockData({ ...livestockData, weight: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Checkbox
                      id="vaccinated"
                      checked={livestockData.vaccinated}
                      onCheckedChange={(checked) => setLivestockData({ ...livestockData, vaccinated: !!checked })}
                    />
                    <div>
                      <Label htmlFor="vaccinated" className="cursor-pointer font-medium text-blue-800">Animals are vaccinated</Label>
                      <p className="text-xs text-blue-600">Vaccinated animals attract more buyers and command higher prices</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-foreground">Description</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your crop — quality, harvest date, storage conditions, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 px-4 py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-foreground">Crop Photo</h3>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium mb-1">Click to upload a photo</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Crop preview"
                      className="w-full h-56 object-cover"
                    />
                    {/* Upload status overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                        <span className="text-white text-sm font-medium">Uploading to cloud…</span>
                      </div>
                    )}
                    {imageUrl && !isUploading && (
                      <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {uploadError}
                  </p>
                )}

                {imagePreview && !imageUrl && !isUploading && (
                  <button
                    type="button"
                    onClick={() => imageFile && handleFileChange({ target: { files: [imageFile] } } as any)}
                    className="text-sm text-primary underline"
                  >
                    Retry upload
                  </button>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={isSubmitting || isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Uploading photo…</>
                  ) : isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating…</>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function NewListingPage() {
  return <NewListingContent />
}
