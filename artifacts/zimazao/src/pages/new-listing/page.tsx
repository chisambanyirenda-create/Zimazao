

import { useState } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Loader2, Leaf, ArrowLeft, CheckCircle } from "lucide-react"
import { Link } from "wouter"

const cropCategories = [
  { value: "cereals", label: "Cereals (Maize, Sorghum, Millet)" },
  { value: "legumes", label: "Legumes (Groundnuts, Soybeans, Beans)" },
  { value: "tubers", label: "Tubers (Cassava, Sweet Potatoes)" },
  { value: "oilseeds", label: "Oilseeds (Sunflower, Cotton)" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "other", label: "Other" },
]

const provinces = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western",
]

function NewListingContent() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { api } = await import("@/lib/api")
      await api.listings.create({
        cropName: formData.cropName,
        price: parseFloat(formData.price),
        unit: formData.unit,
        quantity: formData.quantity,
        location: formData.province + (formData.district ? `, ${formData.district}` : ""),
        category: formData.category,
        description: formData.description || undefined,
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
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
            <p className="text-muted-foreground mb-6">
              You need to be signed in to create a listing
            </p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
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
                setFormData({
                  cropName: "",
                  category: "",
                  quantity: "",
                  unit: "50kg bag",
                  price: "",
                  description: "",
                  province: "",
                  district: "",
                })
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
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
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
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                <h3 className="font-semibold text-foreground">Location</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select 
                      value={formData.province} 
                      onValueChange={(value) => setFormData({ ...formData, province: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((prov) => (
                          <SelectItem key={prov} value={prov.toLowerCase()}>
                            {prov}
                          </SelectItem>
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
              </div>

              {/* Description */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-foreground">Description</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your crop - quality, harvest date, storage conditions, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-32 px-4 py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-foreground">Photos</h3>
                
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">
                    Click to upload photos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 5MB each (max 5 photos)
                  </p>
                </div>
              </div>

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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
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
  return (
    <NewListingContent />
  )
}
