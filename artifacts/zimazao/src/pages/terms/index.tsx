import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-emerald-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <Badge className="bg-white/20 text-white border-0">Last updated: May 2026</Badge>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <Section title="1. About Zimazao">
          <p>
            Zimazao is an online agricultural marketplace platform that connects farmers and buyers across Zambia. <strong>Zimazao acts as a marketplace only</strong> — we do not buy, sell, or own any agricultural products listed on our platform.
          </p>
          <p>
            All transactions on the platform are between independent farmers (sellers) and buyers. Zimazao facilitates the connection, provides escrow payment protection, and charges a 3% commission on completed transactions.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>To use Zimazao you must:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Be at least 18 years of age</li>
            <li>Be located in Zambia or trading Zambian agricultural products</li>
            <li>Provide accurate personal and business information during registration</li>
            <li>Have a valid mobile money account (for payments and withdrawals)</li>
          </ul>
        </Section>

        <Section title="3. User Roles">
          <p><strong>Farmers</strong> may list crops and livestock for sale, receive orders from buyers, manage their listings, and withdraw earnings from their wallet. Farmers are responsible for the accuracy of their listings and the quality of goods delivered.</p>
          <p><strong>Buyers</strong> may browse listings, place orders, and rate farmers after completed transactions. Buyers are responsible for confirming delivery within 48 hours or raising a dispute if there is a problem.</p>
          <p>Users may switch between farmer and buyer modes from their dashboard at any time.</p>
        </Section>

        <Section title="4. Payments and Escrow">
          <p>Zimazao offers two payment methods:</p>
          <p><strong>Online Payment (Escrow):</strong> When a buyer pays online, the funds are held securely by Zimazao and are not released to the farmer until the buyer confirms delivery. If the buyer does not confirm or raise a dispute within 48 hours of the order being marked as Delivered, the funds are automatically released to the farmer. Zimazao deducts a 3% commission before releasing funds to the farmer.</p>
          <p><strong>Cash on Delivery (COD):</strong> No online payment is collected. The buyer and farmer meet and settle payment in cash. Zimazao records the transaction and invoices the farmer for the 3% commission, which may be settled manually or deducted from a future online transaction.</p>
        </Section>

        <Section title="5. Commission and Fees">
          <p>Zimazao charges a flat <strong>3% commission</strong> on the total value of every completed transaction. This applies to both online and Cash on Delivery orders.</p>
          <p>No other fees are charged to buyers. Farmers are responsible for the commission on every completed sale. Zimazao reserves the right to update commission rates with 30 days' notice.</p>
        </Section>

        <Section title="6. Disputes">
          <p>Either party may raise a dispute on any active order. Valid dispute reasons include: wrong product, wrong quantity, product damaged, payment issue, or other.</p>
          <p>When a dispute is raised, the escrow funds are immediately frozen. Both parties will be notified. The Zimazao team will review all available evidence and may request additional information. The team's decision is final and may result in: a full refund to the buyer, release of funds to the farmer, or a request for more information from either party.</p>
          <p>Zimazao is not liable for disputes arising from fraudulent listings, misrepresentation, or conduct outside the platform.</p>
        </Section>

        <Section title="7. Refunds">
          <p>Refunds may be issued by the Zimazao team as part of a dispute resolution. Refunds are returned to the original payment method (wallet or mobile money). Zimazao does not guarantee refunds in all circumstances — each case is reviewed individually.</p>
        </Section>

        <Section title="8. Withdrawals">
          <p>Farmers may request withdrawal of their available wallet balance to MTN or Airtel mobile money at any time. Withdrawal requests are reviewed and processed by the Zimazao team within 1–3 business hours. Zimazao reserves the right to hold withdrawal requests for review in the event of suspicious activity or outstanding disputes.</p>
        </Section>

        <Section title="9. Ratings and Reviews">
          <p>After every completed order, both parties may rate each other on a scale of 1 to 5 stars. Ratings are visible publicly and affect listing visibility on the marketplace. Farmers with an average rating below 3 stars may receive a warning or have their listings reviewed. Repeated disputes or negative ratings may result in account suspension.</p>
        </Section>

        <Section title="10. Prohibited Activities">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Listing products you do not have or cannot deliver</li>
            <li>Manipulating reviews or ratings</li>
            <li>Circumventing the escrow system to collect payment off-platform</li>
            <li>Harassing, threatening, or deceiving other users</li>
            <li>Creating multiple accounts to abuse the platform</li>
            <li>Listing illegal goods or prohibited agricultural products</li>
          </ul>
          <p>Violation of these rules may result in immediate account suspension without refund.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>Zimazao is a marketplace platform only. We are not responsible for:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>The quality, safety, or accuracy of any listed products</li>
            <li>Losses arising from transactions conducted outside the platform</li>
            <li>Acts of fraud, misrepresentation, or breach of contract between users</li>
            <li>Technical failures or delays beyond our control</li>
          </ul>
          <p>In all cases, Zimazao's liability is limited to the commission amount collected on a given transaction.</p>
        </Section>

        <Section title="12. Privacy">
          <p>Your personal data (name, email, phone, location) is used solely to operate the Zimazao platform. We do not sell your data to third parties. Payment data is processed via Flutterwave in accordance with their privacy policy. By registering, you consent to receive platform notifications via in-app messages.</p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>Zimazao reserves the right to update these Terms and Conditions at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of significant changes via the in-app announcement system.</p>
        </Section>

        <Section title="14. Contact">
          <p>For any questions about these terms, disputes, or platform conduct, contact the Zimazao team through the in-app messaging system or at the email address provided during onboarding.</p>
        </Section>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">By creating an account on Zimazao, you confirm that you have read and agree to these Terms and Conditions.</p>
          <Link href="/register" className="text-primary underline text-sm font-medium">Create an Account →</Link>
        </div>

      </main>
      <Footer />
    </div>
  )
}
