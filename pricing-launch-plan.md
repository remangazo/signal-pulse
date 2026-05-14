# SignalPulse AI — Pricing & Launch Plan

## 1. Pricing Strategy (Basada en ConvoHunter + Diferenciales)

### Fase 1 (Lanzamiento — primeros 6 meses): Precio Único

| Plan | Precio | Incluye |
|---|---|---|
| **Founder** | **$29/mes** | 1 SaaS, Reddit + X, leads ilimitados, drafts de respuesta AI, email diario |
| | o $290/año ($24/mes) | |

**Por qué precio único:**
- ConvoHunter cobra $26/mes sin drafts de respuesta. Nosotros cobramos $29 con drafts. Lo mismo + un feature clave por $3 más.
- Sin fricción de decisión ("qué plan elijo")
- Baja la barrera de entrada — $29 es "un café por día laboral"
- Un solo lead cerrado paga el año entero

**Riesgo mitigado**: Si el volumen de leads no escala para clientes grandes, el precio único hace que todos reciban el mismo servicio sin quejarse de "no me alcanzan los leads del plan".

### Fase 2 (post Product-Market Fit, mes 7+): Tiers

| Plan | Precio | Leads promedio | Fuentes | Extra |
|---|---|---|---|---|
| **Starter** | $29/mes | ~30-50/mes | Reddit + X | Drafts de respuesta |
| **Growth** | $79/mes | ~100-200/mes | Reddit + X + TikTok/IG | + Competitor alerts |
| **Scale** | $199/mes | ~300-500/mes | Todas + LinkedIn | + Auto-sending (Smartlead) + API |
| **Enterprise** | Custom | Ilimitados | Todas + custom | + Feedback loop training, SLA, on-prem |

**Transición suave**: Los primeros 100 clientes en Founder se quedan en $29 vitalicio (grandfathering). Esto evita churn por cambio de precio y les da incentivo para quedarse.

### Comparativa competitiva

| Producto | Precio | Drafts AI | Auto-send | Multi-fuente | Feedback loop |
|---|---|---|---|---|---|
| **ConvoHunter** | $26/mes | ❌ | ❌ | ✅ Reddit/X/HN/LinkedIn | ❌ |
| **DemandHunter** | Custom (~$99+) | ✅ | ❌ | ❌ Solo LinkedIn | ❌ |
| **Awario** | $99/mes | ❌ | ❌ | ✅ | ❌ |
| **Brandwatch** | $800+/mes | ❌ | ❌ | ✅ | ❌ |
| **SignalPulse AI** | **$29/mes** | **✅** | **✅ (Scale)** | **✅** | **✅** |

**El sweet spot**: SignalPulse AI es el más barato ($29) con el feature set más completo para founders individuales.

---

## 2. Launch Plan (8 semanas a primer cliente pagando)

### Semana -2 a 0: Validación Cero Código (ahora mismo)

| Día | Acción |
|---|---|
| 1 | Crear landing page en Next.js + Vercel: "SignalPulse AI — Find SaaS customers already asking for you" |
| 2 | Agregar pricing: $29/mes, 3-day free trial, sin tarjeta |
| 3 | Postear en r/SaaS, r/indiebiz, r/Entrepreneur: "I built a tool that finds Reddit users who need your SaaS" |
| 4 | Postear en r/alphaandbetausers: "SignalPulse AI — beta testers wanted, free first month" |
| 5-7 | **Servicio manual**: Cuando alguien se registre, tú mismo buscas leads en Reddit/X y los envías por email. 0 automatización. |

**Meta**: 5-10 clientes pagando ($29 c/u) antes de escribir 1 línea de código de agentes.

### Semana 1-2: MVP Técnico Mínimo

| Qué construir | Stack |
|---|---|
| Auth (Google + magic link) | NextAuth.js + Supabase |
| Onboarding (solo URL del producto) | Formulario de 1 campo |
| Cartographer Agent (scrapea landing) | Firecrawl + Gemini Flash |
| Sentinel Agent (Reddit + X) | Apify SDK + Playwright |
| Dashboard básico (tabla de leads) | Next.js + shadcn/ui table |
| Email diario de leads | Resend + cron job |

**No construir**: TikTok/IG, auto-sending, feedback loop, analytics.

### Semana 3-4: Closed Beta (10 clientes pagando)

- Los 5-10 de la fase manual migran a la plataforma
- Feedback semanal con cada uno (15 min call)
- Métrica obsesiva: **ratio leads cerrados vs leads entregados**
- Ajustar prompts del Auditor basado en feedback real

### Semana 5-6: Público General

- Abrir registro sin invitación
- Postear caso de éxito del beta (con permiso): "Cómo Client X cerró 3 deals en 2 semanas"
- Product Hunt launch
- Post en Hacker News ("Show HN")

### Semana 7-8: Iterar

- Bugs, onboarding friction, churn analysis
- Métrica única a medir: **Día 30 retention rate**
- Si > 60% → seguir. Si < 40% → pivotear pricing o feature set

---

## 3. Canales de Adquisición (Costo Cero)

### Orgánico (prioridad)

| Canal | Táctica | Frecuencia |
|---|---|---|
| **Reddit** | Postear en r/SaaS, r/indiebiz, r/growmybusiness, r/EntrepreneurRideAlong | 2x/semana |
| **X** | Threads sobre "cómo conseguí mis primeros clientes" + tag a SignalPulse | 3x/semana |
| **Indie Hackers** | Post sobre "building in public" de SignalPulse AI | 1x/semana |
| **Medium/Dev.to** | "Cómo convertir usuarios de Reddit en clientes SaaS" | 1x/mes |
| **Hacker News** | Show HN cuando el MVP esté sólido | 1 vez |

### Viral Loop (built-in)

Cada lead que el usuario recibe incluye al final:
> "Know another founder who needs customers? Share SignalPulse AI → get 1 month free"

### Partnerships

- Afiliación con creadores de contenido SaaS (YouTube, newsletters)
- 30% comisión recurrente de por vida (LTR)
- Target: `SaaS Growth Newsletter`, `Indie Bites`, `Lenny's Podcast` (sponsorships chicos)

---

## 4. Financial Model (Primer Año)

### Costos Fijos Mensuales

| Item | Costo |
|---|---|
| VPS Hetzner CX32 (agentes + DB + Redis) | ~€15/mes |
| Vercel Pro | $20/mes |
| Apify (scraping) | ~$20-50/mes |
| Resend (emails) | $0-10/mes |
| Gemini/Claude API | ~$20-50/mes (escala con clientes) |
| **Total** | **~$75-145/mes** |

### Revenue Projection (conservadora)

| Mes | Clientes nuevos | MRR | Churn | Clientes totales | MRR total |
|---|---|---|---|---|---|
| 1 | 5 | $145 | 0% | 5 | $145 |
| 2 | 10 | $290 | 10% | 14 | $406 |
| 3 | 20 | $580 | 10% | 32 | $928 |
| 4 | 30 | $870 | 10% | 58 | $1,682 |
| 5 | 40 | $1,160 | 10% | 92 | $2,668 |
| 6 | 50 | $1,450 | 10% | 133 | $3,857 |
| 7 | 60 | $1,740 | 15% | 173 | $5,017 |
| 8 | 80 | $2,320 | 15% | 227 | $6,583 |
| 9 | 100 | $2,900 | 15% | 293 | $8,497 |
| 10 | 120 | $3,480 | 15% | 369 | $10,701 |
| 11 | 150 | $4,350 | 15% | 464 | $13,456 |
| 12 | 200 | $5,800 | 15% | 594 | $17,226 |

**Cashflow**: Mes 4 eres rentable ($1,682 MRR vs ~$500 costos operativos escalados).

---

## 5. Lo que NO hacer (lecciones de ConvoHunter y competidores)

| Error | Por qué evitarlo |
|---|---|
| **Empezar con tiers de precios** | Fricción innecesaria hasta que entiendas qué segmento paga |
| **Construir TikTok/IG antes de validar Reddit** | Código innecesario. Una fuente bien hecha > 5 fuentes mediocres |
| **Dashboard complejo** | ConvoHunter entrega leads por email y funciona. El dashboard es complementario |
| **Auto-sending desde el día 1** | Alto riesgo de quemar cuentas de clientes. Que ellos envíen manualmente al principio |
| **Fine-tuning de modelos** | Caro y lento. Mejor prompts bien escritos + feedback loop humano primero |
| **Mobile app** | Nadie va a gestionar leads desde el teléfono en B2B. Web-first |

---

## 6. La Meta Concreta

```
Semana 0: Landing page + servicio manual → 5 clientes a $29
Semana 4: MVP funcional (solo Reddit + X + drafts) → migrar beta
Semana 8: Abierto al público
Mes 6: 133 clientes → $3,857/mo MRR → rentable
Mes 12: 594 clientes → $17k/mo MRR → tiempo de pensar en Serie A o lifestyle business
```

**Con $29/mes y targeting founders individuales**, no necesitas 1000 clientes para vivir de esto. Con 200 clientes ($5,800/mes) ya superas cualquier sueldo de LATAM. Con 500 ($14,500/mes) es un negocio sólido.
