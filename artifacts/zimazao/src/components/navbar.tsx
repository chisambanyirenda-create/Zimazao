import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsBell } from "@/components/notifications-bell"
import {
  Menu, X, Leaf, User, LogOut, ShoppingBag, Home,
  Camera, BarChart3, MessageCircle, CalendarDays, Package,
  Beef, Stethoscope, Settings, ChevronDown, LayoutDashboard, UserPlus,
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

export function Navbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [location] = useLocation()

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Crops", icon: ShoppingBag },
    { href: "/livestock", label: "Livestock", icon: Beef, badge: "New" },
    { href: "/disease-detector", label: "Crop Doctor", icon: Camera },
    { href: "/livestock-doctor", label: "Animal Doctor", icon: Stethoscope },
    { href: "/prices", label: "Prices", icon: BarChart3 },
    { href: "/crop-calendar", label: "Calendar", icon: CalendarDays },
  ]

  const accountLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/profile", label: "Account Settings", icon: Settings },
  ]

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Zimazao</span>
          </Link>

          {/* Desktop Navigation */}
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
                  <Badge className="bg-amber-500 text-white border-0 text-[9px] px-1 py-0 h-4 ml-0.5 leading-none">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <NotificationsBell onOpen={() => setMobileMenuOpen(false)} />
            {user ? (
              <>
                {user.userType === "farmer" && (
                  <Link href="/new-listing">
                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                      <ShoppingBag className="w-3.5 h-3.5" /> Sell Now
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                      <div className="w-7 h-7 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-[11px] font-bold text-white leading-none">{getInitials(user.name)}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground leading-none">{user.name.split(" ")[0]}</p>
                        <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">{user.userType}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <div className="px-3 py-3 border-b border-border bg-muted/30 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-sm font-bold text-white">{getInitials(user.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <Badge className="mt-1 text-[10px] h-4 px-1.5 capitalize bg-primary/10 text-primary border-0">{user.userType}</Badge>
                        </div>
                      </div>
                    </div>
                    {accountLinks.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-primary" /> {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

          {/* Mobile right: notifications + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <NotificationsBell onOpen={() => setMobileMenuOpen(false)} />
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Menu ─── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 pb-4">

            {/* ── ACCOUNT SECTION (always at top) ── */}
            {user ? (
              <div className="pt-3 px-2 mb-2">
                {/* User card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 mb-2">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-sm font-bold text-white">{getInitials(user.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge className="capitalize shrink-0 bg-primary/10 text-primary border-0 text-xs">{user.userType}</Badge>
                </div>
                {/* Sign Out — big and obvious */}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 px-2 mb-2 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 font-semibold gap-2 border-primary/40 text-primary hover:bg-primary/5">
                    <User className="w-4 h-4" /> Sign In to Your Account
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-11 font-semibold gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                    <UserPlus className="w-4 h-4" /> Create a Free Account
                  </Button>
                </Link>
              </div>
            )}

            {/* ── DIVIDER ── */}
            <div className="border-t border-border/60 mx-2 mb-2" />

            {/* ── NAV LINKS ── */}
            <div className="px-2 flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-sm">{link.label}</span>
                  {"badge" in link && link.badge && (
                    <Badge className="bg-amber-500 text-white border-0 text-xs ml-auto">{link.badge}</Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* ── ACCOUNT LINKS (only logged in) ── */}
            {user && (
              <>
                <div className="border-t border-border/60 mx-2 my-2" />
                <div className="px-2 flex flex-col gap-0.5">
                  {user.userType === "farmer" && (
                    <Link href="/new-listing" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        <span className="font-semibold text-sm">Sell My Crops</span>
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
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
