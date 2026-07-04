import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  { name: "John Mwansa", role: "Maize Farmer", location: "Choma, Southern Province", avatar: "👨🏾‍🌾", rating: 5, text: "Zimazao changed my life. I used to sell to middlemen at very low prices. Now I sell directly to buyers in Lusaka and make 40% more profit every season. My family's income has doubled!", income: "+40% income" },
  { name: "Grace Tembo", role: "Groundnut Farmer", location: "Chipata, Eastern Province", avatar: "👩🏾‍🌾", rating: 5, text: "The disease detector saved my entire groundnut harvest. I spotted early blight within minutes and got treatment advice immediately. I lost almost nothing compared to my neighbors.", income: "Harvest saved" },
  { name: "Peter Phiri", role: "Soybean & Maize Farmer", location: "Mkushi, Central Province", avatar: "👨🏿‍🌾", rating: 5, text: "Checking market prices before harvesting helps me know when to sell. Last season I waited two weeks and got ZMW 520 per bag instead of ZMW 480. That is a big difference across 300 bags!", income: "ZMW 12,000 extra" },
  { name: "Mary Banda", role: "Vegetable Farmer", location: "Kabwe, Central Province", avatar: "👩🏽‍🌾", rating: 5, text: "As a young farmer, I was worried nobody would trust me. But with my verified badge, buyers come to me. I sold all 200 bags within 3 days of listing. Zimazao is incredible!", income: "200 bags in 3 days" },
  { name: "James Mumba", role: "Cassava Farmer", location: "Mansa, Luapula Province", avatar: "👨🏾‍🌾", rating: 5, text: "I live far from the city but Zimazao connects me to buyers everywhere in Zambia. I no longer worry about transport or finding markets. Everything comes to me now.", income: "3x more buyers" },
  { name: "Ruth Chanda", role: "Sunflower Farmer", location: "Kasama, Northern Province", avatar: "👩🏿‍🌾", rating: 5, text: "The crop calendar reminded me exactly when to plant and fertilize. My yield went from 800kg per hectare to 1,200kg. Zimazao is not just a marketplace, it is a farming partner.", income: "+50% yield" },
]

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#03100a] py-24">
      <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-96 rounded-full bg-emerald-500/8 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <Badge className="mb-4 border-amber-300/25 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-300">
            Farmer Stories
          </Badge>
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
            Real farmers. Real results.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Over 10,000 farmers across all 10 provinces of Zambia are growing their income with Zimazao.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/25 hover:bg-white/[0.05]"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400/70 to-amber-300/70" />
              <Quote className="mb-4 h-8 w-8 text-amber-300/30" />
              <p className="mb-6 leading-relaxed text-white/75 italic">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/55">{t.role}</p>
                    <p className="text-xs text-white/40">{t.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1 flex justify-end gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <Badge className="border-emerald-400/25 bg-emerald-400/10 text-xs font-bold text-emerald-300">
                    {t.income}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
