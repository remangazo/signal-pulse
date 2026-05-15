"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

type Step = 1 | 2 | 3 | 4
type Phase = "idle" | "crawling" | "analyzing" | "scanning" | "complete"

const PHASE_MESSAGES: Record<Phase, { label: string; detail: string }> = {
  idle: { label: "", detail: "" },
  crawling: { label: "Analizando tu sitio web", detail: "Accediendo a tu landing page..." },
  analyzing: { label: "Procesando información", detail: "Extrayendo propuesta de valor, pain points y mercado..." },
  scanning: { label: "Escaneando competencia", detail: "Identificando competidores y oportunidades..." },
  complete: { label: "Análisis completo", detail: "Resultados listos" },
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
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

  const handleRegisterSaaS = async () => {
    if (!url) return
    setError("")
    setLoading(true)
    setProgress(10)
    setPhase("crawling")

    setTimeout(() => setPhase("analyzing"), 3000)
    setTimeout(() => setPhase("scanning"), 6000)

    try {
      const result = await api.saas.register({ url, name: name || undefined })
      setAnalysis(result)
      setPhase("complete")
      setProgress(100)
      await new Promise((r) => setTimeout(r, 800))
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Error al analizar SaaS")
    } finally {
      setLoading(false)
    }
  }

  const competitors = analysis?.competitors
    ? (() => { try { return JSON.parse(analysis.competitors) } catch { return [] } })()
    : []
  const painPoints = analysis?.pain_points
    ? (() => { try { return JSON.parse(analysis.pain_points) } catch { return [] } })()
    : []
  const features = analysis?.key_features
    ? (() => { try { return JSON.parse(analysis.key_features) } catch { return [] } })()
    : []
  const industries = analysis?.industries
    ? (() => { try { return JSON.parse(analysis.industries) } catch { return [] } })()
    : []
  const searchTriggers = analysis?.search_triggers
    ? (() => { try { return JSON.parse(analysis.search_triggers) } catch { return [] } })()
    : []

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  step === s
                    ? "bg-signal text-deep scale-110"
                    : step > s
                      ? "bg-signal/30 text-signal"
                      : "bg-deep-card text-muted border border-border"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 transition-all duration-500 ${step > s ? "bg-signal" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-deep-card rounded-2xl border border-border p-8 transition-all duration-500">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">¿Cuál es tu SaaS?</h2>
                <p className="text-muted text-sm mt-1">Ingresa la URL para que nuestros agentes lo analicen en profundidad</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL de tu SaaS</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal disabled:opacity-50 transition"
                    placeholder="https://tu-saas.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre (opcional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal disabled:opacity-50 transition"
                    placeholder="Mi SaaS"
                  />
                </div>

                {loading && (
                  <div className="space-y-4 py-4">
                    <div className="w-full bg-deep rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-signal rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-foreground font-medium">
                        {PHASE_MESSAGES[phase]?.label || "Analizando..."}
                      </p>
                      <p className="text-muted text-sm mt-1">
                        {PHASE_MESSAGES[phase]?.detail || ""}
                      </p>
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-signal/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {error && !loading && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  onClick={handleRegisterSaaS}
                  disabled={loading || !url}
                  className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition disabled:opacity-50"
                >
                  {loading ? "Analizando..." : "Analizar SaaS"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && analysis && (
            <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Análisis de mercado completado</h2>
                <p className="text-muted text-sm mt-1">El Cartographer analizó tu producto en profundidad</p>
              </div>

              <div className="grid gap-4">
                <InfoCard label="Nombre" value={analysis.name} />
                <InfoCard label="Tagline" value={analysis.tagline || analysis.description} />
                <InfoCard label="Descripción" value={analysis.description} />

                {analysis.tone && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Tono de comunicación</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-signal/20 text-signal capitalize">{analysis.tone}</span>
                  </div>
                )}

                {industries.length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Industrias</p>
                    <div className="flex flex-wrap gap-2">
                      {industries.map((i: string) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-teal/20 text-teal">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {painPoints.length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Pain Points detectados</p>
                    <ul className="space-y-1">
                      {painPoints.map((p: string) => (
                        <li key={p} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Características clave</p>
                    <div className="flex flex-wrap gap-2">
                      {features.map((f: string) => (
                        <span key={f} className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {competitors.length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Competidores identificados</p>
                    <div className="flex flex-wrap gap-2">
                      {competitors.map((c: string) => (
                        <span key={c} className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {searchTriggers.length > 0 && (
                  <div className="p-4 rounded-lg bg-deep border border-border">
                    <p className="text-sm text-muted mb-2">Keywords para búsqueda de leads</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTriggers.map((t: string) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-signal/20 text-signal">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.icp_description && (
                  <InfoCard label="Perfil de cliente ideal" value={analysis.icp_description} />
                )}
              </div>

              <button onClick={() => setStep(3)} className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                Continuar
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-[fade-in-up_0.5s_ease-out]">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Fuentes de búsqueda</h2>
                <p className="text-muted text-sm mt-1">Configuramos la detección de leads automáticamente</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Reddit", active: true, desc: "Foros, comunidades, AMAs" },
                  { name: "X / Twitter", active: true, desc: "Tweets, replies, threads" },
                  { name: "Product Hunt", active: true, desc: "Lanzamientos, comments" },
                  { name: "Hacker News", active: false, desc: "Show HN, Ask HN" },
                  { name: "LinkedIn", active: false, desc: "Posts, comentarios" },
                ].map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-deep border border-border"
                  >
                    <div>
                      <span className="text-foreground text-sm">{source.name}</span>
                      <p className="text-xs text-muted">{source.desc}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        source.active ? "bg-green-900/30 text-green-400" : "bg-deep-card text-muted"
                      }`}
                    >
                      {source.active ? "Activo" : "Próximamente"}
                    </span>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(4)} className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                Siguiente
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center animate-[fade-in-up_0.5s_ease-out]">
              <div className="text-5xl animate-bounce">🎉</div>
              <h2 className="text-xl font-bold text-foreground">¡Todo listo!</h2>
              <p className="text-muted">
                Tu SaaS ha sido registrado. Los agentes de IA comenzarán a buscar leads en las fuentes configuradas.
                Recibirás notificaciones en Telegram cuando encontremos oportunidades.
              </p>
              <div className="bg-deep rounded-lg p-4 text-left text-sm text-muted space-y-2">
                <p className="text-foreground font-medium">Resumen del análisis:</p>
                <p>📌 <strong>SaaS:</strong> {analysis?.name}</p>
                <p>🎯 <strong>ICP:</strong> {analysis?.icp_description || analysis?.description}</p>
                <p>🔍 <strong>Keywords:</strong> {searchTriggers.slice(0, 5).join(", ")}</p>
                <p>📊 <strong>Competidores:</strong> {competitors.join(", ") || "Ninguno detectado"}</p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition"
              >
                Ir al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="p-4 rounded-lg bg-deep border border-border">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  )
}
