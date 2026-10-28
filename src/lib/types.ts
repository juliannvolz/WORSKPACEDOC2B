export const STAGES = ["Novo lead", "Em contato", "Qualificação", "Diagnóstico", "Proposta", "Ganho", "Perdido"] as const;
export const TEMPERATURES = ["Quente", "Morno", "Frio"] as const;
export type Stage = (typeof STAGES)[number];
export type View = "overview" | "leads" | "pipeline" | "agenda" | "routine" | "qualification" | "playbook" | "team";

export type User = {
  id: number; name: string; email: string; role: string; initials: string; color: string;
};
export type Lead = {
  id: number; name: string; company: string; jobTitle: string; email: string; phone: string;
  segment: string; source: string; stage: string; temperature: string; value: number;
  assigneeId: number | null; nextAction: string; nextActionAt: string | null; lastContactAt: string | null;
  notes: string; hasBudget: boolean; isDecisionMaker: boolean; hasTimePain: boolean; readyToInvest: boolean;
  createdAt: string;
};
export type Task = {
  id: number; userId: number; title: string; category: string; dueAt: string; recurrence: string;
  completed: boolean; completedOn: string | null; createdAt: string;
};
export type CalendarEvent = {
  id: number; title: string; kind: string; startAt: string; duration: number; description: string;
  userId: number | null; leadId: number | null; createdAt: string;
};
export type Activity = {
  id: number; leadId: number; userId: number | null; type: string; note: string; createdAt: string;
};
export type Workspace = {
  user: User; isDemo: boolean; demoEnabled: boolean; users: User[]; leads: Lead[]; tasks: Task[];
  events: CalendarEvent[]; activities: Activity[];
  // DOC2B Arena data entities
  sites: Site; navs: Nav[]; leaks: Leak[]; strata: Stratum[]; steps: Step[];
  disciplines: Discipline[]; flow: Flow[]; fit: Fit[]; notFit: NotFit[]; metrics: Metric[];
  timeline: Timeline[]; nextSteps: NextStep[]; footerNotes: FooterNote[];
};
export type Mutation = (body: Record<string, unknown>) => Promise<boolean>;
export type Navigate = (view: View) => void;

// DOC2B Arena Data Types

export type Site = {
  id: number; workspace_id: number; brand: string; legal: string; positioning: string;
  promise: string; city: string; geo: string; phone: string; whatsapp: string;
  wa_message: string; cta_label: string; cta_micro: string; cycle: string; reach: string;
  created_at: string;
};

export type Nav = {
  id: number; workspace_id: number; n: string; label: string; short: string;
};

export type Leak = {
  id: number; workspace_id: number; label: string; tag: string; weight: number;
};

export type Stratum = {
  id: number; workspace_id: number; n: string; label: string; note: string;
};

export type Step = {
  id: number; workspace_id: number; n: string; title: string; tag: string;
  text: string; bullets: string[];
};

export type Discipline = {
  id: number; workspace_id: number; n: string; label: string; note: string;
};

export type Flow = {
  id: number; workspace_id: number; value: string;
};

export type Fit = {
  id: number; workspace_id: number; n: string; label: string; note: string;
};

export type NotFit = {
  id: number; workspace_id: number; label: string;
};

export type Metric = {
  id: number; workspace_id: number; n: string; label: string; note: string;
};

export type Timeline = {
  id: number; workspace_id: number; w: string; title: string; note: string;
};

export type NextStep = {
  id: number; workspace_id: number; n: string; t: string; d: string;
};

export type FooterNote = {
  id: number; workspace_id: number; note: string;
};

export function scoreLead(lead: Lead) {
  return [lead.hasBudget, lead.isDecisionMaker, lead.hasTimePain, lead.readyToInvest].filter(Boolean).length * 25;
}

const zone = "America/Sao_Paulo";
export function dateKey(date: string | Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
}
export function addDays(key: string, amount: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
export function dateFromKey(key: string) { return new Date(`${key}T12:00:00-03:00`); }
export function formatDay(date: string | Date, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: zone, ...options }).format(new Date(date)).replace(".", "");
}
export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: zone, hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
export function relativeDay(date: string | null) {
  if (!date) return "Sem data";
  const key = dateKey(date), today = dateKey();
  if (key === today) return "Hoje";
  if (key === addDays(today, 1)) return "Amanhã";
  if (key === addDays(today, -1)) return "Ontem";
  return formatDay(date);
}
export function localInputValue(date: string | Date = new Date()) {
  const d = new Date(date);
  return `${dateKey(d)}T${formatTime(d)}`;
}
export function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

// Types de Autenticação (usados no login/verify)
export type { SessionUser } from "@/lib/auth";
