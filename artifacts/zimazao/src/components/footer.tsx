import { Link } from "wouter"
import { Leaf, Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Zimazao</span>
            </Link>
            <p className="text-background/70 mb-6">
              Empowering Zambian farmers with technology to sell crops and protect their harvests.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace" className="text-background/70 hover:text-background transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/disease-detector" className="text-background/70 hover:text-background transition-colors">
                  Disease Detector
                </Link>
              </li>
              <li>
                <Link href="/prices" className="text-background/70 hover:text-background transition-colors">
                  Market Prices
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-background/70 hover:text-background transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Farmers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/register" className="text-background/70 hover:text-background transition-colors">
                  Register to Sell
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-background/70 hover:text-background transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/animal-doctor" className="text-background/70 hover:text-background transition-colors">
                  Animal Doctor
                </Link>
              </li>
              <li>
                <Link href="/crop-calendar" className="text-background/70 hover:text-background transition-colors">
                  Crop Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary" />
                +260 97 123 4567
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary" />
                hello@zimazao.zm
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Plot 1234, Cairo Road<br />Lusaka, Zambia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2026 Zimazao. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-sm">
            <Link href="/terms" className="text-background/60 hover:text-background transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-background/60 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="text-background/60 hover:text-background transition-colors">
              Refund Policy
            </Link>
            <Link href="/cookies" className="text-background/60 hover:text-background transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
