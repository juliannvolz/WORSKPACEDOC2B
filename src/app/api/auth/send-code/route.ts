import { NextResponse } from "next/server";
import { generateCode, sendCode, isEmailAllowed, storePendingCode } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    if (!isEmailAllowed(email)) {
      return NextResponse.json({ error: "E-mail não autorizado" }, { status: 403 });
    }

    const code = generateCode();
    storePendingCode(email, code);

    const result = await sendCode({ to: email, code, type: "login" });

    if (!result.success) {
      return NextResponse.json({ error: "Falha ao enviar código" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Código enviado" });
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }
}
