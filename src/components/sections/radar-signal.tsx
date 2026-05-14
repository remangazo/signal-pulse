export function RadarSignal() {
  const dots = [
    { cx: 290, cy: 110, delay: 0.5, amplitude: 1 },
    { cx: 130, cy: 270, delay: 2.5, amplitude: 0.7 },
    { cx: 300, cy: 280, delay: 3.5, amplitude: 0.6 },
    { cx: 100, cy: 120, delay: 1.5, amplitude: 0.5 },
    { cx: 250, cy: 170, delay: 0.35, amplitude: 0.8 },
    { cx: 340, cy: 140, delay: 0.3, amplitude: 0.5 },
    { cx: 150, cy: 340, delay: 3.0, amplitude: 0.4 },
    { cx: 80, cy: 200, delay: 2.8, amplitude: 0.6 },
  ]

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="radar-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(22% 0.08 260 / 0.4)" />
            <stop offset="70%" stopColor="oklch(15% 0.04 260 / 0.3)" />
            <stop offset="100%" stopColor="oklch(13% 0.012 260 / 0)" />
          </radialGradient>
          <radialGradient id="sweep-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(68% 0.18 75 / 0.15)" />
            <stop offset="100%" stopColor="oklch(68% 0.18 75 / 0)" />
          </radialGradient>
          <clipPath id="sweep-clip">
            <path d="M200 200 L200 0 A200 200 0 0 1 400 200 Z" />
          </clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ping-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="200" fill="url(#radar-bg)" />
        <circle cx="200" cy="200" r="200" fill="none" stroke="oklch(68% 0.18 75 / 0.08)" strokeWidth="1" />

        <circle cx="200" cy="200" r="160" fill="none" stroke="oklch(68% 0.18 75 / 0.06)" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="oklch(68% 0.18 75 / 0.06)" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="80" fill="none" stroke="oklch(68% 0.18 75 / 0.06)" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="40" fill="none" stroke="oklch(68% 0.18 75 / 0.06)" strokeWidth="0.5" />

        <line x1="0" y1="200" x2="400" y2="200" stroke="oklch(68% 0.18 75 / 0.04)" strokeWidth="0.5" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="oklch(68% 0.18 75 / 0.04)" strokeWidth="0.5" />
        <line x1="58" y1="58" x2="342" y2="342" stroke="oklch(68% 0.18 75 / 0.04)" strokeWidth="0.5" />
        <line x1="342" y1="58" x2="58" y2="342" stroke="oklch(68% 0.18 75 / 0.04)" strokeWidth="0.5" />

        <g className="animate-radar" style={{ transformOrigin: "200px 200px" }}>
          <path d="M200 200 L200 0 A200 200 0 0 1 400 200 Z" fill="url(#sweep-grad)" clipPath="url(#sweep-clip)" />
          <line x1="200" y1="200" x2="200" y2="0" stroke="oklch(68% 0.18 75 / 0.4)" strokeWidth="1.5" filter="url(#glow)" />
        </g>

        {dots.map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="3"
              fill="oklch(68% 0.18 75 / 0.9)"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.15;1;0.15"
                dur="4s"
                repeatCount="indefinite"
                begin={`${dot.delay}s`}
              />
            </circle>

            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="0"
              fill="none"
              stroke="oklch(68% 0.18 75 / 0.5)"
              strokeWidth="1.5"
              filter="url(#ping-glow)"
            >
              <animate
                attributeName="r"
                values="0;35"
                dur="4s"
                repeatCount="indefinite"
                begin={`${dot.delay}s`}
              />
              <animate
                attributeName="opacity"
                values="0.6;0"
                dur="4s"
                repeatCount="indefinite"
                begin={`${dot.delay}s`}
              />
            </circle>

            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="0"
              fill="none"
              stroke="oklch(68% 0.18 75 / 0.3)"
              strokeWidth="1"
            >
              <animate
                attributeName="r"
                values="0;55"
                dur="4s"
                repeatCount="indefinite"
                begin={`${dot.delay + 0.3}s`}
              />
              <animate
                attributeName="opacity"
                values="0.4;0"
                dur="4s"
                repeatCount="indefinite"
                begin={`${dot.delay + 0.3}s`}
              />
            </circle>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <div className="flex items-center gap-2 text-subtle text-xs font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
          <span className="inline-flex gap-1 overflow-hidden">
            {"DETECTING".split("").map((char, i) => (
              <span
                key={i}
                className="inline-block animate-signal-flicker"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {char}
              </span>
            ))}
          </span>
          {" "}8 NEW LEADS
        </div>
      </div>
    </div>
  )
}
