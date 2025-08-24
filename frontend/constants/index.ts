export const cards = [
  { type: "Technical", title: "Full‑Stack Dev Interview", meta: "30–45min - Adaptive difficulty", desc: "Test frontend, backend, and APIs with adaptive follow‑ups tailored to your answers." },
  { type: "Technical", title: "DevOps & Cloud Interview", meta: "30–45min - Adaptive difficulty", desc: "CI/CD, containers, observability, and cloud architecture scenarios." },
  { type: "Non‑Technical", title: "HR Screening Interview", meta: "15–25min - Role‑aware prompts", desc: "Elevator pitch, goals, culture fit, and compensation rationale." },
  { type: "Technical", title: "System Design Interview", meta: "40–60min - Architectural depth", desc: "Design high‑scale systems with metrics, trade‑offs, and resilience." },
  { type: "Non‑Technical", title: "Business Analyst Interview", meta: "30–45min - Case‑style prompts", desc: "Requirements, KPIs, stakeholder alignment, and impact articulation." },
  { type: "Technical", title: "Mobile App Dev Interview", meta: "30–45min - Platform‑specific", desc: "Architecture, state management, performance, and offline patterns." },
  { type: "Technical", title: "Database & SQL Interview", meta: "25–40min - Query + design", desc: "Query optimization, indexing, normalization vs denormalization, and transactions." },
  { type: "Technical", title: "Cybersecurity Interview", meta: "30–45min - Practical scenarios", desc: "Threat modeling, detection, incident response, and hardening strategies." },
  { type: "Non‑Technical", title: "Sales & Marketing Interview", meta: "20–35min - Go‑to‑market focus", desc: "Positioning, ICP, objections handling, and campaign retrospectives." },
]


export const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior Level (5-8 years)" },
  { value: "lead", label: "Lead/Principal (8+ years)" },
] as const;

export const DURATION_OPTIONS = [
  { value: 5, label: "5 minutes", free: true },
  { value: 15, label: "15 minutes", free: false },
  { value: 30, label: "30 minutes", free: false },
  { value: 45, label: "45 minutes", free: false },
  { value: 60, label: "60 minutes", free: false },
] as const;
