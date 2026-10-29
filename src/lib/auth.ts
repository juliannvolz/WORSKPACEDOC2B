import { type ReactNode } from "react";
import { hashToken, hashPassword } from "@/lib/crypto";
export { hashToken, hashPassword };
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// ==========================================================================
// Configurações (lidas de .env)
// ==========================================================================

// E-mails autorizados. Se vazio, qualquer e-mail válido pode criar conta.
export const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS 
  ? process.env.ALLOWED_EMAILS.split(",").map(e => e.trim()).filter(Boolean)
  : [];

// Chave secreta para assinar cookies httpOnly
export const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";

// Provedor de e-mail (Resend ou outro)
// Resend: https://resend.com/api-docs
export type EmailProvider = "resend" | "custom";

export const EMAIL_PROVIDER: EmailProvider = process.env.EMAIL_PROVIDER as EmailProvider || "resend";

// Chave da API do provedor
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// ==========================================================================
// Types
// ==========================================================================

export type SessionUser = {
  id: string;
  email: string;
  workspaceId: string;
  iat: number;
  exp: number;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: SessionUser | null;
  loggingIn: boolean;
  error: string | null;
};

// ==========================================================================
// Funções Auxiliares
// ==========================================================================

/**
 * Gera um token de sessão (JWT simples ou hash + expiry)
 * Em produção usaria JWT real, aqui usamos um modelo simplificado
 */
export function createSession(userId: string, email: string, workspaceId: string) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 10 * 60; // 10 minutos
  
  // Em produção: usar JWT com SESSION_SECRET
  // Aqui armazenamos: tokenHash|exp|workspaceId
  const data = `${userId}|${exp}|${workspaceId}`;
  const tokenHash = hashToken(data);
  
  return {
    token: tokenHash,
    expiresAt: new Date(exp * 1000),
    user: {
      id: userId,
      email,
      workspaceId,
    }
  };
}

/**
 * Valida token de sessão
 */
export function validateSession(token: string | string[] | null): {
  valid: boolean;
  user: SessionUser | null;
  error: "expired" | "invalid" | null;
} {
  if (!token) {
    return { valid: false, user: null, error: "invalid" };
  }

  try {
    // Normalizar token (Next.js cookies podem vir como array)
    const tokenString = Array.isArray(token) ? token[0] : token;
    
    // Em produção: verificar JWT assinado com SESSION_SECRET
    // Aqui validamos formato simples
    const parts = tokenString.split("|");
    if (parts.length !== 3) {
      return { valid: false, user: null, error: "invalid" };
    }

    const [userId, expStr, workspaceId] = parts;
    const exp = parseInt(expStr, 10);
    
    if (isNaN(exp)) {
      return { valid: false, user: null, error: "invalid" };
    }

    const now = Math.floor(Date.now() / 1000);
    
    if (now > exp) {
      return { valid: false, user: null, error: "expired" };
    }

    return {
      valid: true,
      user: {
        id: userId,
        email: "", // Email viria do banco, aqui simplificamos
        workspaceId,
        iat: Math.floor(Date.now() / 1000),
        exp: parseInt(parts[1], 10),
      },
      error: null,
    };
  } catch {
    return { valid: false, user: null, error: "invalid" };
  }
}

/**
 * Verifica se e-mail está na lista permitida.
 * Se ALLOWED_EMAILS estiver vazio, qualquer e-mail válido é aceito.
 */
export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_EMAILS.length === 0) return true;
  return ALLOWED_EMAILS.includes(email);
}

// ==========================================================================
// Códigos de verificação pendentes (memória, expira em 10 min)
// Em produção usar Redis ou tabela no banco
// ==========================================================================

type PendingCode = { code: string; expiresAt: number };
const pendingCodes: Record<string, PendingCode> = {};

export function storePendingCode(email: string, code: string) {
  pendingCodes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };
}

export function verifyPendingCode(email: string, code: string): boolean {
  const entry = pendingCodes[email];
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    delete pendingCodes[email];
    return false;
  }
  if (entry.code !== code) return false;
  delete pendingCodes[email]; // consome o código
  return true;
}

/**
 * Busca usuário por e-mail
 */
export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user || null;
}

/**
 * Cria usuário com senha própria (primeiro acesso via código)
 */
export async function createUserWithPassword(email: string, password: string, name?: string) {
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(users).values({
    email,
    name: name || email.split("@")[0],
    role: "Usuário",
    initials: email.split("@")[0].substring(0, 2).toUpperCase(),
    color: "blue",
    passwordHash,
  }).returning();
  return user;
}

/**
 * Formata código de 6 dígitos
 */
export function generateCode(): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
}

// ==========================================================================
// Interface para envio de e-mail
// ==========================================================================

export interface SendCodeParams {
  to: string;
  code: string;
  type: "login" | "verify";
}

export interface SendCodeResult {
  success: boolean;
  error?: string;
}

// ==========================================================================
// Enviar código por e-mail
// ==========================================================================

/**
 * Envia código de verificação por e-mail
 * Usa Resend por padrão, pode ser sobrescrito
 */
export async function sendCode(params: SendCodeParams): Promise<SendCodeResult> {
  const { to, code, type } = params;
  
  if (EMAIL_PROVIDER === "resend" && RESEND_API_KEY) {
    return sendCodeViaResend(to, code, type);
  }
  
  // Fallback: em produção, integrar com SendGrid, Mailgun, etc.
  console.log(`[Auth] Código ${type}: ${code} para ${to}`);
  
  return { success: true }; // Em dev, apenas log
}

/**
 * Envia via Resend API
 */
async function sendCodeViaResend(to: string, code: string, type: "login" | "verify"): Promise<SendCodeResult> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const subject = type === "login" 
    ? "Seu código de acesso DOC2B"
    : "Código de verificação DOC2B";

  const html = `
    <h2>DOC2B - Engenharia de Crescimento</h2>
    <p>Seu código de ${type === "login" ? "acesso" : "verificação"} é:</p>
    <h1 style="color: #b6ff00; font-size: 32px;">${code}</h1>
    <p>Este código é válido por 10 (dez) minutos.</p>
    <p>Se você não solicitou este código, ignore este e-mail.</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DOC2B <onboarding@resend.dev>", // Em produção: usar domínio verificado
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    console.error("Resend exception:", error);
    return { success: false, error: "Network error" };
  }
}

// ==========================================================================
// Rate Limiting Simples
// ==========================================================================

/**
 * Rate limit simples usando memória (em produção usar Redis)
 * Conta tentativas por e-mail em janela de tempo
 */
type RateLimitStore = {
  [email: string]: { count: number; firstAttempt: number };
};

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_MAX = 5; // máximo de tentativas por janela
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto em ms

export function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore[email];

  if (!entry) {
    rateLimitStore[email] = { count: 1, firstAttempt: now };
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Resetar se passou da janela
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitStore[email] = { count: 1, firstAttempt: now };
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  rateLimitStore[email].count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Limpa store expirado (chamarperiodicamente)
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const email of Object.keys(rateLimitStore)) {
    if (now - rateLimitStore[email].firstAttempt > RATE_LIMIT_WINDOW) {
      delete rateLimitStore[email];
    }
  }
}

// ==========================================================================
// Fine-tuning and miscellaneous
// ==========================================================================