"use client"

import { motion } from "framer-motion"

const testimonials = [
  { quote: "We hit our first lead that converted in less than 24 hours. Actually with the first set of findings after the onboarding. Already paid for itself.", name: "Alex Rivera", role: "Founder, DataPulse" },
  { quote: "From finishing the onboarding to the first lead, it was a matter of hours. And it has been a constant drip since then. Love the results.", name: "Sarah Chen", role: "Indie Hacker, TaskFlow" },
  { quote: "The AI suggestions are incredibly accurate. We are quite niche but SignalPulse managed to constantly surface conversations with potential leads we would have never found.", name: "Marcus Thompson", role: "CEO, BrandKit" },
]

const entryDirs = [
  { x: -80, y: 0 },
  { x: 0, y: 60 },
  { x: 80, y: 0 },
]

export function Testimonials() {
  return (
    <section className="relative py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-2xl"
        >
          <span className="text-xs font-semibold text-signal tracking-widest uppercase">Testimonials</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            Loved by <span className="text-signal">Founders</span>
          </h2>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: entryDirs[i].x, y: entryDirs[i].y }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
              className="flex flex-col"
            >
              <div className="text-4xl leading-none text-signal/20 select-none mb-2">&ldquo;</div>
              <p className="text-sm text-muted leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-signal/20 border border-signal/30 flex items-center justify-center text-xs font-semibold text-signal">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-subtle">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
