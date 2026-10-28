"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BookOpenText, CalendarDays, Check, ChevronDown, ChevronRight, ChevronsUpDown, CircleHelp, Command, LayoutGrid, ListTodo, LogOut, Menu, PanelTop, Search, Settings2, Sparkles, Target, UsersRound, X } from "lucide-react";
import { Avatar, Brand } from "@/components/common";
import { Dashboard } from "@/components/dashboard";
import { LeadsView, PipelineView, PlaybookView, QualificationView, TeamView } from "@/components/commercial";
import { AgendaView, RoutineView } from "@/components/productivity";
import { EventForm, LeadDrawer, LeadForm, LoginDialog, PasswordDialog, TaskForm } from "@/components/dialogs";
import { dateKey, type Lead, type Mutation, type View, type Workspace } from "@/lib/types";

const mainNav = [
  { view: "overview" as const, label: "Visão geral", icon: LayoutGrid },
  { view: "leads" as const, label: "Leads", icon: UsersRound },
  { view: "pipeline" as const, label: "Pipeline", icon: PanelTop },
  { view: "agenda" as const, label: "Agenda", icon: CalendarDays },
  { view: "routine" as const, label: "Minha rotina", icon: ListTodo },
];
const strategyNav = [
  { view: "qualification" as const, label: "Qualificação", icon: Target },
  { view: "playbook" as const, label: "Playbook", icon: BookOpenText },
  { view: "team" as const, label: "Equipe", icon: Sparkles },
];
const viewLabels: Record<View, string> = { overview: "Visão geral", leads: "Leads", pipeline: "Pipeline", agenda: "Agenda", routine: "Minha rotina", qualification: "Qualificação", playbook: "Playbook", team: "Equipe" };
type ModalName = "lead" | "editLead" | "task" | "event" | "login" | "password" | null;

export function CRMApp({ initialData }: { initialData: Workspace | null }) {
  const [data, setData] = useState<Workspace | null>(initialData);
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<ModalName>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, error = false) => { setToast({ message, error }); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 3000); }, []);
  useEffect(() => { const handle = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); } }; window.addEventListener("keydown", handle); return () => window.removeEventListener("keydown", handle); }, []);
  const mutate: Mutation = async (body) => {
    try {
      const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) { showToast(result.error || "Não foi possível salvar.", true); return false; }
      setData(result as Workspace); showToast(body.action === "lead.delete" || body.action === "task.delete" || body.action === "event.delete" ? "Item removido com sucesso." : "Tudo salvo por aqui."); return true;
    } catch { showToast("Não foi possível conectar. Tente novamente.", true); return false; }
  };
  if (!data) return <LoginDialog standalone />;
  const navigate = (next: View) => { setView(next); setMobileOpen(false); setProfileOpen(false); setNotificationsOpen(false); if (next !== "leads") setLeadSearch(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openLead = (lead: Lead) => setSelectedId(lead.id);
  const selectedLead = data.leads.find((lead) => lead.id === selectedId);
  const todayTasks = data.tasks.filter((task) => dateKey(task.dueAt) === dateKey());
  const completed = todayTasks.filter((task) => task.completed).length;
  const pending = todayTasks.length - completed;
  const percent = todayTasks.length ? Math.round(completed / todayTasks.length * 100) : 0;
  async function logout() { await fetch("/api/session", { method: "DELETE" }); window.location.reload(); }
  return <div className="app-shell">
    {mobileOpen && <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}><div className="sidebar-brand"><Brand /><span className="workspace-label">WORKSPACE <i /></span><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div><div className="sidebar-scroll"><div className="sidebar-section-label">ÁREA DE TRABALHO <span>01</span></div><nav className="sidebar-nav" aria-label="Navegação principal">{mainNav.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} className={view === itemView ? "active" : ""} onClick={() => navigate(itemView)}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{itemView === "leads" && <small>{data.leads.length}</small>}{view === itemView && <i />}</button>)}</nav><div className="sidebar-section-label strategy-label">ESTRATÉGIA <span>02</span></div><nav className="sidebar-nav" aria-label="Estratégia">{strategyNav.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} className={view === itemView ? "active" : ""} onClick={() => navigate(itemView)}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{view === itemView && <i />}</button>)}</nav></div><div className="sidebar-bottom"><div className="sidebar-focus"><div className="sidebar-focus-top"><span><Sparkles size={14} /></span><ArrowMark /></div><div className="sidebar-focus-title">Um dia de cada vez<span>.</span></div><p>Pequenos passos, grandes conquistas.</p><div className="sidebar-progress"><span style={{ width: `${percent}%` }} /></div><div className="sidebar-progress-label"><span>SEU FOCO HOJE</span><strong>{completed}/{todayTasks.length}</strong></div><button onClick={() => navigate("routine")}>Ver minha rotina <ChevronRight size={13} /></button></div><div className="sidebar-user-wrap"><button className="sidebar-user" onClick={() => setProfileOpen(!profileOpen)}><Avatar user={data.user} /><span><strong>{data.user.name}</strong><small>{data.user.role}</small></span><ChevronsUpDown size={15} /></button>{profileOpen && <div className="profile-popover"><div><strong>{data.user.name}</strong><span>{data.isDemo ? "Modo demonstração" : data.user.email}</span></div><button onClick={() => { setProfileOpen(false); setModal("login"); }}><CircleHelp size={15} /> Trocar de perfil</button>{!data.isDemo && <><button onClick={() => { setProfileOpen(false); setModal("password"); }}><Settings2 size={15} /> Alterar senha</button><button onClick={logout}><LogOut size={15} /> Sair da conta</button></>}</div>}</div></div></aside>
    <div className="main-shell"><header className="topbar"><div className="topbar-crumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{viewLabels[view]}</strong>{data.demoEnabled && <span className="demo-mode-badge" title="Este ambiente contém dados fictícios e permite acesso demonstrativo."><i /> DEMONSTRAÇÃO</span>}</div><div className="topbar-actions"><div className="global-search"><button type="button" aria-label="Buscar leads" onClick={() => { if (window.matchMedia("(max-width: 640px)").matches) navigate("leads"); else searchRef.current?.focus(); }}><Search size={16} /></button><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setLeadSearch(search); setView("leads"); setMobileOpen(false); searchRef.current?.blur(); } }} placeholder="Buscar no workspace" aria-label="Buscar leads no workspace" /><span>⌘ K</span></div><div className="notification-wrap"><button className="top-icon notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notificações"><Bell size={18} />{pending > 0 && <i />}</button>{notificationsOpen && <div className="notification-popover"><div><strong>Seu dia em foco</strong><span>HOJE</span></div><p>{pending ? `Você tem ${pending} ${pending === 1 ? "atividade pendente" : "atividades pendentes"} na sua rotina.` : "Tudo em dia! Você não tem atividades pendentes hoje."}</p><button onClick={() => navigate("routine")}>Ver minha rotina <ChevronRight size={14} /></button></div>}</div><span className="top-divider" /><button className="top-profile" title="Trocar perfil" onClick={() => setModal("login")}><Avatar user={data.user} size="sm" /><span>{data.user.name.split(" ")[0]}</span><ChevronDown size={14} /></button></div></header>
      <main className="workspace-content">{view === "overview" && <Dashboard data={data} navigate={navigate} onLead={openLead} onNewLead={() => setModal("lead")} onNewEvent={() => setModal("event")} />}{view === "leads" && <LeadsView key={leadSearch} data={data} onLead={openLead} onNewLead={() => setModal("lead")} initialSearch={leadSearch} />}{view === "pipeline" && <PipelineView data={data} onLead={openLead} onNewLead={() => setModal("lead")} mutate={mutate} />}{view === "agenda" && <AgendaView data={data} onNewEvent={() => setModal("event")} mutate={mutate} />}{view === "routine" && <RoutineView data={data} onNewTask={() => setModal("task")} mutate={mutate} />}{view === "qualification" && <QualificationView data={data} onLead={openLead} mutate={mutate} />}{view === "playbook" && <PlaybookView />}{view === "team" && <TeamView data={data} onSwitch={() => setModal("login")} />}</main>
    </div>
    {selectedLead && <LeadDrawer key={selectedLead.id} data={data} lead={selectedLead} mutate={mutate} onClose={() => setSelectedId(null)} onEdit={() => setModal("editLead")} />}
    {modal === "lead" && <LeadForm data={data} mutate={mutate} onClose={() => setModal(null)} />}
    {modal === "editLead" && selectedLead && <LeadForm key={selectedLead.id} data={data} lead={selectedLead} mutate={mutate} onClose={() => setModal(null)} />}
    {modal === "task" && <TaskForm mutate={mutate} onClose={() => setModal(null)} />}
    {modal === "event" && <EventForm data={data} mutate={mutate} onClose={() => setModal(null)} />}
    {modal === "login" && <LoginDialog onClose={() => setModal(null)} isDemo={data.demoEnabled} />}
    {modal === "password" && <PasswordDialog onClose={() => setModal(null)} />}
    {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`}><span>{toast.error ? <X size={15} /> : <Check size={15} />}</span>{toast.message}</div>}
  </div>;
}
function ArrowMark() { return <span className="arrow-mark">↗</span>; }
