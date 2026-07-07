import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Cookie } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <Badge className="bg-white/20 text-white border-0">Last updated: May 2026</Badge>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files that are saved on your device (phone, tablet, or computer) when you visit a website or use a web app. They help the app remember who you are and what you were doing, so you do not have to log in every time you visit.
          </p>
          <p>
            Cookies are not harmful and they do not give anyone access to your device or personal files.
          </p>
        </Section>

        <Section title="2. What Cookies Zimazao Uses">
          <p>Zimazao uses a small number of essential cookies to make the platform work properly. Here is what each one does:</p>

          <div className="space-y-3 mt-2">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">Session Cookie (Essential)</p>
              <p>This cookie keeps you logged in to your Zimazao account while you are using the app. Without it, you would be logged out every time you navigate to a new page. This cookie is deleted automatically when you close your browser or log out.</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">Authentication Token (Essential)</p>
              <p>This is a secure token stored in your browser's local storage that confirms your identity to the Zimazao server. It allows you to stay logged in securely without having to re-enter your password on every visit. It expires after 30 days of inactivity.</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">Preference Cookies (Functional)</p>
              <p>These cookies remember your preferences on the platform, such as your recent searches on the marketplace and your selected filters. They make your experience faster and more personalised.</p>
            </div>
          </div>
        </Section>

        <Section title="3. What We Do NOT Use Cookies For">
          <p>Zimazao does <strong>not</strong> use cookies for:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Tracking your activity on other websites</li>
            <li>Advertising or marketing purposes</li>
            <li>Selling your data to third parties</li>
            <li>Social media tracking pixels</li>
            <li>Analytics services that share data with outside companies</li>
          </ul>
          <p>
            We only use what is necessary to run the Zimazao platform. Your privacy is important to us.
          </p>
        </Section>

        <Section title="4. Third-Party Cookies">
          <p>
            When you make a payment through Flutterwave, Flutterwave may set their own cookies on their payment page. These are governed by <strong>Flutterwave's own Cookie Policy</strong> and are outside Zimazao's control. We recommend reviewing Flutterwave's policy at flutterwave.com if you have concerns.
          </p>
        </Section>

        <Section title="5. How to Manage Cookies">
          <p>You can control and delete cookies through your browser settings. Here is how to do it on the most common browsers:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong>Safari (iPhone/iPad):</strong> Settings → Safari → Advanced → Website Data</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Samsung Internet:</strong> Settings → Privacy → Delete browsing data</li>
          </ul>
          <p>
            <strong>Please note:</strong> If you delete or block essential cookies, you will be logged out of Zimazao and will need to sign in again. Some features may not work properly without cookies enabled.
          </p>
        </Section>

        <Section title="6. Changes to This Cookie Policy">
          <p>
            We may update this Cookie Policy when we change how the app works or add new features. We will notify you of any significant changes through the in-app notification system.
          </p>
        </Section>

        <Section title="7. Contact Us">
          <p>
            If you have questions about cookies or your privacy on Zimazao, contact us:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Email: hello@zimazao.zm</li>
            <li>Phone: +260 966 224 853</li>
          </ul>
        </Section>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">For more details on how we handle your data, read our full Privacy Policy.</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/privacy" className="text-primary underline font-medium">Privacy Policy</Link>
            <Link href="/terms" className="text-primary underline font-medium">Terms & Conditions</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
