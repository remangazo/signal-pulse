"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  { q: "How does conversation monitoring work?", a: "Our AI continuously scans Reddit, X, LinkedIn, and HackerNews to find conversations where your product could naturally help solve problems. It understands context, not just keywords." },
  { q: "What makes this different from keyword tools?", a: "Keywords match words, not intent. SignalPulse uses AI to understand context — a complaint about a competitor, a feature request, or a buying signal all look different to us." },
  { q: "How quickly will I see results?", a: "Most users find relevant conversations within their first day. Your free trial gives you enough time to assess the quality and volume for your specific product." },
  { q: "What platforms do you support?", a: "We currently support Reddit, X (Twitter), LinkedIn, and HackerNews. More platforms are added regularly based on customer demand." },
  { q: "Do I need to install anything?", a: "No. SignalPulse is fully cloud-based. Just enter your product URL and we start scanning immediately." },
  { q: "Can I cancel anytime?", a: "Absolutely. No contracts, no setup fees. Cancel with one click from your dashboard." },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-28 lg:py-36">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold text-signal tracking-widest uppercase">FAQ</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            Frequently Asked <span className="text-signal">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: 0.05 }}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-medium hover:bg-surface/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn("w-4 h-4 text-subtle transition-transform duration-200 flex-shrink-0 ml-4", openIndex === i && "rotate-180")}
                />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                <p className="px-5 pb-5 text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
