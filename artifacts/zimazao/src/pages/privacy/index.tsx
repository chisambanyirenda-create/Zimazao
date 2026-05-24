import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <Badge className="bg-white/20 text-white border-0">Last updated: May 2026</Badge>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <Section title="1. Introduction">
          <p>
            Zimazao ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect from you, how we use it, and your rights regarding your data when you use the Zimazao agricultural marketplace platform in Zambia.
          </p>
          <p>
            By creating an account on Zimazao, you agree to the collection and use of your information as described in this policy.
          </p>
        </Section>

        <Section title="2. What Data We Collect">
          <p>When you register and use Zimazao, we collect the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Account information:</strong> Your full name, email address, phone number, and location (province/district)</li>
            <li><strong>Profile information:</strong> Profile photo, farm description, and any other details you choose to add</li>
            <li><strong>Transaction data:</strong> Orders placed or received, payment amounts, crop listings, and delivery history</li>
            <li><strong>Messages:</strong> Conversations between buyers and farmers through our in-app messaging system</li>
            <li><strong>Device data:</strong> Browser type, IP address, and general location data used for security purposes</li>
            <li><strong>Scan data:</strong> Photos uploaded for crop disease or animal diagnosis (processed by AI and not stored permanently)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To create and manage your Zimazao account</li>
            <li>To process orders, payments, and escrow transactions securely</li>
            <li>To send you in-app notifications about your orders and messages</li>
            <li>To display your profile and listings to other users on the platform</li>
            <li>To improve the platform and fix technical issues</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To comply with Zambian laws and regulations</li>
          </ul>
        </Section>

        <Section title="4. How We Store Your Data">
          <p>
            Your data is stored securely using <strong>Supabase</strong>, a trusted cloud database provider with industry-standard encryption at rest and in transit (SSL/TLS). All data is stored in secure servers with access controls to prevent unauthorised access.
          </p>
          <p>
            We retain your data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, unless we are required to retain it for legal or tax purposes.
          </p>
        </Section>

        <Section title="5. Sharing Your Data">
          <p>
            <strong>We never sell your personal data to third parties.</strong> Your information is only shared in the following limited circumstances:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>With other users:</strong> Your name, profile photo, location, and listings are visible to other Zimazao users as part of the marketplace. Your phone number is only shared when you choose to display it on your profile.</li>
            <li><strong>Payment processing:</strong> When you make payments, transaction data is processed by Flutterwave in accordance with their privacy policy.</li>
            <li><strong>Legal requirements:</strong> We may share data with law enforcement or regulatory authorities if required by Zambian law.</li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p>As a Zimazao user, you have the following rights regarding your personal data:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Access:</strong> You can view your personal data from your Account Settings page at any time</li>
            <li><strong>Correction:</strong> You can update your name, phone, location, and other details from your profile</li>
            <li><strong>Deletion:</strong> You can request deletion of your account and all associated data by contacting us at hello@zimazao.zm</li>
            <li><strong>Opt-out:</strong> You can disable in-app notifications from your profile settings</li>
          </ul>
        </Section>

        <Section title="7. Cookies and Tracking">
          <p>
            Zimazao uses essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies. For full details on our cookie usage, please read our <Link href="/cookies" className="text-primary underline">Cookie Policy</Link>.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Zimazao is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us immediately at hello@zimazao.zm so we can delete the account.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through in-app notifications. Continued use of Zimazao after changes means you accept the updated policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Email: hello@zimazao.zm</li>
            <li>Phone: +260 97 123 4567</li>
            <li>Address: Plot 1234, Cairo Road, Lusaka, Zambia</li>
          </ul>
        </Section>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">By creating an account on Zimazao, you confirm that you have read and agree to this Privacy Policy.</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="text-primary underline font-medium">Terms & Conditions</Link>
            <Link href="/register" className="text-primary underline font-medium">Create an Account →</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
