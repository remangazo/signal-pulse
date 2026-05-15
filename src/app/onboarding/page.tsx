"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { OnboardingRadar } from "@/components/sections/onboarding-radar"
import { Pencil, Plus, X } from "lucide-react"
import type { Phase } from "@/components/sections/onboarding-radar"

type Step = 1 | 2 | 3 | 4 | 5

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [scan, setScan] = useState({ name: "", description: "", problem: "", audience: "" })
  const [editing, setEditing] = useState({ name: true, description: true, problem: true })
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  const [customCompetitor, setCustomCompetitor] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 6, 95))
    }, 600)
    return () => clearInterval(interval)
  }, [loading])

  const steps = [1, 2, 3, 4, 5] as Step[]

  async function handleQuickScan() {
    if (!url) { setError("Ingresa una URL"); return }
    setError(""); setLoading(true); setPhase("crawling")
    try {
      const res = await api.saas.quickScan({ url, name: name || undefined })
      setScan(res)
      setPhase("complete")
      setProgress(100)
      await new Promise((r) => setTimeout(r, 500))
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Error al escanear")
    } finally {
      setLoading(false); setPhase("idle")
    }
  }

  async function handleDeepAnalysis() {
    setStep(3); setLoading(true); setPhase("crawling")
    setTimeout(() => setPhase("analyzing"), 4000)
    setTimeout(() => setPhase("scanning"), 9000)
    try {
      const config = JSON.stringify({
        description: scan.description,
        problem: scan.problem,
        audience: scan.audience,
        name: scan.name,
      })
      const result = await api.saas.register({ url, name: name || undefined, config })
      setAnalysis(result)
      setPhase("complete"); setProgress(100)
      await new Promise((r) => setTimeout(r, 800))
      setStep(4)
    } catch (err: any) {
      setError(err.message || "Error en análisis")
    } finally {
      setLoading(false)
    }
  }

  const discoveredCompetitors: string[] = (() => {
    try { return JSON.parse(analysis?.competitors || "[]") } catch { return [] }
  })()

  const allCompetitors = [...new Set([...discoveredCompetitors, ...selectedCompetitors])]

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
            {step === 1 && (
              <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">¿Cuál es tu SaaS?</h2>
                  <p className="text-muted text-sm mt-1">Ingresa tu URL. Analizaremos tu sitio automáticamente.</p>
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
                  {loading ? (
                    <div className="space-y-3 text-center py-4">
                      <div className="w-full bg-deep rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-signal rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-sm text-muted">Escaneando tu sitio web...</p>
                    </div>
                  ) : (
                    <button onClick={handleQuickScan} className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
                      Analizar sitio →
                    </button>
                  )}
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-[fade-in-up_0.4s_ease-out]">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">Revisa los datos</h2>
                  <p className="text-muted text-sm mt-1">Analizamos tu sitio. Edita si es necesario.</p>
                </div>
                <div className="space-y-4">
                  <EditableField label="Project Name" value={scan.name} editing={editing.name}
                    onToggle={() => setEditing({ ...editing, name: !editing.name })}
                    onChange={(v) => setScan({ ...scan, name: v })} />
                  <EditableField label="¿Qué hace tu producto?" value={scan.description} editing={editing.description}
                    onToggle={() => setEditing({ ...editing, description: !editing.description })}
                    onChange={(v) => setScan({ ...scan, description: v })} />
                  <EditableField label="¿Qué problema resuelve?" value={scan.problem} editing={editing.problem}
                    onToggle={() => setEditing({ ...editing, problem: !editing.problem })}
                    onChange={(v) => setScan({ ...scan, problem: v })} />
                </div>
                <button onClick={handleDeepAnalysis}
                  className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
                  Iniciar análisis profundo →
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out] text-center py-8">
                <h2 className="text-xl font-bold text-foreground">Configurando tu proyecto</h2>
                <div className="w-full bg-deep rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-signal rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  {[
                    { icon: "💾", label: "Guardando proyecto", phase: "crawling" as const },
                    { icon: "⚙️", label: "Optimizando información", phase: "crawling" as const },
                    { icon: "🌐", label: "Buscando comunidades relevantes", phase: "analyzing" as const },
                    { icon: "👥", label: "Analizando competidores", phase: "scanning" as const },
                    { icon: "🔑", label: "Generando keywords de búsqueda", phase: "scanning" as const },
                  ].map((item) => (
                    <div key={item.label}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
                        phase === item.phase || (phase === "complete") ? "bg-signal/10 text-foreground" : "text-muted"
                      }`}>
                      <span className={phase === item.phase ? "animate-bounce" : ""}>{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                      {(phase === item.phase || (phase === "complete" && item.icon !== "🔑")) && (
                        <span className="ml-auto text-xs text-signal">{phase === "complete" ? "✓" : "..."}</span>
                      )}
                    </div>
                  ))}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 animate-[fade-in-up_0.5s_ease-out]">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">Selecciona tus competidores</h2>
                  <p className="text-muted text-sm mt-1">Elige hasta 5 para monitorear</p>
                </div>
                <div className="space-y-2">
                  {discoveredCompetitors.length === 0 && !customCompetitor && (
                    <p className="text-sm text-muted text-center py-4">No se encontraron competidores automáticamente</p>
                  )}
                  {allCompetitors.map((c) => (
                    <div key={c}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCompetitors.includes(c) ? "bg-signal/10 border-signal/30" : "bg-deep border-border hover:border-signal/20"
                      }`}
                      onClick={() => {
                        if (selectedCompetitors.includes(c)) {
                          setSelectedCompetitors(selectedCompetitors.filter((x) => x !== c))
                        } else if (selectedCompetitors.length < 5) {
                          setSelectedCompetitors([...selectedCompetitors, c])
                        }
                      }}>
                      <span className="text-sm text-foreground">{c}</span>
                      {selectedCompetitors.includes(c) && <span className="text-signal text-xs">✓</span>}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="text" value={customCompetitor}
                      onChange={(e) => setCustomCompetitor(e.target.value)}
                      placeholder="Agregar competidor manualmente"
                      className="flex-1 px-3 py-2 rounded-lg bg-deep border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-signal"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customCompetitor.trim()) {
                          if (!allCompetitors.includes(customCompetitor.trim()) && selectedCompetitors.length < 5) {
                            setSelectedCompetitors([...selectedCompetitors, customCompetitor.trim()])
                          }
                          setCustomCompetitor("")
                        }
                      }} />
                    <button onClick={() => {
                      if (customCompetitor.trim() && !allCompetitors.includes(customCompetitor.trim()) && selectedCompetitors.length < 5) {
                        setSelectedCompetitors([...selectedCompetitors, customCompetitor.trim()])
                        setCustomCompetitor("")
                      }
                    }} className="px-3 py-2 rounded-lg bg-signal/20 text-signal hover:bg-signal/30 transition">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button onClick={() => setStep(5)} disabled={selectedCompetitors.length === 0}
                  className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {selectedCompetitors.length > 0 ? `Continuar (${selectedCompetitors.length} seleccionados)` : "Selecciona al menos 1"}
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 text-center animate-[fade-in-up_0.5s_ease-out]">
                <div className="text-5xl animate-bounce">🎉</div>
                <h2 className="text-xl font-bold text-foreground">¡SignalPulse está trabajando!</h2>
                <p className="text-muted text-sm">Agentes buscando leads en Reddit, X y Product Hunt.</p>
                <div className="bg-deep rounded-lg p-4 text-left text-xs text-muted space-y-2 border border-border">
                  <p className="text-foreground font-medium text-sm">Resumen:</p>
                  <p>📌 Producto: <span className="text-foreground">{scan.name}</span></p>
                  <p>🎯 Description: <span className="text-foreground">{scan.description}</span></p>
                  <p>👥 Competidores: <span className="text-foreground">{selectedCompetitors.join(", ") || "N/A"}</span></p>
                </div>
                <button onClick={() => router.push("/dashboard")}
                  className="w-full py-3 rounded-lg bg-signal text-deep font-bold hover:brightness-110 transition-all active:scale-[0.98]">
                  Ir al Dashboard →
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center justify-center bg-deep-card/50 rounded-2xl border border-border p-6 min-h-[450px]">
            {step <= 2 && (
              <div className="text-center space-y-6">
                <div className="text-6xl">📡</div>
                <h3 className="text-lg font-bold text-foreground">Análisis con IA</h3>
                <ul className="text-sm text-muted space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Firecrawl extrae contenido de tu sitio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Groq LLM analiza producto y mercado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Detección de competidores y keywords</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal mt-0.5">◆</span>
                    <span>Búsqueda en comunidades relevantes</span>
                  </li>
                </ul>
              </div>
            )}
            {(step === 3 || step === 4 || step === 5) && <OnboardingRadar phase={phase} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function EditableField({ label, value, editing, onToggle, onChange }: { label: string; value: string; editing: boolean; onToggle: () => void; onChange: (v: string) => void }) {
  return (
    <div className="p-3 rounded-lg bg-deep border border-border">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-muted">{label}</label>
        <button onClick={onToggle} className="text-muted hover:text-signal transition">
          <Pencil size={14} />
        </button>
      </div>
      {editing ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-foreground text-sm border border-signal/30 rounded px-2 py-1 resize-none focus:outline-none"
          rows={2} />
      ) : (
        <p className="text-foreground text-sm">{value || "—"}</p>
      )}
    </div>
  )
}
