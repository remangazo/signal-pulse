"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { Globe, Bell, Filter, PenLine, Users, TrendingUp, ArrowRight } from "lucide-react"

interface Feature {
  icon: ReactNode
  title: string
  description: string
  gradient: string
}

const features: Feature[] = [
  { icon: <Globe className="w-6 h-6" />, title: "Beyond Reddit & X", description: "TikTok, IG comments, LinkedIn, HackerNews. Other tools stop at text posts. We mine video comments where intent is raw.", gradient: "from-amber-500/20 to-orange-600/10" },
  { icon: <Filter className="w-6 h-6" />, title: "4-Layer Intent Pipeline", description: "Heuristics + keywords + fast LLM + deep LLM. Each layer cuts noise. Only the top 15% reach your dashboard.", gradient: "from-sky-500/20 to-blue-600/10" },
  { icon: <PenLine className="w-6 h-6" />, title: "AI Drafts (Not Alerts)", description: "ConvoHunter shows you a conversation. SignalPulse writes the reply. Context-aware, brand-aligned, ready to send.", gradient: "from-violet-500/20 to-purple-600/10" },
  { icon: <Users className="w-6 h-6" />, title: "Competitor Switch Alerts", description: "We detect users frustrated with your competitors mid-sentence. Pre-sold leads delivered before they search alternatives.", gradient: "from-rose-500/20 to-pink-600/10" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "Feedback Loop Scoring", description: "Rate each lead and our model retrains. Over time, SignalPulse knows your ICP better than you do.", gradient: "from-emerald-500/20 to-teal-600/10" },
  { icon: <Bell className="w-6 h-6" />, title: "Auto-Send Outreach", description: "Connect Smartlead or Instantly. Qualified leads get auto-enrolled in sequences. From detection to DM in minutes.", gradient: "from-cyan-500/20 to-blue-600/10" },
]

const entryDirs = [
  { x: -80, y: 30, rotate: -3 },
  { x: 0, y: -50, rotate: 0 },
  { x: 80, y: 30, rotate: 3 },
  { x: -80, y: 30, rotate: -3 },
  { x: 0, y: 50, rotate: 0 },
  { x: 80, y: 30, rotate: 3 },
]

export function Features() {
  return (
    <section id="features" className="relative py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-signal/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-2xl"
        >
          <span className="text-xs font-semibold text-signal tracking-widest uppercase">Features</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            Everything You Need to <span className="text-signal">Close More</span>
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl">Other tools find conversations. We close them. AI response drafts, competitor detection, and auto-send outreach — built in.</p>
        </motion.div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: entryDirs[i].x, y: entryDirs[i].y, rotate: entryDirs[i].rotate }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.12 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }}
              className="group relative rounded-xl border border-border bg-surface overflow-hidden cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent opacity-60" />

              <div className="relative p-7">
                <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center text-signal mb-5 group-hover:scale-110 group-hover:bg-signal/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-signal transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.description}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-signal opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
