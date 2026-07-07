import { Link } from "wouter"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
          <Badge className="bg-white/20 text-white border-0">Last updated: May 2026</Badge>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <Section title="1. How Refunds Work on Zimazao">
          <p>
            Zimazao uses an <strong>escrow payment system</strong> to protect buyers. When you pay for an order online, your money is held securely by Zimazao and is not released to the farmer until you confirm delivery. This protects you if something goes wrong.
          </p>
          <p>
            Refunds on Zimazao are processed either automatically through the escrow system or manually by the Zimazao team following a dispute resolution.
          </p>
        </Section>

        <Section title="2. When You Qualify for a Refund">
          <p>You may be eligible for a full or partial refund in the following situations:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>You received the wrong product (different crop, variety, or quality than listed)</li>
            <li>You received less quantity than what was agreed in the order</li>
            <li>The products were damaged, spoiled, or not fit for use upon delivery</li>
            <li>The farmer cancelled the order after payment was made</li>
            <li>The order was marked as delivered but you never received anything</li>
            <li>The Zimazao dispute team rules in your favour after reviewing your case</li>
          </ul>
        </Section>

        <Section title="3. When Refunds Are Not Given">
          <p>Refunds will <strong>not</strong> be issued in the following situations:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>You confirmed delivery of the goods through the app and later changed your mind</li>
            <li>You placed an order by mistake and the farmer has already packed or dispatched it</li>
            <li>The crops were of acceptable quality but you are unhappy with the price</li>
            <li>You conducted a transaction outside the Zimazao platform (cash deals arranged off-platform are not protected by our escrow)</li>
            <li>The issue was caused by factors beyond the farmer's control (natural disasters, transport delays)</li>
            <li>Cash on Delivery (COD) orders — refunds for COD orders must be arranged directly between the buyer and farmer</li>
          </ul>
        </Section>

        <Section title="4. Refund Timeframes">
          <p>Once a refund is approved, processing times depend on your payment method:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Zimazao Wallet:</strong> Instant — the refund appears in your wallet balance immediately</li>
            <li><strong>MTN Mobile Money:</strong> 1–3 business hours after approval</li>
            <li><strong>Airtel Money:</strong> 1–3 business hours after approval</li>
            <li><strong>Card payments via Flutterwave:</strong> 3–7 business days depending on your bank</li>
          </ul>
          <p>
            Refund approval by the Zimazao dispute team typically takes 24–48 hours from the time a dispute is raised.
          </p>
        </Section>

        <Section title="5. How to Request a Refund">
          <p>To request a refund, follow these steps:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Go to your <strong>Orders</strong> page in the app</li>
            <li>Find the relevant order and tap <strong>"Report a Problem"</strong></li>
            <li>Select the reason that best describes your issue</li>
            <li>Provide a clear description of what happened (photos help your case)</li>
            <li>The Zimazao team will review your dispute and contact both parties within 24–48 hours</li>
          </ul>
          <p>
            If you need to contact us directly about a refund, email zimazao1@gmail.com with your order number and a description of the problem.
          </p>
        </Section>

        <Section title="6. Dispute Resolution and Refunds">
          <p>
            When a dispute is raised, the escrow funds are immediately <strong>frozen</strong>. Neither the buyer nor the farmer can access the money until the Zimazao team reviews the case.
          </p>
          <p>
            The Zimazao team will review all available evidence — including messages, photos, order history, and the accounts of both parties. Our team's decision is final. Possible outcomes include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Full refund to the buyer</li>
            <li>Partial refund to the buyer with partial payment to the farmer</li>
            <li>Full payment release to the farmer</li>
            <li>Request for additional information or evidence</li>
          </ul>
        </Section>

        <Section title="7. Flutterwave Refund Processing">
          <p>
            Card payments processed via Flutterwave may take 3–7 business days to appear back in your bank account or on your card, depending on your financial institution. This delay is outside Zimazao's control and is governed by Flutterwave's refund policy.
          </p>
          <p>
            For Flutterwave-related refund enquiries, you may also contact Flutterwave directly at support@flutterwave.com.
          </p>
        </Section>

        <Section title="8. Commission on Refunded Orders">
          <p>
            If a full refund is issued to a buyer as a result of farmer fault (wrong product, non-delivery, etc.), the 3% Zimazao commission is <strong>not charged</strong> to the farmer for that transaction.
          </p>
          <p>
            If a partial refund is issued, the commission is calculated on the reduced amount that was released to the farmer.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>For refund enquiries or disputes, contact the Zimazao support team:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>In-app: Go to your order and tap "Report a Problem"</li>
            <li>Email: zimazao1@gmail.com</li>
            <li>Phone: +260 966 224 853</li>
          </ul>
        </Section>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">Questions about your refund? Contact us at zimazao1@gmail.com or raise a dispute from your orders page.</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="text-primary underline font-medium">Terms & Conditions</Link>
            <Link href="/privacy" className="text-primary underline font-medium">Privacy Policy</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
