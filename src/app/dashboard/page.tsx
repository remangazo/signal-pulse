"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

type SaaS = any
type Lead = any

export default function DashboardPage() {
  const { token, logout } = useAuth()
  const [saasList, setSaasList] = useState<SaaS[]>([])
  const [leadsMap, setLeadsMap] = useState<Record<string, Lead[]>>({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
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
        setStats(overview)
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

  const localStats = useMemo(() => ({
    total: allLeads.length,
    high: allLeads.filter((l) => (l.intent_score || 0) >= 7).length,
    medium: allLeads.filter((l) => (l.intent_score || 0) >= 4 && (l.intent_score || 0) < 7).length,
    new: allLeads.filter((l) => l.status === "new").length,
  }), [allLeads])

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
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <Link href="/onboarding" className="text-sm text-signal hover:underline">
              + Nuevo SaaS
            </Link>
          </div>
          <button onClick={logout} className="text-sm text-muted hover:text-foreground transition">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <p className="text-muted text-center py-12">Cargando...</p>
        ) : saasList.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted">Aún no has registrado ningún SaaS</p>
            <Link href="/onboarding" className="inline-block py-2 px-6 rounded-lg bg-signal text-deep font-semibold">
              Registrar SaaS
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Leads", value: localStats.total, color: "text-foreground" },
                { label: "Alto interés (7+)", value: localStats.high, color: "text-green-400" },
                { label: "Pipeline Runs", value: stats?.pipeline_runs || 0, color: "text-signal" },
                { label: "Score Promedio", value: stats?.avg_intent_score || "-", color: "text-teal" },
              ].map((s) => (
                <div key={s.label} className="bg-deep-card rounded-xl border border-border p-4">
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {stats?.last_pipeline_run && (
              <p className="text-xs text-muted text-right">
                Último pipeline: {new Date(stats.last_pipeline_run).toLocaleString()}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedSaas}
                onChange={(e) => setSelectedSaas(e.target.value)}
                className="px-3 py-2 rounded-lg bg-deep border border-border text-foreground text-sm"
              >
                <option value="all">Todos los SaaS</option>
                {saasList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-deep border border-border text-foreground text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="qualified">Calificado</option>
                <option value="closed">Cerrado</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Score mínimo:</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={scoreMin}
                  onChange={(e) => setScoreMin(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-foreground font-medium w-4">{scoreMin}</span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <p className="text-muted text-center py-8">No hay leads con esos filtros</p>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-deep-card rounded-xl border border-border overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/50 transition"
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          (lead.intent_score || 0) >= 7 ? "bg-green-900/30 text-green-400" :
                          (lead.intent_score || 0) >= 4 ? "bg-yellow-900/30 text-yellow-400" :
                          "bg-red-900/30 text-red-400"
                        }`}>
                          {lead.intent_score || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-medium truncate">{lead.author || "Anónimo"}</p>
                          <p className="text-xs text-muted truncate">{lead.saasName} · {lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lead.status === "new" ? "bg-signal/20 text-signal" :
                          lead.status === "contacted" ? "bg-blue-900/30 text-blue-400" :
                          lead.status === "qualified" ? "bg-green-900/30 text-green-400" :
                          "bg-deep-card text-muted"
                        }`}>
                          {lead.status}
                        </span>
                        <span className="text-xs text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {expandedLead === lead.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <p className="text-sm text-foreground bg-deep rounded-lg p-3">{lead.content}</p>

                        {lead.suggested_reply && (
                          <div>
                            <p className="text-xs text-muted mb-1">Respuesta sugerida:</p>
                            <p className="text-sm text-foreground bg-deep rounded-lg p-3 italic">{lead.suggested_reply}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 text-xs rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition">
                            Marcar contactado
                          </button>
                          <button className="px-3 py-1.5 text-xs rounded-lg bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 transition">
                            Calificar
                          </button>
                          <button className="px-3 py-1.5 text-xs rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition">
                            Descartar
                          </button>
                          {lead.source_url && (
                            <a
                              href={lead.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-lg bg-signal/20 text-signal hover:bg-signal/30 transition"
                            >
                              Ver fuente
                            </a>
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
