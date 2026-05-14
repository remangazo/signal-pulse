"use client"

import { motion } from "framer-motion"
import { Search, Brain, MessageSquare } from "lucide-react"

const steps = [
  { number: "01", icon: Search, title: "Scan beyond keywords", description: "Reddit, X, LinkedIn, TikTok, IG — our agents crawl conversations other tools miss. We catch intent in places they don't look." },
  { number: "02", icon: Brain, title: "AI scores with 4-layer pipeline", description: "Not just one LLM pass. Heuristics, keyword boost, fast classifier, deep auditor. Noise filtered before you see it." },
  { number: "03", icon: MessageSquare, title: "Reply with AI drafts, not alerts", description: "Every lead comes with a context-aware response draft. ConvoHunter shows you conversations. SignalPulse writes the reply." },
]

const stepVariants = [
  { initial: { opacity: 0, x: -80, y: 30 }, dir: "left" },
  { initial: { opacity: 0, y: 60 }, dir: "down" },
  { initial: { opacity: 0, x: 80, y: 30 }, dir: "right" },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-2xl"
        >
          <span className="text-xs font-semibold text-signal tracking-widest uppercase">How it works</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            From Signal to Sale in <span className="text-signal">Three Steps</span>
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl">No complex setup. No endless scrolling. A pipeline of warm leads delivered every morning.</p>
        </motion.div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={stepVariants[i].initial}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 }}
              className="relative"
            >
              <span className="text-5xl font-bold text-signal/10 select-none leading-none absolute top-0 right-0">{step.number}</span>
              <div className="w-12 h-12 rounded-lg border border-signal/20 bg-signal/10 flex items-center justify-center mb-5">
                <step.icon className="w-5 h-5 text-signal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && <div className="hidden md:block absolute top-6 -right-6 w-12 h-px bg-border" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
