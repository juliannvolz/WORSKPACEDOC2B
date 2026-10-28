"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, CircleDollarSign, Crosshair, Plus, Sparkles, UsersRound } from "lucide-react";
import { Avatar, LeadTable, PageHeading, SectionHeader } from "@/components/common";
import { addDays, dateKey, formatTime, type Lead, type Navigate, type Workspace } from "@/lib/types";

export function Dashboard({ data, navigate, onLead, onNewLead, onNewEvent }: { data: Workspace; navigate: Navigate; onLead: (lead: Lead) => void; onNewLead: () => void; onNewEvent: () => void }) {
  const today = dateKey();
  const activeLeads = data.leads.filter((lead) => !["Ganho", "Perdido"].includes(lead.stage));
  const todayTasks = data.tasks.filter((task) => dateKey(task.dueAt) === today);
  const done = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;
  const todayEvents = data.events.filter((event) => dateKey(event.startAt) === today).slice(0, 3);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const roleText = data.user.name === "Edu Alves" ? "Bons encontros criam grandes negócios." : data.user.name === "Juliann" ? "Inteligência e clareza para fazer acontecer." : "Mais clareza para fazer o que importa.";
  const metrics = [
    { label: "Leads ativos", value: activeLeads.length, note: "oportunidades no funil", icon: UsersRound, className: "metric-lime" },
    { label: "Em qualificação", value: data.leads.filter((lead) => lead.stage === "Qualificação").length, note: "conversas em evolução", icon: Crosshair, className: "metric-purple" },
    { label: "Diagnósticos", value: data.leads.filter((lead) => lead.stage === "Diagnóstico").length, note: "reuniões no pipeline", icon: CalendarDays, className: "metric-blue" },
    { label: "Negócios ganhos", value: data.leads.filter((lead) => lead.stage === "Ganho").length, note: "conexões que viraram clientes", icon: CircleDollarSign, className: "metric-peach" },
  ];
  const isSdr = data.user.role.includes("SDR");
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const weekStart = addDays(today, -((weekday + 6) % 7));
  const withinPeriod = (date: string) => { const key = dateKey(date); return isSdr ? key >= weekStart && key <= addDays(weekStart, 6) : key.slice(0, 7) === today.slice(0, 7); };
  const periodActivities = data.activities.filter((activity) => withinPeriod(activity.createdAt) && (!isSdr || activity.userId === data.user.id));
  const periodDiagnostics = data.events.filter((event) => event.kind === "Diagnóstico" && withinPeriod(event.startAt) && (!isSdr || event.userId === data.user.id || data.leads.some((lead) => lead.id === event.leadId && lead.assigneeId === data.user.id))).length;
  const goals = [
    { label: "Contatos efetuados", value: periodActivities.filter((activity) => ["Ligação", "WhatsApp", "E-mail", "Conversa com decisor"].includes(activity.type)).length, target: isSdr ? 300 : 2400, reference: isSdr ? "300 contatos" : "2.400 contatos" },
    { label: "Conversas com decisores", value: periodActivities.filter((activity) => activity.type === "Conversa com decisor").length, target: isSdr ? 40 : 160, reference: isSdr ? "40 a 60 conversas" : "160 a 240 conversas" },
    { label: "Diagnósticos agendados", value: periodDiagnostics, target: isSdr ? 3 : 24, reference: isSdr ? "3 a 5 diagnósticos" : "24 a 40 diagnósticos" },
  ];
  return <>
    <PageHeading eyebrow={dateLabel} title={`Olá, ${data.user.name.split(" ")[0]}`} description={roleText} action={<><button className="btn btn-secondary" onClick={() => navigate("agenda")}><CalendarDays size={16} /> Minha agenda</button><button className="btn btn-primary" onClick={onNewLead}><Plus size={17} /> Novo lead</button></>} />
    <div className="hero-grid">
      <section className="hero-banner">
        <div className="hero-copy"><div className="hero-kicker"><span /> CRESCIMENTO EM MOVIMENTO</div><h2>Boas conversas.<br /><em>Grandes negócios.</em></h2><p>Relacionamentos, estratégia e ação.<br />Tudo começa por aqui.</p><button onClick={() => navigate("pipeline")}>Explorar meu pipeline <ArrowUpRight size={15} /></button></div>
        <span className="hero-index">DOC2B® &nbsp; / &nbsp; GROWTH OS</span>
      </section>
      <section className="focus-card">
        <div className="focus-top"><span className="section-eyebrow">SEU FOCO DE HOJE</span><button className="icon-link" onClick={() => navigate("routine")} aria-label="Abrir minha rotina"><ArrowUpRight size={17} /></button></div>
        <div className="focus-main"><div><h3>Um passo<br />de cada vez.</h3><p>Pequenas ações constroem<br />grandes resultados.</p></div><div className="progress-ring" style={{ background: `conic-gradient(#b5f000 ${progress}%, #e8eadf ${progress}% 100%)` }}><div><strong>{done}<span>/{todayTasks.length}</span></strong><small>CONCLUÍDAS</small></div></div></div>
        <div className="focus-footer"><span><span className="focus-bullet" /> {todayTasks.length - done} {todayTasks.length - done === 1 ? "atividade pendente" : "atividades pendentes"}</span><button onClick={() => navigate("routine")}>Ver rotina <ArrowRight size={14} /></button></div>
      </section>
    </div>
    <div className="metrics-heading"><div><span className="section-eyebrow">A OPERAÇÃO EM NÚMEROS</span><h2>O panorama de hoje<span className="heading-dot">.</span></h2></div><span className="live-label"><span /> DADOS DA EQUIPE</span></div>
    <div className="metrics-grid">{metrics.map(({ label, value, note, icon: Icon, className }) => <div className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className={`metric-icon ${className}`}><Icon size={16} /></span></div><div className="metric-value">{String(value).padStart(2, "0")}</div><div className="metric-bottom"><span className="metric-indicator"><ArrowUpRight size={12} /></span>{note}</div></div>)}</div>
    <div className="dashboard-lower">
      <section className="panel leads-panel"><div className="panel-heading"><SectionHeader eyebrow="PRÓXIMOS MOVIMENTOS" title="Leads para acompanhar" description="As conversas que merecem sua atenção." action="Ver todos" onAction={() => navigate("leads")} /></div><LeadTable leads={activeLeads.slice(0, 5)} users={data.users} onOpen={onLead} compact /></section>
      <div className="dashboard-right"><section className="panel agenda-panel"><div className="panel-heading"><SectionHeader eyebrow="ORGANIZE SEU TEMPO" title="Agenda de hoje" action="Ver agenda" onAction={() => navigate("agenda")} /></div><div className="agenda-list">{todayEvents.length ? todayEvents.map((event, index) => <div className="agenda-item" key={event.id}><span className="agenda-time">{formatTime(event.startAt)}</span><span className={`event-line event-line-${index % 3}`} /><div><strong>{event.title}</strong><small>{event.kind} · {event.duration} min</small></div><ArrowUpRight className="event-arrow" size={15} /></div>) : <div className="agenda-empty">Sua agenda está livre hoje. <button onClick={onNewEvent}>Adicionar evento</button></div>}</div><div className="agenda-panel-footer"><div className="avatar-stack">{data.users.slice(0, 3).map((user) => <Avatar key={user.id} user={user} size="sm" />)}</div><span>Seu time, em sintonia</span><button onClick={onNewEvent} aria-label="Adicionar evento"><Plus size={16} /></button></div></section>
        <button className="playbook-teaser" onClick={() => navigate("playbook")}><span className="teaser-icon"><Sparkles size={16} /></span><span><small>INTELIGÊNCIA COMERCIAL</small><strong>Uma boa abordagem abre portas.</strong><em>Explore o playbook DOC2B</em></span><ArrowDownRight size={19} /></button>
      </div>
    </div>
    <section className="performance-panel panel"><div className="performance-head"><div><div className="section-eyebrow">METAS DOC2B / {isSdr ? "SUA SEMANA" : "EQUIPE NO MÊS"}</div><h2>Consistência que gera crescimento<span className="heading-dot">.</span></h2><p>Calculado a partir das atividades e diagnósticos registrados no CRM.</p></div><button className="text-link" onClick={() => navigate("playbook")}>Ver referências <ArrowRight size={15} /></button></div><div className="performance-grid">{goals.map((goal) => <div className="performance-goal" key={goal.label}><div><span>{goal.label}</span><strong>{goal.value}<small> / {goal.target.toLocaleString("pt-BR")}</small></strong></div><div className="performance-track"><span style={{ width: `${Math.min(100, (goal.value / goal.target) * 100)}%` }} /></div><p>Meta {isSdr ? "semanal" : "mensal"}: {goal.reference}</p></div>)}</div></section>
    <div className="dashboard-end"><span><Check size={13} /> Feito para criar conexões de verdade.</span><span>DOC2B WORKSPACE © {new Date().getFullYear()}</span></div>
  </>;
}
