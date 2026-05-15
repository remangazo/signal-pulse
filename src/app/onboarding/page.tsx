"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegisterSaaS = async () => {
    if (!url) return
    setError("")
    setLoading(true)
    try {
      const result = await api.saas.register({ url, name: name || undefined })
      setAnalysis(result)
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Error al registrar SaaS")
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step === s
                    ? "bg-signal text-deep"
                    : step > s
                      ? "bg-signal/30 text-signal"
                      : "bg-deep-card text-muted border border-border"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${step > s ? "bg-signal" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-deep-card rounded-2xl border border-border p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">¿Cuál es tu SaaS?</h2>
                <p className="text-muted text-sm mt-1">Ingresa la URL de tu producto para que lo analicemos</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL de tu SaaS</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
                    placeholder="https://tu-saas.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre (opcional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
                    placeholder="Mi SaaS"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

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
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Análisis completado</h2>
                <p className="text-muted text-sm mt-1">El Cartographer analizó tu producto</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-deep border border-border">
                  <p className="text-sm text-muted">Descripción</p>
                  <p className="text-foreground">{analysis.description}</p>
                </div>

                <div className="p-4 rounded-lg bg-deep border border-border">
                  <p className="text-sm text-muted">Tono de comunicación</p>
                  <p className="text-foreground capitalize">{analysis.tone}</p>
                </div>

                <div className="p-4 rounded-lg bg-deep border border-border">
                  <p className="text-sm text-muted">Competidores</p>
                  <p className="text-foreground">
                    {analysis.competitors ? JSON.parse(analysis.competitors).join(", ") : "Ninguno detectado"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-deep border border-border">
                  <p className="text-sm text-muted">Pain Points</p>
                  <p className="text-foreground">
                    {analysis.pain_points ? JSON.parse(analysis.pain_points).join(", ") : "Ninguno detectado"}
                  </p>
                </div>
              </div>

              <button onClick={() => setStep(3)} className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition">
                Continuar
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Fuentes de búsqueda</h2>
                <p className="text-muted text-sm mt-1">Configuraremos la búsqueda de leads automáticamente</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Twitter / X", active: true },
                  { name: "Reddit", active: true },
                  { name: "Product Hunt", active: true },
                  { name: "Hacker News", active: false },
                  { name: "Foros especializados", active: false },
                ].map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-deep border border-border"
                  >
                    <span className="text-foreground">{source.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
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
            <div className="space-y-6 text-center">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-bold text-foreground">¡Todo listo!</h2>
              <p className="text-muted">
                Tu SaaS ha sido registrado. Los agentes de IA comenzarán a buscar leads automáticamente.
                Recibirás notificaciones en Telegram cuando encontremos oportunidades.
              </p>
              <button
                onClick={handleFinish}
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
