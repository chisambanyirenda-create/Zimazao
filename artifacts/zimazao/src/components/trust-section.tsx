import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Shield, Award, Users, Lock, Smartphone, Headphones } from "lucide-react"

const trustFeatures = [
  { icon: Shield, title: "Verified Farmers", description: "Every seller is verified with a valid Zambian phone number and NRC.", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20" },
  { icon: Lock, title: "Secure Payments", description: "All transactions are protected with bank-grade encryption.", chip: "bg-sky-500/15 text-sky-300 border-sky-400/20" },
  { icon: Smartphone, title: "Mobile Money", description: "Seamless integration with MTN, Airtel Money & Zamtel Kwacha.", chip: "bg-amber-400/15 text-amber-300 border-amber-300/20" },
  { icon: Award, title: "Quality Graded", description: "Crops are graded to Zambia Bureau of Standards quality levels.", chip: "bg-orange-500/15 text-orange-300 border-orange-400/20" },
  { icon: Users, title: "Buyer Protection", description: "Our escrow system holds payment until delivery is confirmed.", chip: "bg-teal-500/15 text-teal-300 border-teal-400/20" },
  { icon: Headphones, title: "24/7 Support", description: "Our team speaks Nyanja, Bemba, Tonga & English to help you.", chip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/20" },
]

const partners = [
  { name: "Ministry of Agriculture", emoji: "🏛️" },
  { name: "Zambia Farmers Union", emoji: "🌾" },
  { name: "MTN Zambia", emoji: "📱" },
  { name: "Airtel Zambia", emoji: "📡" },
  { name: "ZNFU", emoji: "🤝" },
  { name: "ZABS", emoji: "✅" },
]

export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-[#04120b] py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <Badge className="mb-4 border-amber-300/25 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-300">
            Why Farmers Trust Us
          </Badge>
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
            Built for Zambian farmers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            We understand the challenges of farming in Zambia. Every feature is designed with your success in mind.
          </p>
        </motion.div>

        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${f.chip}`}>
                <f.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="mb-1 font-display font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-white/40">
            Trusted &amp; Recognized By
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-md transition-colors hover:border-amber-300/25"
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-sm font-medium text-white/80">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
