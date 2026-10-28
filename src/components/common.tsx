"use client";

import { ArrowRight, ArrowUpRight, ChevronRight, Search } from "lucide-react";
import type { Lead, User } from "@/lib/types";
import { relativeDay } from "@/lib/types";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "brand-compact" : ""}`} aria-label="DOC2B Workspace">
    <svg className="brand-mark" viewBox="0 0 34 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M3 2h11l7 10-7 10H3v-5.4h7.1l3.3-4.6-3.3-4.6H3z"/><path d="M21 6.5 25.6 12 21 17.5M26 6.5 30.6 12 26 17.5" stroke="#b6f500" strokeWidth="2.6"/></svg>
    {!compact && <span className="brand-word">DOC2B<span className="brand-dot">.</span></span>}
  </div>;
}

export function Avatar({ user, size = "md", className = "" }: { user?: User | null; size?: "sm" | "md" | "lg"; className?: string }) {
  return <span className={`avatar avatar-${user?.color || "olive"} avatar-${size} ${className}`} title={user?.name || "Sem responsável"}>{user?.initials || "?"}</span>;
}
export function CompanyAvatar({ name, index = 0 }: { name: string; index?: number }) {
  const initial = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span className={`company-avatar company-${index % 6}`}>{initial || "L"}</span>;
}
const stageClass: Record<string, string> = { "Novo lead": "new", "Em contato": "contact", "Qualificação": "qualify", "Diagnóstico": "diagnosis", "Proposta": "proposal", "Ganho": "won", "Perdido": "lost" };
export function StagePill({ stage }: { stage: string }) {
  return <span className={`stage-pill stage-${stageClass[stage] || "new"}`}><span className="stage-dot" />{stage}</span>;
}
export function Temperature({ value }: { value: string }) {
  return <span className={`temperature temperature-${value.toLowerCase()}`}><span />{value}</span>;
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={18} /></div><strong>{title}</strong><p>{description}</p></div>;
}
export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</div><h1>{title}<span className="heading-dot">.</span></h1><p>{description}</p></div>{action && <div className="heading-actions">{action}</div>}</div>;
}
export function SectionHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description?: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div>{eyebrow && <div className="section-eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <button className="text-link" onClick={onAction}>{action}<ArrowRight size={15} /></button>}</div>;
}

export function LeadTable({ leads, users, onOpen, compact = false }: { leads: Lead[]; users: User[]; onOpen: (lead: Lead) => void; compact?: boolean }) {
  if (!leads.length) return <EmptyState title="Nenhum lead por aqui" description="Experimente outra busca ou adicione uma nova oportunidade." />;
  return <div className="table-scroll"><table className={`lead-table ${compact ? "lead-table-compact" : ""}`}>
    <thead><tr><th>LEAD / EMPRESA</th><th>ETAPA</th><th>RESPONSÁVEL</th><th className={compact ? "compact-hide" : ""}>PRÓXIMA AÇÃO</th><th aria-label="Abrir" /></tr></thead>
    <tbody>{leads.map((lead, index) => {
      const owner = users.find((user) => user.id === lead.assigneeId);
      return <tr key={lead.id} onClick={() => onOpen(lead)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpen(lead); }}>
        <td><div className="lead-identity"><CompanyAvatar name={lead.company} index={index} /><div><strong>{lead.name}</strong><small>{lead.company}</small></div></div></td>
        <td><StagePill stage={lead.stage} /></td>
        <td><div className="owner-cell"><Avatar user={owner} size="sm" /><span>{owner?.name.split(" ")[0] || "—"}</span></div></td>
        <td className={compact ? "compact-hide" : ""}><div className="action-cell"><strong>{lead.nextAction}</strong><small>{relativeDay(lead.nextActionAt)}</small></div></td>
        <td className="row-arrow"><ChevronRight size={16} /></td>
      </tr>;
    })}</tbody>
  </table></div>;
}

export function SmallLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className="small-link" onClick={onClick}>{children}<ArrowUpRight size={14} /></button>;
}
