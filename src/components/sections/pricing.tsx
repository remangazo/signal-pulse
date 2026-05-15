"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Magnetic } from "@/components/ui/magnetic"

const featureList = [
  "Unlimited conversation monitoring",
  "Reddit, X, LinkedIn & HackerNews",
  "AI-powered context analysis",
  "Real-time notifications",
  "AI-drafted response suggestions",
  "Daily lead digests via email",
  "Competitor switch detection",
  "Priority customer support",
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-xs font-semibold text-signal tracking-widest uppercase">Pricing</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            One Price. <span className="text-signal">Endless Customers.</span>
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto">One lead closes and it pays for itself. No tiers, no traps.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-16 max-w-lg mx-auto"
        >
          <div className="border border-border rounded-xl bg-surface p-8">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted">/month</span>
            </div>
            <p className="text-sm text-subtle mb-8">One lead closes and it pays for itself</p>
            <Magnetic strength={0.25}>
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="w-full mb-8">Start Free Trial</Button>
              </Link>
            </Magnetic>
            <ul className="space-y-3">
              {featureList.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <Check className="w-4 h-4 text-signal flex-shrink-0" />
                  <span className="text-muted">{feature}</span>
                </motion.li>
              ))}
            </ul>
            <p className="text-center text-subtle text-xs mt-8">No commitment &bull; Cancel anytime &bull; No setup fees</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
