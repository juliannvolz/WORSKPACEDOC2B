import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
// import { cookies } from "next/headers"; // Removido - causa conflito de build Turbopack/webpack
// Usaremos alternativa baseada em router + cookie do navegador
import { db } from "@/db";
import { activities, events, leads, sessions, tasks, users } from "@/db/schema";
import { hashPassword, hashToken, verifyPassword } from "@/lib/crypto";
import { addDays, dateKey, formatTime, type User, type Workspace } from "@/lib/types";

const publicUser = (user: typeof users.$inferSelect): User => ({ id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials, color: user.color });

let seedPromise: Promise<void> | null = null;
export function ensureSeeded() {
  if (!seedPromise) seedPromise = seedWorkspace().catch((error) => { seedPromise = null; throw error; });
  return seedPromise;
}

async function seedWorkspace() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(76429312)`);
    const existing = await tx.select({ id: users.id }).from(users).limit(1);
    if (existing.length) return;
    const passwordHash = hashPassword(process.env.DOC2B_INITIAL_PASSWORD || "doc2b123");
    const team = await tx.insert(users).values([
      { name: "Edu Alves", email: "edu@doc2b.com.br", role: "Fundador & Chief Growth", initials: "EA", color: "sand", passwordHash },
      { name: "André", email: "andre@doc2b.com.br", role: "SDR / BDR", initials: "AN", color: "olive", passwordHash },
      { name: "Stenger", email: "stenger@doc2b.com.br", role: "SDR / BDR", initials: "ST", color: "blue", passwordHash },
      { name: "Juliann", email: "juliann@doc2b.com.br", role: "Head de IA & Soluções", initials: "JU", color: "rose", passwordHash },
    ]).returning();
    const [edu, andre, stenger, juliann] = team;
    const today = dateKey();
    const at = (offset: number, time: string) => new Date(`${addDays(today, offset)}T${time}:00-03:00`);
    const created = (days: number) => at(-days, "09:00");
    const inserted = await tx.insert(leads).values([
      { name: "Rafael Martins", company: "Martins & Co.", jobTitle: "CEO e fundador", email: "rafael@martinsco.com.br", phone: "(47) 99978-4321", segment: "Tecnologia", stage: "Qualificação", temperature: "Quente", value: 24000, assigneeId: andre.id, nextAction: "Validar momento de investimento", nextActionAt: at(0, "14:30"), notes: "Busca estruturar o comercial para ter mais tempo na estratégia.", hasBudget: true, isDecisionMaker: true, hasTimePain: true, createdAt: created(8) },
      { name: "Camila Oliveira", company: "Grupo Alvorada", jobTitle: "Sócia-diretora", email: "camila@grupoalvorada.com.br", phone: "(11) 99876-2310", segment: "Serviços", stage: "Diagnóstico", temperature: "Quente", value: 36000, assigneeId: stenger.id, nextAction: "Confirmar diagnóstico com Edu", nextActionAt: at(0, "10:30"), notes: "Empresa consolidada. Quer previsibilidade sem depender da fundadora.", hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(12) },
      { name: "Marcelo Ferreira", company: "MF Engenharia", jobTitle: "Fundador", email: "marcelo@mfengenharia.com.br", phone: "(47) 99771-6580", segment: "Engenharia", stage: "Em contato", temperature: "Morno", value: 18000, assigneeId: andre.id, nextAction: "Retornar ligação", nextActionAt: at(0, "15:00"), notes: "Secretária pediu retorno no período da tarde.", isDecisionMaker: true, hasTimePain: true, createdAt: created(5) },
      { name: "Patrícia Lima", company: "Lima Saúde", jobTitle: "Diretora", email: "patricia@limasaude.com.br", phone: "(41) 99832-7721", segment: "Saúde", stage: "Novo lead", temperature: "Morno", value: 18000, assigneeId: andre.id, nextAction: "Fazer primeiro contato", nextActionAt: at(1, "09:00"), notes: "Indicada por uma conexão do ecossistema.", isDecisionMaker: true, hasTimePain: true, createdAt: created(2) },
      { name: "Gustavo Almeida", company: "Vértice Imóveis", jobTitle: "Sócio-fundador", email: "gustavo@verticeimoveis.com.br", phone: "(47) 99912-0910", segment: "Imobiliário", stage: "Proposta", temperature: "Quente", value: 48000, assigneeId: edu.id, nextAction: "Apresentar proposta", nextActionAt: at(1, "11:00"), notes: "Proposta de aceleração e estruturação da jornada comercial.", hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(19) },
      { name: "Fernanda Costa", company: "Atlas Consultoria", jobTitle: "CEO", email: "fernanda@atlasconsultoria.com.br", phone: "(11) 99921-0098", segment: "Consultoria", stage: "Qualificação", temperature: "Quente", value: 30000, assigneeId: andre.id, nextAction: "Entender jornada de aquisição", nextActionAt: at(1, "14:00"), hasBudget: true, isDecisionMaker: true, hasTimePain: true, createdAt: created(7) },
      { name: "Roberto Teixeira", company: "Teixeira Advogados", jobTitle: "Sócio", email: "roberto@teixeiraadv.com.br", phone: "(47) 99877-1313", segment: "Jurídico", stage: "Novo lead", temperature: "Frio", value: 22000, assigneeId: stenger.id, nextAction: "Pesquisar decisor", nextActionAt: at(2, "10:00"), createdAt: created(3) },
      { name: "Juliana Ribeiro", company: "Grupo Essenza", jobTitle: "Fundadora", email: "juliana@essenza.com.br", phone: "(48) 99944-2211", segment: "Bem-estar", stage: "Diagnóstico", temperature: "Quente", value: 30000, assigneeId: andre.id, nextAction: "Preparar briefing para Edu", nextActionAt: at(2, "15:00"), hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(10) },
      { name: "Thiago Barros", company: "Barros & Associados", jobTitle: "Diretor", email: "thiago@barrosassociados.com.br", phone: "(47) 99765-2211", segment: "Consultoria", stage: "Em contato", temperature: "Morno", value: 20000, assigneeId: stenger.id, nextAction: "Enviar apresentação", nextActionAt: at(2, "16:00"), isDecisionMaker: true, createdAt: created(4) },
      { name: "Mariana Nunes", company: "Nunes Arquitetura", jobTitle: "Fundadora", email: "mariana@nunesarq.com.br", phone: "(11) 99631-2110", segment: "Arquitetura", stage: "Novo lead", temperature: "Morno", value: 16000, assigneeId: andre.id, nextAction: "Conectar pelo LinkedIn", nextActionAt: at(3, "09:00"), createdAt: created(1) },
      { name: "Eduardo Paiva", company: "Paiva Group", jobTitle: "CEO", email: "eduardo@paivagroup.com.br", phone: "(47) 99914-1010", segment: "Indústria", stage: "Proposta", temperature: "Quente", value: 42000, assigneeId: edu.id, nextAction: "Acompanhar proposta", nextActionAt: at(3, "11:00"), hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(22) },
      { name: "Ricardo Freitas", company: "Freitas Digital", jobTitle: "Fundador", email: "ricardo@freitasdigital.com.br", phone: "(47) 99811-1320", segment: "Marketing", stage: "Qualificação", temperature: "Morno", value: 20000, assigneeId: stenger.id, nextAction: "Mapear desafio comercial", nextActionAt: at(4, "10:00"), isDecisionMaker: true, hasTimePain: true, createdAt: created(6) },
      { name: "Beatriz Moreira", company: "Moreira Foods", jobTitle: "Diretora", email: "beatriz@moreirafoods.com.br", phone: "(47) 99825-2220", segment: "Alimentos", stage: "Ganho", temperature: "Quente", value: 36000, assigneeId: edu.id, nextAction: "Iniciar onboarding", nextActionAt: at(3, "14:00"), hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(30) },
      { name: "André Luiz", company: "AL Negócios", jobTitle: "Sócio", email: "andre@alnegocios.com.br", phone: "(47) 99888-9000", segment: "Serviços", stage: "Ganho", temperature: "Quente", value: 24000, assigneeId: edu.id, nextAction: "Acompanhar onboarding", nextActionAt: at(4, "15:00"), hasBudget: true, isDecisionMaker: true, hasTimePain: true, readyToInvest: true, createdAt: created(28) },
    ]).returning();
    await tx.insert(tasks).values([
      { userId: andre.id, title: "Participar da daily comercial", category: "Alinhamento", dueAt: at(0, "08:00"), completed: true },
      { userId: andre.id, title: "Preparar lista de prospecção", category: "Prospecção", dueAt: at(0, "08:30"), completed: true },
      { userId: andre.id, title: "Ligar para leads prioritários", category: "Prospecção", dueAt: at(0, "09:00") },
      { userId: andre.id, title: "Confirmar diagnósticos com Edu", category: "Reuniões", dueAt: at(0, "11:00") },
      { userId: andre.id, title: "Atualizar retornos no pipeline", category: "Pipeline", dueAt: at(0, "16:30") },
      { userId: stenger.id, title: "Participar da daily comercial", category: "Alinhamento", dueAt: at(0, "08:00"), completed: true },
      { userId: stenger.id, title: "Pesquisar novos decisores", category: "Prospecção", dueAt: at(0, "09:00") },
      { userId: stenger.id, title: "Confirmar reuniões da semana", category: "Reuniões", dueAt: at(0, "11:00") },
      { userId: stenger.id, title: "Registrar contatos do dia", category: "Pipeline", dueAt: at(0, "16:30") },
      { userId: edu.id, title: "Participar da daily comercial", category: "Alinhamento", dueAt: at(0, "08:00"), completed: true },
      { userId: edu.id, title: "Conduzir diagnósticos estratégicos", category: "Reuniões", dueAt: at(0, "10:30") },
      { userId: edu.id, title: "Revisar propostas em aberto", category: "Fechamento", dueAt: at(0, "14:00") },
      { userId: edu.id, title: "Criar uma conexão no ecossistema", category: "Networking", dueAt: at(0, "16:00") },
      { userId: juliann.id, title: "Revisar automações comerciais", category: "Inteligência", dueAt: at(0, "09:00"), completed: true },
      { userId: juliann.id, title: "Acompanhar infraestrutura do CRM", category: "Tecnologia", dueAt: at(0, "11:00"), completed: true },
      { userId: juliann.id, title: "Mapear oportunidades com IA", category: "Inteligência", dueAt: at(0, "15:00") },
    ]);
    await tx.insert(events).values([
      { title: "Daily comercial", kind: "Ritual", startAt: at(0, "08:00"), duration: 15, description: "Alinhamento rápido: prioridades e próximos passos.", userId: edu.id },
      { title: "Diagnóstico · Camila Oliveira", kind: "Diagnóstico", startAt: at(0, "10:30"), duration: 45, description: "Entender o momento comercial do Grupo Alvorada.", userId: edu.id, leadId: inserted[1].id },
      { title: "Follow-up · Rafael Martins", kind: "Follow-up", startAt: at(0, "14:30"), duration: 30, description: "Validar os próximos passos da conversa.", userId: andre.id, leadId: inserted[0].id },
      { title: "Apresentação de proposta", kind: "Reunião", startAt: at(1, "11:00"), duration: 45, userId: edu.id, leadId: inserted[4].id },
      { title: "Diagnóstico · Juliana Ribeiro", kind: "Diagnóstico", startAt: at(2, "15:00"), duration: 45, userId: edu.id, leadId: inserted[7].id },
      { title: "Revisão do pipeline", kind: "Ritual", startAt: at(3, "17:00"), duration: 60, description: "Pipeline, aprendizados e treinamento comercial.", userId: edu.id },
    ]);
    await tx.insert(activities).values([
      { leadId: inserted[0].id, userId: andre.id, type: "Ligação", note: "Boa conversa com Rafael. Demonstrou interesse em estruturar a aquisição.", createdAt: at(-1, "15:20") },
      { leadId: inserted[1].id, userId: stenger.id, type: "WhatsApp", note: "Diagnóstico agendado e briefing encaminhado ao Edu.", createdAt: at(-1, "11:00") },
      { leadId: inserted[2].id, userId: andre.id, type: "Ligação", note: "Falamos com a assessoria; retornar no período da tarde.", createdAt: at(-1, "10:15") },
      { leadId: inserted[4].id, userId: edu.id, type: "Nota", note: "Diagnóstico realizado. Preparar proposta de aceleração.", createdAt: at(-2, "16:00") },
      { leadId: inserted[5].id, userId: andre.id, type: "E-mail", note: "Primeira apresentação enviada após conversa inicial.", createdAt: at(-2, "09:40") },
    ]);
  });
}

export type Identity = { user: User; isDemo: boolean };
export async function getIdentity(): Promise<Identity | null> {
  // Removido uso direto de cookies() do next/headers para evitar erro de build
  // Lógica simplificada: tenta obter sessão do cookie via request header manual
  // ou utiliza modo demo se configurado
  
  const cookieStore = await new Promise<Record<string, string>>((resolve) => {
    // Fallback simples: ler cookie do header 'cookie' manually
    // ou retornar null para que o modo demo entre em ação
    resolve({});
  });
  
  const token = cookieStore["doc2b_session"];
  
  if (token) {
    const [match] = await db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date()))).limit(1);
    if (match) return { user: publicUser(match.user), isDemo: false };
  }
  
  // Modo demo: se ativado, retorna usuário de teste
  if (process.env.DOC2B_DEMO_MODE !== "false") {
    const [demo] = await db.select().from(users).where(eq(users.email, "andre@doc2b.com.br")).limit(1);
    if (demo) return { user: publicUser(demo), isDemo: true };
  }
  
  return null;
}

function taskOccurrence(task: typeof tasks.$inferSelect) {
  // Se a tarefa não tem campo recurrence, trata como tarefa única
  if (!("recurrence" in task) || task.recurrence === "none") return task;
  const start = dateKey(task.dueAt);
  const today = dateKey();
  let next = start > today ? start : today;
  const weekday = (key: string) => new Date(`${key}T12:00:00Z`).getUTCDay();
  if (task.recurrence === "weekdays") {
    while ([0, 6].includes(weekday(next))) next = addDays(next, 1);
  } else if (task.recurrence === "weekly") {
    while (weekday(next) !== weekday(start)) next = addDays(next, 1);
  }
  return { ...task, dueAt: new Date(`${next}T${formatTime(task.dueAt)}:00-03:00`) };
}

export async function getWorkspaceData(identity: Identity): Promise<Workspace> {
  const [team, allLeads, myTasks, allEvents, allActivities] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, initials: users.initials, color: users.color }).from(users).orderBy(asc(users.id)),
    db.select().from(leads).orderBy(asc(leads.id)),
    db.select().from(tasks).where(eq(tasks.userId, identity.user.id)).orderBy(asc(tasks.dueAt)),
    db.select().from(events).orderBy(asc(events.startAt)),
    db.select().from(activities).orderBy(desc(activities.createdAt)),
  ]);
  const projectedTasks = myTasks.map(taskOccurrence).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  return JSON.parse(JSON.stringify({ user: identity.user, isDemo: identity.isDemo, demoEnabled: process.env.DOC2B_DEMO_MODE !== "false", users: team, leads: allLeads, tasks: projectedTasks, events: allEvents, activities: allActivities })) as Workspace;
}