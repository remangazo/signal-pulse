"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(email, password, name, telegramChatId)
      router.push("/onboarding")
    } catch (err: any) {
      setError(err.message || "Error al registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-muted text-sm mt-1">Empieza a capturar leads con IA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-deep-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-deep-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-deep-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Telegram Chat ID <span className="text-muted font-normal">(para notificaciones)</span>
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-deep border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-signal"
              placeholder="Ej: 123456789"
            />
            <p className="text-xs text-muted mt-1">
              Habla con <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">@userinfobot</a> en Telegram para obtener tu ID numérico
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-signal text-deep font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-signal hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
