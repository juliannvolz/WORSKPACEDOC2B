import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/* ==========================================================================
   USERS — Usuarios do workspace
   ========================================================================== */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
  color: text("color").notNull(),
  passwordHash: text("password_hash").notNull(),
});

/* ==========================================================================
   LEADS — Leads de vendas (pipeline)
   ========================================================================== */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  jobTitle: text("job_title").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  segment: text("segment").notNull(),
  stage: text("stage").notNull(),
  temperature: text("temperature").notNull(),
  value: integer("value").notNull(),
  assigneeId: integer("assignee_id").references(() => users.id),
  nextAction: text("next_action"),
  nextActionAt: timestamp("next_action_at", { withTimezone: true }),
  notes: text("notes"),
  hasBudget: boolean("has_budget").notNull().default(false),
  isDecisionMaker: boolean("is_decision_maker").notNull().default(false),
  hasTimePain: boolean("has_time_pain").notNull().default(false),
  readyToInvest: boolean("ready_to_invest").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   SESSIONS — Sessões de login (httpOnly cookie)
   ========================================================================== */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/* ==========================================================================
   TASKS — Tarefas e ações comerciais
   ========================================================================== */
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  completed: boolean("completed").notNull().default(false),
});

/* ==========================================================================
   EVENTS — Eventos e reuniões
   ========================================================================== */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
});

/* ==========================================================================
   ACTIVITIES — Atividades/registro de interações
   ========================================================================== */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   SITES — Brand e configuração do site (única linha)
   ========================================================================== */
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  brand: text("brand").notNull(),
  legal: text("legal").notNull(),
  positioning: text("positioning").notNull(),
  promise: text("promise").notNull(),
  city: text("city").notNull(),
  geo: text("geo").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  wa_message: text("wa_message").notNull(),
  cta_label: text("cta_label").notNull(),
  cta_micro: text("cta_micro").notNull(),
  cycle: text("cycle").notNull(),
  reach: text("reach").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   NAV — Navegação (7 itens)
   ========================================================================== */
export const navs = pgTable("navs", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  label: text("label").notNull(),
  short: text("short").notNull(),
});

/* ==========================================================================
   LEAKS — Gargalos (6 itens com peso)
   ========================================================================== */
export const leaks = pgTable("leaks", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  label: text("label").notNull(),
  tag: text("tag").notNull(),
  weight: integer("weight").notNull(),
});

/* ==========================================================================
   STRATA — Estratos (5 itens)
   ========================================================================== */
export const strata = pgTable("strata", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull(),
});

/* ==========================================================================
   STEPS — Etapas do método (4 etapas)
   ========================================================================== */
export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  title: text("title").notNull(),
  tag: text("tag").notNull(),
  text: text("text").notNull(),
  bullets: text("bullets").array().notNull(),
});

/* ==========================================================================
   DISCIPLINAS — Disciplinas (6 itens)
   ========================================================================== */
export const disciplines = pgTable("disciplines", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull(),
});

/* ==========================================================================
   FLOW — Fluxo (Gargalo, Sistema, Resultado)
   ========================================================================== */
export const flow = pgTable("flow", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  value: text("value").notNull(),
});

/* ==========================================================================
   FIT — Qualificações "Fit" (4 itens)
   ========================================================================== */
export const fit = pgTable("fit", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull(),
});

/* ==========================================================================
   NOT_FIT — Qualificações "Not Fit" (3 itens)
   ========================================================================== */
export const notFit = pgTable("not_fit", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  label: text("label").notNull(),
});

/* ==========================================================================
   METRICS — Métricas (8 itens)
   ========================================================================== */
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  label: text("label").notNull(),
  note: text("note").notNull(),
});

/* ==========================================================================
   TIMELINE — Cronograma 30 dias (4 semanas)
   ========================================================================== */
export const timeline = pgTable("timeline", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  w: text("w").notNull(),
  title: text("title").notNull(),
  note: text("note").notNull(),
});

/* ==========================================================================
   NEXT_STEPS — Próximos passos (3 passos)
   ========================================================================== */
export const nextSteps = pgTable("next_steps", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  n: text("n").notNull(),
  t: text("t").notNull(),
  d: text("d").notNull(),
});

/* ==========================================================================
   FOOTER_NOTES — Nota de rodapé (3 itens)
   ========================================================================== */
export const footerNotes = pgTable("footer_notes", {
  id: serial("id").primaryKey(),
  workspace_id: integer("workspace_id").notNull(),
  note: text("note").notNull(),
});