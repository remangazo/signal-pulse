"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadarSignal } from "@/components/sections/radar-signal"
import { Magnetic } from "@/components/ui/magnetic"
import { useMousePosition } from "@/lib/use-mouse-position"

const titleWords = ["Your", "Next", "Customer", "Is"]

export function Hero() {
  const mouse = useMousePosition()

  const rotateX = (mouse.y - 0.5) * -6
  const rotateY = (mouse.x - 0.5) * 6

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 sm:pb-0 sm:pt-0">
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${(mouse.x - 0.5) * -20}px, ${(mouse.y - 0.5) * -20}px)` }}
      >
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-signal/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-signal bg-signal/10 border border-signal/20 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-dot" />
                Beyond Conversation Monitoring &mdash; Full Lead Automation
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight text-foreground">
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.4 + i * 0.12 }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.9 }}
                className="text-signal inline-block mt-2"
              >
                Commenting Somewhere
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 1.1 }}
              className="mt-6 text-lg sm:text-xl text-muted max-w-xl leading-relaxed"
            >
              While others just find conversations, SignalPulse scores, drafts, and delivers
              ready-to-close leads. Reddit, X, LinkedIn, TikTok &mdash; with AI that writes your reply.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 1.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-md bg-signal/30 opacity-60" />
                <Magnetic strength={0.25}>
                  <Button variant="primary" size="lg">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Magnetic>
              </div>
              <Magnetic strength={0.2}>
                <Button variant="secondary" size="lg">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-12 flex items-center gap-6 text-sm text-subtle"
            >
              <div className="flex -space-x-2">
                {["AR", "SC", "MT"].map((initials, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 + i * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
                    className="w-8 h-8 rounded-full border-2 border-deep bg-signal/20 flex items-center justify-center text-[10px] font-semibold text-signal"
                  >
                    {initials}
                  </motion.div>
                ))}
              </div>
              <span><strong className="text-foreground">200+</strong> founders already onboard</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 80, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 }}
            className="order-1 lg:order-2 perspective-[1000px]"
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <RadarSignal />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
