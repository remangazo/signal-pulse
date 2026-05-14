Proyecto: SignalPulse AI
"Turning Shipped Products into Profitable Businesses"

1. Visión del Proyecto
La democratización del desarrollo (No-code, LLMs, SaaS Boilerplates) ha creado un cuello de botella: construir es fácil, distribuir es el nuevo jefe final.
SignalPulse AI es un motor de adquisición de clientes basado en agentes de IA proactivos que no esperan a que el cliente busque, sino que detectan la "señal de intención" en el ruido de las redes sociales (IG, TikTok, X, Reddit, FB) y entregan oportunidades listas para cerrar.

2. El Problema (The Pain)
The Ghost Town Effect: Miles de SaaS funcionales con 0 usuarios porque el fundador es dev, no marketer.

Lead Fatigue: El "Cold Outreach" genérico está muerto. La gente ignora el spam pero responde a soluciones de problemas que acaban de expresar.

Manual Sourcing: Buscar menciones, comentarios y quejas en 5 redes sociales distintas es humanamente imposible de escalar.

3. Objetivo General
Desarrollar una plataforma Agent-Centric que automatice el ciclo completo de prospección:

Identificar el ICP (Ideal Customer Profile) analizando la URL del SaaS del usuario.

Escanear fuentes multimodales (Texto en Reddit/X, Comentarios en TikTok/IG) buscando señales de dolor.

Calificar los leads mediante IA para filtrar ruido.

Redactar el "First Contact" ultra-personalizado basado en el contexto exacto de la señal.

4. Arquitectura de Agentes (The Core)
En lugar de un flujo lineal (n8n), el sistema operará bajo una lógica de Enjambre (Swarm):

A. Agent: The Cartographer (Ingeniería de Producto)
Tarea: Scrapear la landing del cliente y entender: ¿Qué problema resuelve? ¿Contra quién compite? ¿Cuál es el tono de voz?

Output: Un JSON de "Pain Points" y "Triggers" de búsqueda.

B. Agent: The Sentinel (Scouting Multimodal)
Tarea: Orquestar herramientas de extracción (Apify/Scrapers personalizados) para monitorear:

Comentarios en videos de la competencia (TikTok/Reels).

Hilos de "ayuda" o "frustración" en subreddits y grupos de FB.

Menciones de keywords de intención en X.

Stack: Python + Playwright / Apify SDK.

C. Agent: The Auditor (Clasificación e Intención)
Tarea: Recibir la "data sucia" y pasarla por un LLM (Gemini 1.5 Flash para velocidad/costo).

Lógica: Determinar si el post es un lead real, un bot, o ruido. Asignar un Lead Score (1-10).

D. Agent: The Ghostwriter (Outreach)
Tarea: Tomar el lead calificado y redactar una propuesta de contacto.

Regla de Oro: Debe mencionar el contexto específico. "Vi que comentaste en el video de X sobre la caída de Y...".

5. Stack Tecnológico Sugerido
Backend: Python (FastAPI) para orquestación de IA / Node.js (Next.js) para el Dashboard.

IA Orchestration: LangGraph o CrewAI (Para manejar la persistencia y ciclos de los agentes).

LLMs:

Cloud: Gemini 1.5 Pro (Razonamiento complejo) y 1.5 Flash (Procesamiento masivo).

Local (Inferencia Propia): Llama 3 o Mistral para pre-filtrado de leads y ahorro de tokens.

Database: PostgreSQL (Datos de usuario/leads) + Vector DB (Pinecone/Qdrant) para memoria de largo plazo de los agentes.

Infrastructure: Dockerizado para correr tanto el backend de agentes como los scrapers.

6. Roadmap de Desarrollo (Fases)
Fase 1: MVP "The Radar"
Input de URL del SaaS.

Monitoreo simple de una sola fuente (ej. Reddit).

Entrega de leads en un Dashboard básico con botón de "Copiar mensaje de IA".

Fase 2: Multimodalidad
Integración de scrapers de TikTok e Instagram (Comentarios).

Análisis de sentimiento y "competitor switch" (Detectar gente quejándose de la competencia).

Fase 3: Automatización de Salida
Integración con APIs de Email (Smartlead/Instantly) o Automatización de DMs.

Sistema de notificaciones en Telegram para el usuario (Lead en tiempo real).

7. KPIs de Éxito
Signal Accuracy: >80% de los leads entregados deben ser calificados como "relevantes" por el usuario.

Time-to-Lead: Menos de 15 minutos desde que un usuario comenta en redes hasta que aparece en el dashboard.

Simplicity: El usuario no debe configurar más de 2 campos para empezar a recibir leads.

Notas para el IDE / Agente de Coding:
"Cuando generes código para este proyecto, prioriza la modularidad de los agentes. Cada agente debe ser una clase independiente con acceso a sus propias herramientas (Tools). El sistema debe ser capaz de manejar fallos en los scrapers sin detener el proceso de análisis de los leads ya recolectados."