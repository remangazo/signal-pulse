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
    const detail = body.detail
    const message = Array.isArray(detail) ? detail.map((d: any) => d.msg || d.message).join(", ") : detail || res.statusText
    throw new ApiError(message, res.status)
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
    quickScan: (data: { url: string; name?: string }) =>
      request<{ name: string; description: string; problem: string; audience: string }>("/saas/quick-scan", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    register: (data: { url: string; name?: string; config?: string; user_id?: string }) =>
      request<{ id: string; url: string; name: string; description: string; tone: string; competitors: string; pain_points: string; config?: string; status: string }>("/saas/register", {
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
      request<Array<{ id: string; saas_id: string; author: string; source: string; source_url: string; content: string; intent_score: number; pain_points: string; suggested_reply: string; status: string; user_rating: number | null; created_at: string }>>(`/leads/${saasId}`),
    updateStatus: (leadId: string, status: string) =>
      request<{ status: string }>(`/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
  stats: {
    overview: () =>
      request<{ total_saas: number; total_leads: number; new_leads: number; pipeline_runs: number; avg_intent_score: number; last_pipeline_run: string | null }>("/saas/stats/overview"),
  },
}
