const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://signal-pulse-backend.onrender.com"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.detail || res.statusText, res.status)
  }

  return res.json()
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; telegram_chat_id?: string }) =>
      request<{ id: string; email: string; name: string; telegram_chat_id?: string; is_active: boolean; created_at: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string; name?: string }) =>
      request<{ access_token: string; token_type: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  saas: {
    register: (data: { url: string; name?: string }) =>
      request<{ id: string; url: string; name: string; description: string; tone: string; competitors: string; pain_points: string; status: string }>("/saas/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: () =>
      request<Array<{ id: string; url: string; name: string; description: string; status: string; created_at: string }>>("/saas/"),
    get: (id: string) =>
      request<{ id: string; url: string; name: string; description: string; tone: string; competitors: string; pain_points: string; status: string; created_at: string }>(`/saas/${id}`),
  },
  leads: {
    list: (saasId: string) =>
      request<Array<{ id: string; saas_id: string; name: string; source: string; summary: string; intent_score: number; status: string; created_at: string }>>(`/leads/${saasId}`),
  },
  stats: {
    overview: () =>
      request<{ total_saas: number; total_leads: number; new_leads: number; pipeline_runs: number; avg_intent_score: number; last_pipeline_run: string | null }>("/saas/stats/overview"),
  },
}
