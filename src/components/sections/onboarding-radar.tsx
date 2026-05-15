"use client"

import { useEffect, useState } from "react"

export type Phase = "idle" | "crawling" | "analyzing" | "scanning" | "complete"

const PHASE_DOTS: Record<Phase, { cx: number; cy: number; label: string }[]> = {
  idle: [],
  crawling: [
    { cx: 290, cy: 110, label: "Landing" },
    { cx: 130, cy: 270, label: "Pricing" },
    { cx: 300, cy: 280, label: "Features" },
  ],
  analyzing: [
    { cx: 290, cy: 110, label: "Propuesta" },
    { cx: 130, cy: 270, label: "Pain Points" },
    { cx: 300, cy: 280, label: "Mercado" },
    { cx: 100, cy: 120, label: "ICP" },
    { cx: 250, cy: 170, label: "Keywords" },
  ],
  scanning: [
    { cx: 290, cy: 110, label: "Competidores" },
    { cx: 130, cy: 270, label: "Alternativas" },
    { cx: 300, cy: 280, label: "Diferenciación" },
    { cx: 100, cy: 120, label: "Precios" },
    { cx: 250, cy: 170, label: "Industria" },
    { cx: 340, cy: 140, label: "Decision Makers" },
    { cx: 150, cy: 340, label: "Objections" },
    { cx: 80, cy: 200, label: "Contenido" },
  ],
  complete: [
    { cx: 200, cy: 180, label: "✅" },
  ],
}

export function OnboardingRadar({ phase }: { phase: Phase }) {
  const [activeDots, setActiveDots] = useState<typeof PHASE_DOTS["analyzing"]>([])

  useEffect(() => {
    const dots = PHASE_DOTS[phase] || []
    setActiveDots([])
    let i = 0
    const interval = setInterval(() => {
      if (i < dots.length) {
        setActiveDots((prev) => [...prev, dots[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [phase])

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-square">
      <svg viewBox="0 0 400 420" className="w-full h-full">
        <defs>
          <radialGradient id="orbg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(22% 0.08 260 / 0.5)" />
            <stop offset="70%" stopColor="oklch(15% 0.04 260 / 0.3)" />
            <stop offset="100%" stopColor="oklch(13% 0.012 260 / 0)" />
          </radialGradient>
          <radialGradient id="swg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(68% 0.18 75 / 0.2)" />
            <stop offset="100%" stopColor="oklch(68% 0.18 75 / 0)" />
          </radialGradient>
          <filter id="glw">
            <feGaussianBlur stdDeviation="2" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="210" r="200" fill="url(#orbg)" />
        <circle cx="200" cy="210" r="200" fill="none" stroke="oklch(68% 0.18 75 / 0.1)" strokeWidth="1" />
        <circle cx="200" cy="210" r="160" fill="none" stroke="oklch(68% 0.18 75 / 0.07)" strokeWidth="0.5" />
        <circle cx="200" cy="210" r="120" fill="none" stroke="oklch(68% 0.18 75 / 0.07)" strokeWidth="0.5" />
        <circle cx="200" cy="210" r="80" fill="none" stroke="oklch(68% 0.18 75 / 0.07)" strokeWidth="0.5" />
        <circle cx="200" cy="210" r="40" fill="none" stroke="oklch(68% 0.18 75 / 0.07)" strokeWidth="0.5" />

        {phase !== "idle" && (
          <g className="animate-radar" style={{ transformOrigin: "200px 210px" }}>
            <path d="M200 210 L200 10 A200 200 0 0 1 400 210 Z" fill="url(#swg)" />
            <line x1="200" y1="210" x2="200" y2="10" stroke="oklch(68% 0.18 75 / 0.4)" strokeWidth="1.5" filter="url(#glw)" />
          </g>
        )}

        {activeDots.map((dot, i) => (
          <g key={i} className="animate-[ping-ring_2s_ease-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }}>
            <circle cx={dot.cx} cy={dot.cy} r="4" fill="oklch(68% 0.18 75 / 0.9)" filter="url(#glw)" />
            <text
              x={dot.cx}
              y={dot.cy - 14}
              textAnchor="middle"
              fill="oklch(75% 0.02 260)"
              fontSize="10"
              fontFamily="monospace"
              className="animate-[fade-in-up_0.5s_ease-out]"
            >
              {dot.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div className="flex items-center gap-2 text-subtle text-xs font-mono tracking-wider">
          <span className={`w-1.5 h-1.5 rounded-full ${phase === "complete" ? "bg-green" : "bg-signal"} animate-pulse-dot`} />
          <span>
            {phase === "idle" && "ESPERANDO"}
            {phase === "crawling" && "ANALIZANDO SITIO WEB..."}
            {phase === "analyzing" && "PROCESANDO INFORMACIÓN..."}
            {phase === "scanning" && `ESCANEANDO ${activeDots.length}/8 ÁREAS...`}
            {phase === "complete" && "ANÁLISIS COMPLETO"}
          </span>
        </div>
      </div>
    </div>
  )
}
