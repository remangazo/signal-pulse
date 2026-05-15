"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { token, logout } = useAuth()
  const [saasList, setSaasList] = useState<any[]>([])
  const [leadsMap, setLeadsMap] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const list = await api.saas.list()
        setSaasList(list)
        const map: Record<string, any[]> = {}
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
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <button onClick={logout} className="text-sm text-muted hover:text-foreground transition">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="space-y-8">
            {saasList.map((saas) => (
              <div key={saas.id} className="bg-deep-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{saas.name}</h2>
                    <p className="text-sm text-muted">{saas.url}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    saas.status === "active" ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {saas.status}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="text-left py-2 px-3">Nombre</th>
                        <th className="text-left py-2 px-3">Fuente</th>
                        <th className="text-left py-2 px-3">Score</th>
                        <th className="text-left py-2 px-3">Estado</th>
                        <th className="text-left py-2 px-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(leadsMap[saas.id] || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted">
                            Aún no hay leads. Los agentes están buscando...
                          </td>
                        </tr>
                      ) : (
                        (leadsMap[saas.id] || []).map((lead) => (
                          <tr key={lead.id} className="border-b border-border/50 hover:bg-deep/50 transition">
                            <td className="py-2.5 px-3 text-foreground">{lead.name}</td>
                            <td className="py-2.5 px-3 text-muted">{lead.source}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                lead.intent_score >= 7 ? "bg-green-900/30 text-green-400" :
                                lead.intent_score >= 4 ? "bg-yellow-900/30 text-yellow-400" :
                                "bg-red-900/30 text-red-400"
                              }`}>
                                {lead.intent_score}/10
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-muted capitalize">{lead.status}</td>
                            <td className="py-2.5 px-3 text-muted">{new Date(lead.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
