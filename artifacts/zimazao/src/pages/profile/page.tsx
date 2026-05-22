import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLocation, Link } from "wouter"
import {
  User, Phone, MapPin, Mail, Loader2, CheckCircle2,
  ArrowLeft, Lock, Eye, EyeOff, ShieldCheck,
} from "lucide-react"
import { AvatarUpload } from "@/components/avatar-upload"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [, navigate] = useLocation()

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
  })

  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" })
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const [savingPw, setSavingPw] = useState(false)

  if (!user) { navigate("/login"); return null }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!form.name.trim()) { setError("Name is required"); return }
    setSaving(true)
    try {
      await updateProfile({ name: form.name, phone: form.phone, location: form.location })
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(""); setPwSuccess("")
    if (!pwForm.oldPassword || !pwForm.newPassword) { setPwError("All fields are required"); return }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("New passwords do not match"); return }
    if (pwForm.newPassword.length < 6) { setPwError("New password must be at least 6 characters"); return }
    setSavingPw(true)
    try {
      await updateProfile({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      setPwSuccess("Password changed successfully!")
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" })
      setTimeout(() => setPwSuccess(""), 3000)
    } catch (err: any) {
      setPwError(err.message || "Failed to change password")
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <AvatarUpload size="lg" />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0 capitalize">{user.userType}</Badge>
                <span className="text-white/70 text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Update your name, phone number and location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />{success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11 pl-10"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="h-11 pl-10 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 pl-10"
                    placeholder="+260 97 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="h-11 pl-10"
                    placeholder="Province, District"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-emerald-600" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Keep your account secure with a strong password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{pwError}</div>
              )}
              {pwSuccess && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />{pwSuccess}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOld ? "text" : "password"}
                    value={pwForm.oldPassword}
                    onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                    className="h-11 pr-10"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    className="h-11 pr-10"
                    placeholder="Minimum 6 characters"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="h-11"
                  placeholder="Repeat new password"
                />
              </div>

              <Button type="submit" variant="outline" className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-white" disabled={savingPw}>
                {savingPw ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Change Password</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Account Type</p>
                <p className="text-muted-foreground text-xs capitalize mt-0.5">{user.userType} account · Member since {new Date(user.createdAt ?? "").getFullYear() || "2025"}</p>
              </div>
              <Badge className="capitalize bg-primary/10 text-primary border-0">{user.userType}</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
