import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsBell } from "@/components/notifications-bell"
import { AvatarUpload, UserAvatar } from "@/components/avatar-upload"
import {
  Menu, X, Leaf, User, LogOut, ShoppingBag, Home,
  Camera, BarChart3, MessageCircle, CalendarDays, Package,
  Beef, Stethoscope, Settings, ChevronDown, LayoutDashboard, UserPlus,
  Wallet, ArrowRightLeft, AlertTriangle, ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Body scroll lock hook ─────────────────────────────────────────────────
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [locked])
}

// ─── Full-screen dark overlay ──────────────────────────────────────────────
function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-200"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

// ─── Mode-Switch Confirmation Dialog ──────────────────────────────────────────
function SwitchModeDialog({
  from, to, onConfirm, onCancel, loading,
}: {
  from: "farmer" | "buyer"
  to: "farmer" | "buyer"
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const isFarmerMode = to === "farmer"
  return (
    <>
      <div className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-border pointer-events-auto">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isFarmerMode ? "bg-green-100" : "bg-blue-100"}`}>
            <span className="text-4xl">{isFarmerMode ? "🚜" : "🛒"}</span>
          </div>
          <div className="flex justify-center mb-3">
            <Badge className={`text-xs px-3 py-1 ${isFarmerMode ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
              Mode Switch Request
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            Switching to {isFarmerMode ? "Farmer" : "Buyer"} Mode
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-5 leading-relaxed">
            Dear <span className="font-semibold text-foreground">{from === "farmer" ? "Farmer" : "Customer"}</span>, you are switching from{" "}
            <span className="font-semibold capitalize text-foreground">{from}</span> to{" "}
            <span className={`font-semibold capitalize ${isFarmerMode ? "text-green-600" : "text-blue-600"}`}>{to}</span> mode.{" "}
            Your dashboard and available features will change to match your new role.
          </p>
          <div className={`flex items-start gap-2 p-3 rounded-xl mb-5 text-xs ${isFarmerMode ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {isFarmerMode
                ? "As a Farmer you can create listings, receive orders, and manage your farm business."
                : "As a Buyer you can browse the marketplace, place orders, and track deliveries."}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button
              className={`flex-1 gap-2 ${isFarmerMode ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Switching…</span>
                : <><ArrowRightLeft className="w-4 h-4" /> Accept & Switch</>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function Navbar() {
  const { user, logout, switchMode } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [switchTarget, setSwitchTarget] = useState<"farmer" | "buyer" | null>(null)
  const [switchLoading, setSwitchLoading] = useState(false)
  const [location] = useLocation()

  const isFarmer = user?.userType === "farmer"

  // Lock body scroll whenever any panel is open
  useBodyScrollLock(mobileMenuOpen || !!switchTarget)

  const farmerNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Crops", icon: ShoppingBag },
    { href: "/livestock", label: "Livestock", icon: Beef, badge: "New" },
    { href: "/disease-detector", label: "Crop Doctor", icon: Camera },
    { href: "/livestock-doctor", label: "Animal Doctor", icon: Stethoscope },
    { href: "/prices", label: "Prices", icon: BarChart3 },
    { href: "/crop-calendar", label: "Calendar", icon: CalendarDays },
  ]
  const buyerNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Shop Crops", icon: ShoppingBag },
    { href: "/livestock", label: "Livestock", icon: Beef, badge: "New" },
    { href: "/prices", label: "Prices", icon: BarChart3 },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/messages", label: "Messages", icon: MessageCircle },
  ]
  const navLinks = user ? (isFarmer ? farmerNavLinks : buyerNavLinks) : farmerNavLinks

  const farmerAccountLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders Received", icon: Package },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/profile", label: "Account Settings", icon: Settings },
  ]
  const buyerAccountLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "My Purchases", icon: Package },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/profile", label: "Account Settings", icon: Settings },
  ]
  const accountLinks = isFarmer ? farmerAccountLinks : buyerAccountLinks

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href)

  const handleSwitchConfirm = async () => {
    if (!switchTarget) return
    setSwitchLoading(true)
    try { await switchMode(switchTarget) }
    finally { setSwitchLoading(false); setSwitchTarget(null) }
  }

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <>
      {/* ── Mode-switch dialog ── */}
      {switchTarget && user && (
        <SwitchModeDialog
          from={user.userType}
          to={switchTarget}
          onConfirm={handleSwitchConfirm}
          onCancel={() => setSwitchTarget(null)}
          loading={switchLoading}
        />
      )}

      {/* ── Mobile menu overlay (z-999) ── */}
      {mobileMenuOpen && <Overlay onClose={closeMenu} />}

      {/* ── Mobile slide-in panel (z-1000) ── */}
      <div
        className={`fixed inset-y-0 right-0 z-[1000] w-[85%] max-w-sm flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "white",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.2), -2px 0 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Zimazao</span>
          </div>
          <button
            className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            onClick={closeMenu}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {/* Account section */}
          {user ? (
            <div className="px-4 pt-4 pb-3 space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                <AvatarUpload size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge className={`capitalize text-xs border-0 block mb-1 ${isFarmer ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {isFarmer ? "🚜" : "🛒"} {user.userType}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600">K{(user.walletBalance ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => { setSwitchTarget(isFarmer ? "buyer" : "farmer"); closeMenu() }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm border transition-colors ${
                  isFarmer
                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                    : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Switch to {isFarmer ? "Buyer" : "Farmer"} Mode
              </button>

              <button
                onClick={() => { logout(); closeMenu() }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border border-red-100 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="px-4 pt-4 pb-3 space-y-2">
              <Link href="/login" onClick={closeMenu}>
                <Button variant="outline" className="w-full h-11 font-semibold gap-2 border-primary/40 text-primary hover:bg-primary/5">
                  <User className="w-4 h-4" /> Sign In to Your Account
                </Button>
              </Link>
              <Link href="/register" onClick={closeMenu}>
                <Button className="w-full h-11 font-semibold gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                  <UserPlus className="w-4 h-4" /> Create a Free Account
                </Button>
              </Link>
            </div>
          )}

          <div className="border-t border-border mx-4 my-1" />

          {/* Nav links */}
          <div className="px-4 pt-2 flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Navigation</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
                onClick={closeMenu}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                <span className="font-medium text-sm flex-1">{link.label}</span>
                {"badge" in link && link.badge && (
                  <Badge className="bg-amber-500 text-white border-0 text-xs">{link.badge}</Badge>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </Link>
            ))}
          </div>

          {/* Account links */}
          {user && (
            <>
              <div className="border-t border-border mx-4 my-3" />
              <div className="px-4 flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Account</p>
                {isFarmer && (
                  <Link href="/new-listing" onClick={closeMenu}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span className="font-semibold text-sm flex-1">Sell My Crops</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </div>
                  </Link>
                )}
                {accountLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive(item.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    }`}
                    onClick={closeMenu}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Spacer so fixed navbar doesn't overlap page content ── */}
      <div className="h-16" />

      {/* ── Navbar bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-[1100] border-b border-border/60 shadow-sm" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="neon-logo w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Zimazao</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5 mx-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                  {"badge" in link && link.badge && (
                    <Badge className="bg-amber-500 text-white border-0 text-[9px] px-1 py-0 h-4 ml-0.5 leading-none">{link.badge}</Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <NotificationsBell onOpen={() => setMobileMenuOpen(false)} />
              {user ? (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Wallet className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">K{(user.walletBalance ?? 0).toLocaleString()}</span>
                  </div>
                  {isFarmer && (
                    <Link href="/new-listing">
                      <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                        <ShoppingBag className="w-3.5 h-3.5" /> Sell Now
                      </Button>
                    </Link>
                  )}

                  {/* Desktop dropdown — with overlay backdrop */}
                  <div className="relative">
                    {dropdownOpen && (
                      <div
                        className="fixed inset-0 z-[999]"
                        onClick={() => setDropdownOpen(false)}
                      />
                    )}
                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button className="relative z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                          <UserAvatar name={user.name} avatar={user.avatar} userType={user.userType} size="sm" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-foreground leading-none">{user.name.split(" ")[0]}</p>
                            <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">{user.userType}</p>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 z-[1001]">
                        <div className="px-3 py-3 border-b border-border bg-muted/30 rounded-t-lg">
                          <div className="flex items-center gap-3">
                            <AvatarUpload size="md" />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-[10px] h-4 px-1.5 capitalize border-0 ${isFarmer ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                  {isFarmer ? "🚜" : "🛒"} {user.userType}
                                </Badge>
                                <span className="text-[10px] text-emerald-600 font-semibold">K{(user.walletBalance ?? 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {accountLinks.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center gap-2" onClick={() => setDropdownOpen(false)}>
                              <item.icon className="w-4 h-4 text-primary" /> {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-sm font-medium" onClick={() => { setSwitchTarget(isFarmer ? "buyer" : "farmer"); setDropdownOpen(false) }}>
                          <ArrowRightLeft className={`w-4 h-4 ${isFarmer ? "text-blue-500" : "text-green-600"}`} />
                          Switch to {isFarmer ? "Buyer" : "Farmer"} Mode
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { logout(); setDropdownOpen(false) }} className="text-destructive focus:text-destructive gap-2">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="gap-1.5 border-border/80 font-medium">
                      <User className="w-3.5 h-3.5" /> Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm font-medium">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="lg:hidden flex items-center gap-1">
              <NotificationsBell onOpen={() => setMobileMenuOpen(false)} />
              <button
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
