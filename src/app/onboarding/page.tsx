"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { OnboardingRadar } from "@/components/sections/onboarding-radar"
import type { Phase } from "@/components/sections/onboarding-radar"

type Step = 1 | 2 | 3 | 4 | 5

const QUESTIONS = [
  { id: "problem", label: "¿Qué problema resuelve tu SaaS?", placeholder: "Ej: Ayuda a pequeñas empresas a gestionar sus redes sociales automáticamente" },
  { id: "icp", label: "¿Quién es tu cliente ideal?", placeholder: "Ej: Dueños de pymes, marketers digitales, freelancers" },
  { id: "keywords", label: "¿Qué palabras clave usaría alguien que necesita tu producto?", placeholder: "Ej: automatización, gestión de marketing, ahorrar tiempo" },
  { id: "competitors", label: "¿Quiénes son tus principales competidores?", placeholder: "Ej: Hootsuite, Buffer, Later" },
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

  const steps = [1, 2, 3, 4, 5] as Step[]

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-center gap-1 mb-10">
          {steps.map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                step === s ? "bg-signal text-deep scale-110 ring-2 ring-signal/30 shadow-lg shadow-signal/20" :
                step > s ? "bg-signal/30 text-signal" : "bg-deep-card text-muted border border-border"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 5 && <div className={`w-10 h-0.5 transition-all duration-500 ${step > s ? "bg-signal" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-deep-card rounded-2xl border border-border p-8 min-h-[450px] transition-all duration-500">
            {step === 1 && <StepURL url={url} setUrl={setUrl} name={name} setName={setName} error={error} onNext={() => { if (!url) { setError("Ingresa una URL"); return }; setError(""); setStep(2) }} />}
            {step === 2 && <StepQuestions answers={answers} setAnswers={setAnswers} error={error} setError={setError} onNext={() => { if (QUESTIONS.some((q) => !answers[q.id]?.trim())) { setError("Responde todas las preguntas"); return }; setError(""); setStep(3); setLoading(true); setPhase("crawling"); setTimeout(() => setPhase("analyzing"), 3000); setTimeout(() => setPhase("scanning"), 7000); handleRegister() }} />}
            {step === 3 && <StepLoading phase={phase} progress={progress} error={error} />}
            {step === 4 && <StepResults analysis={analysis} onNext={() => setStep(5)} />}
            {step === 5 && <StepDone analysis={analysis} answers={answers} onDashboard={() => router.push("/dashboard")} />}
          </div>

          <div className="hidden lg:flex items-center justify-center bg-deep-card/50 rounded-2xl border border-border p-6 min-h-[450px]">
            {step <= 2 ? (
              <div className="text-center space-y-6">
                <div className="text-6xl">📡</div>
                <h3 className="text-lg font-bold text-foreground">Análisis con IA profunda</h3>
                <ul className="text-sm text-muted space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Firecrawl extrae todo el contenido de tu sitio web</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Groq LLM analiza en profundidad producto y mercado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>8 áreas de análisis: competidores, precios, ICP, keywords...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Resultados precisos para leads ultra curados</span>
                  </li>
                </ul>
              </div>
            ) : (
              <OnboardingRadar phase={phase} />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  async function handleRegister() {
    try {
      const config = JSON.stringify({
        ...answers,
        competitors_list: (answers.competitors || "").split(",").map((c: string) => c.trim()),
      })
      const result = await api.saas.register({ url, name: name || undefined, config })
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
}

function StepURL({ url, setUrl, name, setName, error, onNext }: any) {
  return <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
    <div className="text-center">
      <h2 className="text-xl font-bold text-foreground">¿Cuál es tu SaaS?</h2>
      <p className="text-muted text-sm mt-1">Ingresa la URL para un análisis profundo con IA</p>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">URL de tu SaaS</label>
        <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal/30 transition-all"
          placeholder="https://tu-saas.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Nombre (opcional)</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal/30 transition-all"
          placeholder="Mi SaaS" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={onNext} className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
        Continuar →
      </button>
    </div>
  </div>
}

function StepQuestions({ answers, setAnswers, error, setError, onNext }: any) {
  return <div className="space-y-5 animate-[fade-in-up_0.4s_ease-out]">
    <div className="text-center">
      <h2 className="text-xl font-bold text-foreground">Cuéntanos más</h2>
      <p className="text-muted text-sm mt-1">Para leads más precisos</p>
    </div>
    <div className="space-y-4">
      {QUESTIONS.map((q: any) => (
        <div key={q.id}>
          <label className="block text-xs font-medium text-foreground mb-1">{q.label}</label>
          <textarea value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal resize-none text-sm"
            placeholder={q.placeholder} rows={2} />
        </div>
      ))}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={onNext} className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
        Iniciar Análisis →
      </button>
    </div>
  </div>
}

function StepLoading({ phase, progress, error }: any) {
  return <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out] text-center py-8">
    <h2 className="text-xl font-bold text-foreground">Analizando tu producto</h2>
    <p className="text-muted text-sm">Nuestros agentes están trabajando...</p>
    <div className="w-full bg-deep rounded-full h-3 overflow-hidden">
      <div className="h-full bg-signal rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
    </div>
    <div>
      <p className="text-foreground font-medium">{phase === "crawling" ? "🔍 Escaneando sitio web..." : phase === "analyzing" ? "🧠 Procesando con IA..." : phase === "scanning" ? "🎯 Analizando mercado..." : "✅ Completado"}</p>
    </div>
    <div className="flex justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-3 h-3 rounded-full bg-signal/60 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
    {error && <p className="text-red-400 text-sm">{error}</p>}
  </div>
}

function StepResults({ analysis, onNext }: any) {
  const renderList = (field: string) => {
    try { return JSON.parse(analysis?.[field] || "[]") }
    catch { return typeof analysis?.[field] === "string" ? [analysis[field]] : [] }
  }
  const painPoints = renderList("pain_points")
  const competitors = renderList("competitors")

  return <div className="space-y-5 animate-[fade-in-up_0.5s_ease-out]">
    <div className="text-center">
      <div className="text-3xl mb-2">📊</div>
      <h2 className="text-xl font-bold text-foreground">Análisis completado</h2>
    </div>
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      <div className="p-3 rounded-lg bg-deep border border-border">
        <p className="text-xs text-muted mb-0.5">Producto</p>
        <p className="text-foreground font-medium text-sm">{analysis?.name}</p>
        <p className="text-foreground text-xs mt-1">{analysis?.description}</p>
      </div>
      {painPoints.length > 0 && <TagCard title="Pain Points" items={painPoints} color="red" />}
      {competitors.length > 0 && <TagCard title="Competidores" items={competitors} color="yellow" />}
      {analysis?.icp_description && <InfoCard label="Cliente ideal" value={analysis.icp_description} />}
      {analysis?.tone && <InfoCard label="Tono" value={analysis.tone} />}
    </div>
    <button onClick={onNext} className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
      Continuar →
    </button>
  </div>
}

function StepDone({ analysis, answers, onDashboard }: any) {
  return <div className="space-y-6 text-center animate-[fade-in-up_0.5s_ease-out]">
    <div className="text-5xl animate-bounce">🎉</div>
    <h2 className="text-xl font-bold text-foreground">¡SignalPulse está trabajando!</h2>
    <p className="text-muted text-sm">Agentes buscando leads en Reddit, X y Product Hunt.</p>
    <div className="bg-deep rounded-lg p-4 text-left text-xs text-muted space-y-2 border border-border">
      <p className="text-foreground font-medium text-sm">Resumen:</p>
      <p>📌 SaaS: <span className="text-foreground">{analysis?.name}</span></p>
      <p>🎯 Keywords: <span className="text-foreground">{answers.keywords}</span></p>
      <p>👥 ICP: <span className="text-foreground">{answers.icp}</span></p>
    </div>
    <button onClick={onDashboard} className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
      Ir al Dashboard →
    </button>
  </div>
}

function InfoCard({ label, value }: any) {
  if (!value) return null
  return <div className="p-3 rounded-lg bg-deep border border-border">
    <p className="text-xs text-muted mb-0.5">{label}</p>
    <p className="text-foreground text-sm">{value}</p>
  </div>
}

function TagCard({ title, items, color }: any) {
  const colors: Record<string, string> = { red: "bg-red-900/30 text-red-400", yellow: "bg-yellow-900/30 text-yellow-400", green: "bg-green-900/30 text-green-400", signal: "bg-signal/20 text-signal" }
  const c = colors[color] || colors.signal
  return <div className="p-3 rounded-lg bg-deep border border-border">
    <p className="text-xs text-muted mb-2">{title}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map((i: string) => <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${c}`}>{i}</span>)}
    </div>
  </div>
}
