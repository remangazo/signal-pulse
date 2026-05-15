"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Magnetic } from "@/components/ui/magnetic"

export function CTA() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-signal/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
          Ready to Find Your <span className="text-signal">Next Customers?</span>
        </h2>
        <p className="text-muted text-lg max-w-md mx-auto mb-10">Stop scrolling. Start closing. Try SignalPulse free for 3 days — no credit card required.</p>
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-lg blur-md bg-signal/20" />
          <Magnetic strength={0.3}>
            <Link href="/auth/register">
              <Button variant="primary" size="lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Magnetic>
        </div>
        <p className="text-xs text-subtle mt-4">No commitment &bull; Cancel anytime &bull; No setup fees</p>
      </motion.div>
    </section>
  )
}
