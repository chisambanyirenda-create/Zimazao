import { useState } from "react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu, X, Leaf, User, LogOut, ShoppingBag, Home,
  Camera, BarChart3, MessageCircle, CalendarDays, Package, Beef,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [location] = useLocation()

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Crops", icon: ShoppingBag },
    { href: "/livestock", label: "Livestock", icon: Beef, badge: "New" },
    { href: "/disease-detector", label: "AI Doctor", icon: Camera },
    { href: "/prices", label: "Prices", icon: BarChart3 },
    { href: "/crop-calendar", label: "Calendar", icon: CalendarDays },
  ]

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Zimazao</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
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

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2">
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
                    <Button variant="outline" size="sm" className="gap-2 border-border/60">
                      <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      {user.name.split(" ")[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.userType} account</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><BarChart3 className="w-4 h-4 mr-2 text-primary" /> Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders"><Package className="w-4 h-4 mr-2 text-primary" /> My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages"><MessageCircle className="w-4 h-4 mr-2 text-primary" /> Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border/60">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {"badge" in link && link.badge && (
                    <Badge className="bg-amber-500 text-white border-0 text-xs ml-auto">{link.badge}</Badge>
                  )}
                </Link>
              ))}

              <div className="border-t border-border/60 mt-2 pt-2 px-4">
                {user ? (
                  <div className="space-y-1">
                    <div className="py-2">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.userType}</p>
                    </div>
                    {[
                      { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
                      { href: "/orders", label: "My Orders", icon: Package },
                      { href: "/messages", label: "Messages", icon: MessageCircle },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 py-2.5 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <item.icon className="w-4 h-4" />{item.label}
                      </Link>
                    ))}
                    <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="flex items-center gap-3 py-2.5 text-destructive w-full">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 py-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-emerald-600">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
