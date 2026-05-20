import { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { useAdminAuth } from "@/lib/admin-auth"
import DashboardSection from "./sections/Dashboard"
import UsersSection from "./sections/Users"
import ListingsSection from "./sections/Listings"
import DiseaseScansSection from "./sections/DiseaseScans"
import AnnouncementsSection from "./sections/Announcements"
import SponsorsSection from "./sections/Sponsors"
import SettingsSection from "./sections/Settings"
import {
  LayoutDashboard, Users, ShoppingBag, Activity,
  Megaphone, Building2, Settings, LogOut, Leaf, Menu, X, Shield,
} from "lucide-react"

const GOLD = "#F59E0B"

type Section = "dashboard" | "users" | "listings" | "disease" | "announcements" | "sponsors" | "settings"

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "listings", label: "Listings", icon: ShoppingBag },
  { id: "disease", label: "Disease Scans", icon: Activity },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "sponsors", label: "Sponsors", icon: Building2 },
  { id: "settings", label: "Settings", icon: Settings },
] as const

function ZambiaTime() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="font-mono text-xs" style={{ color: "#4B6CB7" }}>
      {time.toLocaleTimeString("en-ZM", { timeZone: "Africa/Lusaka", hour: "2-digit", minute: "2-digit", second: "2-digit" })} CAT
    </span>
  )
}

export default function AdminPage() {
  const { session, checked, isAdmin, logout } = useAdminAuth()
  const [, setLocation] = useLocation()
  const [section, setSection] = useState<Section>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (checked && !isAdmin) setLocation("/admin/login")
  }, [checked, isAdmin])

  if (!checked || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F1E" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "#4B6CB7" }}>Verifying access...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    setLocation("/admin/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #D97706)`, boxShadow: `0 0 16px rgba(245,158,11,0.3)` }}>
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ZIMAZAO</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] mt-0.5" style={{ color: GOLD }}>CEO CONTROL ROOM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id
          return (
            <button key={id} onClick={() => { setSection(id as Section); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? `rgba(245,158,11,0.12)` : "transparent",
                color: active ? GOLD : "#64748B",
                border: active ? `1px solid rgba(245,158,11,0.2)` : "1px solid transparent",
              }}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />}
            </button>
          )
        })}
      </nav>

      {/* Session info + logout */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `rgba(245,158,11,0.15)` }}>
            <Shield className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">CEO Admin</p>
            <p className="text-[10px] truncate" style={{ color: "#4B5563" }}>{session?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  const currentLabel = NAV.find(n => n.id === section)?.label ?? "Dashboard"
  const today = new Date().toLocaleDateString("en-ZM", { timeZone: "Africa/Lusaka", weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0F1E", fontFamily: "Inter, sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 flex-shrink-0
        transition-transform duration-200 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `} style={{ background: "#0D1426", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ background: "rgba(13,20,38,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg" style={{ color: "#64748B" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">{currentLabel}</h1>
              <p className="text-xs" style={{ color: "#4B5563" }}>Welcome back, CEO · {today}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ZambiaTime />
            <button onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {section === "dashboard" && <DashboardSection />}
          {section === "users" && <UsersSection />}
          {section === "listings" && <ListingsSection />}
          {section === "disease" && <DiseaseScansSection />}
          {section === "announcements" && <AnnouncementsSection />}
          {section === "sponsors" && <SponsorsSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}
