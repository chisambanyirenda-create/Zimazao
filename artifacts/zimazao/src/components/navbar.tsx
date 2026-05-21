import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsBell } from "@/components/notifications-bell"
import {
  Menu, X, Leaf, User, LogOut, ShoppingBag, Home,
  Camera, BarChart3, MessageCircle, CalendarDays, Package,
  Beef, Stethoscope, Settings, ChevronDown, LayoutDashboard,
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

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <NotificationsBell />

            {user ? (
              <>
                {user.userType === "farmer" && (
                  <Link href="/new-listing">
                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Sell Now
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
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
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
                    <User className="w-3.5 h-3.5" />
                    Sign In
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

          {/* Mobile right side */}
          <div className="lg:hidden flex items-center gap-2">
            <NotificationsBell />
            {!user && (
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-1.5 h-8 px-3 text-xs font-medium border-border/80">
                  <User className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            )}
            {user && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold text-white">{getInitials(user.name)}</span>
              </div>
            )}
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-border/60 animate-in slide-in-from-top-2 duration-200">

            {/* Auth Section — at the top for guests */}
            {!user && (
              <div className="mb-4 mx-1 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10">
                <p className="text-sm font-semibold text-foreground mb-1">Welcome to Zimazao</p>
                <p className="text-xs text-muted-foreground mb-3">Sign in to buy crops, sell your harvest, and more.</p>
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full h-10 font-medium text-sm gap-1.5">
                      <User className="w-4 h-4" /> Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button className="w-full h-10 bg-gradient-to-r from-primary to-emerald-600 font-medium text-sm">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Logged-in user header */}
            {user && (
              <div className="mb-3 mx-1 p-3 rounded-xl bg-muted/50 flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-sm font-bold text-white">{getInitials(user.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge className="ml-auto capitalize shrink-0 bg-primary/10 text-primary border-0 text-xs">{user.userType}</Badge>
              </div>
            )}

            {/* Nav links */}
            <div className="flex flex-col gap-0.5 mb-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{link.label}</span>
                  {"badge" in link && link.badge && (
                    <Badge className="bg-amber-500 text-white border-0 text-xs ml-auto">{link.badge}</Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* Account links for logged-in users */}
            {user && (
              <>
                <div className="border-t border-border/60 mt-2 pt-2 flex flex-col gap-0.5">
                  {user.userType === "farmer" && (
                    <Link href="/new-listing" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 text-primary font-semibold text-sm">
                        <ShoppingBag className="w-4 h-4" /> Sell My Crops
                      </div>
                    </Link>
                  )}
                  {accountLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                        isActive(item.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/5 transition-colors w-full mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
