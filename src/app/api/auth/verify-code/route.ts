import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyPendingCode,
  getUserByEmail,
  createUserWithPassword,
  createSession,
  hashToken,
  hashPassword,
} from "@/lib/auth";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    // 1. Verificar código de verificação
    const codeValid = verifyPendingCode(email, code);
    if (!codeValid) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 });
    }

    // 2. Buscar ou criar usuário
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUserWithPassword(email, password);
    } else {
      // Usuário já existe: atualizar senha se ainda não tiver uma definida
      await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, user.id));
    }

    // 3. Criar sessão no banco
    const session = createSession(String(user.id), user.email, "1");
    await db.insert(sessions).values({
      tokenHash: hashToken(session.token),
      userId: user.id,
      expiresAt: session.expiresAt,
    });

    // 4. Definir cookie httpOnly
    const cookieStore = await cookies();
    cookieStore.set("doc2b_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutos
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
