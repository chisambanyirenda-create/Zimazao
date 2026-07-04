import { Link } from "wouter"
import { Leaf, Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react"

const quickLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/disease-detector", label: "Disease Detector" },
  { href: "/prices", label: "Market Prices" },
  { href: "/how-it-works", label: "How It Works" },
]
const farmerLinks = [
  { href: "/register", label: "Register to Sell" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/animal-doctor", label: "Animal Doctor" },
  { href: "/crop-calendar", label: "Crop Calendar" },
]
const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/cookies", label: "Cookie Policy" },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#030c07] text-white/70">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_-4px_rgba(52,211,153,0.6)]">
                <Leaf className="h-6 w-6 text-emerald-950" />
              </div>
              <span className="font-display text-xl font-bold text-white">Zimazao</span>
            </Link>
            <p className="mb-6 text-white/60">
              Empowering Zambian farmers with technology to sell crops and protect their harvests.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-amber-300/30 hover:bg-white/10 hover:text-amber-300"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/60 transition-colors hover:text-amber-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">For Farmers</h3>
            <ul className="space-y-3">
              {farmerLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/60 transition-colors hover:text-amber-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="h-5 w-5 text-amber-300" /> +260 97 123 4567
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="h-5 w-5 text-amber-300" /> hello@zimazao.zm
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <span>Plot 1234, Cairo Road<br />Lusaka, Zambia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">© 2026 Zimazao. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-5 text-sm">
            {legalLinks.map((l) => (
              <Link key={l.label} href={l.href} className="text-white/50 transition-colors hover:text-amber-300">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
