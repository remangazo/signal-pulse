"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

type Step = 1 | 2 | 3 | 4 | 5
type Phase = "idle" | "crawling" | "analyzing" | "scanning" | "complete"

const PHASE_MESSAGES: Record<Phase, { label: string; detail: string }> = {
  idle: { label: "", detail: "" },
  crawling: { label: "Analizando tu sitio web", detail: "Accediendo a tu landing page..." },
  analyzing: { label: "Procesando información", detail: "Extrayendo propuesta de valor, pain points y mercado..." },
  scanning: { label: "Escaneando competencia", detail: "Identificando competidores y oportunidades..." },
  complete: { label: "Análisis completo", detail: "Resultados listos" },
}

const QUESTIONS = [
  { id: "problem", label: "¿Qué problema resuelve tu SaaS?", placeholder: "Ej: Ayuda a pequeñas empresas a gestionar sus redes sociales automáticamente" },
  { id: "icp", label: "¿Quién es tu cliente ideal?", placeholder: "Ej: Dueños de pymes, marketers digitales, freelancers" },
  { id: "keywords", label: "¿Qué palabras clave usaría alguien que necesita tu producto?", placeholder: "Ej: automatización redes sociales, gestión de marketing, ahorrar tiempo" },
  { id: "competitors", label: "¿Quiénes son tus principales competidores?", placeholder: "Ej: Hootsuite, Buffer, Later (separados por coma)" },
  { id: "industry", label: "¿En qué industria operas?", placeholder: "Ej: Marketing, SaaS, Tecnología" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 95))
    }, 800)
    return () => clearInterval(interval)
  }, [loading])

  const handleQuestionSubmit = () => {
    if (QUESTIONS.some((q) => !answers[q.id]?.trim())) {
      setError("Responde todas las preguntas para un mejor análisis")
      return
    }
    setError("")
    setStep(3)
  }

  const handleRegisterSaaS = async () => {
    if (!url) return
    setError("")
    setLoading(true)
    setProgress(10)
    setPhase("crawling")

    setTimeout(() => setPhase("analyzing"), 3000)
    setTimeout(() => setPhase("scanning"), 7000)

    try {
      const config = JSON.stringify({
        ...answers,
        competitors_list: (answers.competitors || "").split(",").map((c: string) => c.trim()),
      })

      const result = await api.saas.register({
        url,
        name: name || undefined,
        config,
      })
      setAnalysis(result)
      setPhase("complete")
      setProgress(100)
      await new Promise((r) => setTimeout(r, 800))
      setStep(4)
    } catch (err: any) {
      setError(err.message || "Error al analizar SaaS")
    } finally {
      setLoading(false)
    }
  }

  const renderCompetitors = () => {
    try {
      return JSON.parse(analysis?.competitors || "[]")
    } catch { return typeof analysis?.competitors === "string" && analysis?.competitors ? analysis.competitors.split(",") : [] }
  }

  const renderPainPoints = () => {
    try { return JSON.parse(analysis?.pain_points || "[]") }
    catch { return typeof analysis?.pain_points === "string" && analysis?.pain_points ? analysis.pain_points.split(",") : [] }
  }

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-1 mb-8">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                step === s ? "bg-signal text-deep scale-110 ring-2 ring-signal/30" :
                step > s ? "bg-signal/30 text-signal" : "bg-deep-card text-muted border border-border"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 5 && <div className={`w-8 h-0.5 transition-all duration-500 ${step > s ? "bg-signal" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-deep-card rounded-2xl border border-border p-8 transition-all duration-500 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">¿Cuál es tu SaaS?</h2>
                <p className="text-muted text-sm mt-1">Ingresa la URL para un análisis profundo con IA</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL de tu SaaS</label>
                  <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
                    placeholder="https://tu-saas.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre (opcional)</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
                    placeholder="Mi SaaS" />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button onClick={() => { if (!url) { setError("Ingresa una URL"); return }; setError(""); setStep(2) }}
                  className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Cuéntanos más sobre tu producto</h2>
                <p className="text-muted text-sm mt-1">Esto ayudará a nuestros agentes a encontrar leads más precisos</p>
              </div>
              <div className="space-y-4">
                {QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-foreground mb-1">{q.label}</label>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal resize-none"
                      placeholder={q.placeholder}
                      rows={2}
                    />
                  </div>
                ))}
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button onClick={handleQuestionSubmit}
                  className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                  Iniciar Análisis
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Analizando tu producto</h2>
                <p className="text-muted text-sm mt-1">Nuestros agentes están trabajando...</p>
              </div>
              <div className="w-full bg-deep rounded-full h-3 overflow-hidden">
                <div className="h-full bg-signal rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium text-lg">{PHASE_MESSAGES[phase]?.label}</p>
                <p className="text-muted text-sm mt-1">{PHASE_MESSAGES[phase]?.detail}</p>
              </div>
              <div className="flex justify-center gap-2 py-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-signal/60 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          )}

          {step === 4 && analysis && (
            <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h2 className="text-xl font-bold text-foreground">Análisis de mercado completado</h2>
                <p className="text-muted text-sm mt-1">El Cartographer analizó tu producto en profundidad</p>
              </div>

              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="p-4 rounded-lg bg-deep border border-border">
                  <p className="text-sm text-muted mb-1">Producto</p>
                  <p className="text-foreground font-medium">{analysis.name}</p>
                  <p className="text-foreground text-sm mt-1">{analysis.description}</p>
                </div>

                {analysis.tone && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-1">Tono de comunicación</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-signal/20 text-signal capitalize">{analysis.tone}</span>
                  </div>
                )}

                {renderPainPoints().length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Pain Points detectados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {renderPainPoints().map((p: string) => (
                        <span key={p} className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {renderCompetitors().length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Competidores</p>
                    <div className="flex flex-wrap gap-1.5">
                      {renderCompetitors().map((c: string) => (
                        <span key={c} className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.icp_description && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-1">Cliente ideal</p>
                    <p className="text-foreground">{analysis.icp_description}</p>
                  </div>
                )}
              </div>

              <button onClick={() => setStep(5)}
                className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                Continuar
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center animate-[fade-in-up_0.5s_ease-out]">
              <div className="text-5xl animate-bounce">🎉</div>
              <h2 className="text-xl font-bold text-foreground">¡SignalPulse está trabajando para ti!</h2>
              <p className="text-muted">
                Los agentes de IA están buscando leads en Reddit, X/Twitter y Product Hunt.
                Recibirás notificaciones en Telegram cuando encontremos oportunidades.
              </p>
              <div className="bg-deep rounded-lg p-4 text-left text-sm text-muted space-y-2 border border-border">
                <p className="text-foreground font-medium">Resumen de tu configuración:</p>
                <p>📌 SaaS: <span className="text-foreground">{analysis?.name}</span></p>
                <p>🎯 Keywords: <span className="text-foreground">{answers.keywords}</span></p>
                <p>👥 ICP: <span className="text-foreground">{answers.icp}</span></p>
                <p>🔍 Competidores: <span className="text-foreground">{answers.competitors}</span></p>
              </div>
              <button onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                Ir al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
