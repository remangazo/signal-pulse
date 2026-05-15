"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

type Lead = any
type SaaS = any

export default function DashboardPage() {
  const { token, logout } = useAuth()
  const [saasList, setSaasList] = useState<SaaS[]>([])
  const [leadsMap, setLeadsMap] = useState<Record<string, Lead[]>>({})
  const [svrStats, setSvrStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSaas, setSelectedSaas] = useState<string | "all">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreMin, setScoreMin] = useState(0)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const [list, overview] = await Promise.all([api.saas.list(), api.stats.overview()])
        setSaasList(list)
        setSvrStats(overview)
        const map: Record<string, Lead[]> = {}
        for (const s of list) {
          const leads = await api.leads.list(s.id)
          map[s.id] = leads
        }
        setLeadsMap(map)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const allLeads = useMemo(() => {
    const leads: Lead[] = []
    for (const s of saasList) {
      for (const l of leadsMap[s.id] || []) {
        leads.push({ ...l, saasName: s.name })
      }
    }
    return leads
  }, [saasList, leadsMap])

  const filteredLeads = useMemo(() => {
    return allLeads.filter((l) => {
      if (selectedSaas !== "all" && l.saas_id !== selectedSaas) return false
      if (statusFilter !== "all" && l.status !== statusFilter) return false
      if ((l.intent_score || 0) < scoreMin) return false
      return true
    })
  }, [allLeads, selectedSaas, statusFilter, scoreMin])

  const chartData = useMemo(() => {
    const buckets: Record<string, number> = {}
    allLeads.forEach((l) => {
      const d = new Date(l.created_at).toLocaleDateString()
      buckets[d] = (buckets[d] || 0) + 1
    })
    const dates = Object.keys(buckets).sort()
    const max = Math.max(...Object.values(buckets), 1)
    return { dates, buckets, max }
  }, [allLeads])

  const scoreDist = useMemo(() => {
    const d = [0, 0, 0, 0]
    allLeads.forEach((l) => {
      const s = l.intent_score || 0
      if (s >= 8) d[3]++
      else if (s >= 5) d[2]++
      else if (s >= 2) d[1]++
      else d[0]++
    })
    return d
  }, [allLeads])

  if (!token) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted">Inicia sesión para ver tu dashboard</p>
          <Link href="/auth/login" className="inline-block py-2 px-6 rounded-lg bg-signal text-deep font-semibold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep">
      <header className="border-b border-border sticky top-0 bg-deep/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">📊 SignalPulse</h1>
            <Link href="/onboarding" className="text-xs text-signal hover:underline">+ Nuevo SaaS</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{saasList.length} SaaS activos</span>
            <button onClick={logout} className="text-xs text-muted hover:text-foreground transition">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-signal border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm mt-3">Cargando...</p>
          </div>
        ) : saasList.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">📡</div>
            <p className="text-muted">Aún no has registrado ningún SaaS</p>
            <Link href="/onboarding" className="inline-block py-2 px-6 rounded-lg bg-signal text-deep font-semibold">
              Registrar SaaS
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Leads", value: allLeads.length, color: "text-foreground", icon: "👥" },
                { label: "Pipeline Runs", value: svrStats?.pipeline_runs || 0, color: "text-signal", icon: "🔄" },
                { label: "Score Promedio", value: svrStats?.avg_intent_score || "-", color: "text-teal", icon: "🎯" },
                { label: "Nuevos (hoy)", value: allLeads.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: "text-green-400", icon: "✨" },
              ].map((s) => (
                <div key={s.label} className="bg-deep-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted">{s.label}</p>
                    <span>{s.icon}</span>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-deep-card rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-3">📈 Leads por día</p>
                {chartData.dates.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6">Aún no hay datos</p>
                ) : (
                  <div className="flex items-end gap-1.5 h-24">
                    {chartData.dates.slice(-7).map((d) => (
                      <div key={d} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-signal/60 rounded-t hover:bg-signal transition cursor-pointer"
                          style={{ height: `${(chartData.buckets[d] / chartData.max) * 100}%` }}
                          title={`${d}: ${chartData.buckets[d]} leads`}
                        />
                        <span className="text-[10px] text-muted">{d.slice(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-deep-card rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-3">🎯 Distribución de scores</p>
                <div className="space-y-2">
                  {[
                    { label: "Bajo (0-2)", value: scoreDist[0], color: "bg-red-500/60" },
                    { label: "Medio (3-4)", value: scoreDist[1], color: "bg-yellow-500/60" },
                    { label: "Alto (5-7)", value: scoreDist[2], color: "bg-signal/60" },
                    { label: "Caliente (8+)", value: scoreDist[3], color: "bg-green-500/60" },
                  ].map((b) => {
                    const total = scoreDist.reduce((a, c) => a + c, 0) || 1
                    return (
                      <div key={b.label} className="flex items-center gap-2">
                        <span className="text-xs text-muted w-20">{b.label}</span>
                        <div className="flex-1 bg-deep rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${b.color} transition-all duration-500`} style={{ width: `${(b.value / total) * 100}%` }} />
                        </div>
                        <span className="text-xs text-foreground w-6 text-right">{b.value}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select value={selectedSaas} onChange={(e) => setSelectedSaas(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-deep border border-border text-foreground text-xs">
                <option value="all">Todos los SaaS</option>
                {saasList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-deep border border-border text-foreground text-xs">
                <option value="all">Todos los estados</option>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="qualified">Calificado</option>
              </select>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span>Score:</span>
                <input type="range" min={0} max={10} value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value))} className="w-20" />
                <span className="text-foreground font-medium w-3">{scoreMin}+</span>
              </div>
              <span className="text-xs text-muted ml-auto">{filteredLeads.length} resultados</span>
            </div>

            <div className="space-y-2">
              {filteredLeads.length === 0 ? (
                <p className="text-muted text-center py-8 text-sm">No hay leads con esos filtros</p>
              ) : (
                filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-deep-card rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface/50 transition"
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          (lead.intent_score || 0) >= 7 ? "bg-green-900/30 text-green-400" :
                          (lead.intent_score || 0) >= 4 ? "bg-yellow-900/30 text-yellow-400" :
                          "bg-red-900/30 text-red-400"
                        }`}>{lead.intent_score || "?"}</div>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{lead.author || "Anónimo"}</p>
                          <p className="text-xs text-muted truncate">{lead.saasName} · {lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          lead.status === "new" ? "bg-signal/20 text-signal" :
                          lead.status === "contacted" ? "bg-blue-900/30 text-blue-400" :
                          lead.status === "qualified" ? "bg-green-900/30 text-green-400" : "bg-deep-card text-muted"
                        }`}>{lead.status}</span>
                        <span className="text-[10px] text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {expandedLead === lead.id && (
                      <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                        <p className="text-xs text-foreground bg-deep rounded-lg p-2">{lead.content}</p>
                        {lead.suggested_reply && (
                          <div>
                            <p className="text-[10px] text-muted mb-0.5">✍️ Respuesta sugerida:</p>
                            <p className="text-xs text-foreground bg-deep rounded-lg p-2 italic">{lead.suggested_reply}</p>
                          </div>
                        )}
                        <div className="flex gap-1.5 flex-wrap">
                          <button className="px-2 py-1 text-[10px] rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition">✅ Contactado</button>
                          <button className="px-2 py-1 text-[10px] rounded-lg bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 transition">⭐ Calificar</button>
                          <button className="px-2 py-1 text-[10px] rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition">🗑️ Descartar</button>
                          {lead.source_url && (
                            <a href={lead.source_url} target="_blank" rel="noopener noreferrer"
                              className="px-2 py-1 text-[10px] rounded-lg bg-signal/20 text-signal hover:bg-signal/30 transition">🔗 Ver fuente</a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
