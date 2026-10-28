"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateSession, createSession } from "@/lib/auth";
import { CTAButton, Seal, Reveal } from "@/components/ui";
import { Check, X } from "lucide-react";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [hasCreatedAccount, setHasCreatedAccount] = useState(false);

  // Verificar sessão existente ao carregar
  useEffect(() => {
    // Em um app real, aqui viria do cookie do navegador
    // const cookieStore = await cookies();
    // const sessionCookie = cookieStore.get("doc2b_session")?.value;
    // 
    // if (sessionCookie) {
    //   const validated = validateSession(sessionCookie);
    //   if (validated.valid) {
    //     const session = validated.user;
    //     setHasCreatedAccount(true);
    //     router.push("/dashboard");
    //   }
    // }
    // Por enquanto, simulamos que não há sessão ativa
    console.log("Verificando sessão...");
  }, [router]);

  const handleVerify = async () => {
    if (!code) return;

    setIsVerifying(true);
    setError(null);

    // Em um app completo, enviar código para API
    // Que verificaria no banco/redis
    // Aqui simulamos verificação bem-sucedida

    // Simular validação de código de 6 dígitos
    const isValidCode = code.length === 6 && /^\d+$/.test(code);

    if (isValidCode) {
      // Criar sessão httpOnly
      const session = createSession(
        "user-new-" + Math.random().toString(36).substr(2, 9),
        "usuario@doc2b.com.br", // Em produção: viria do banco
        "1" // workspace compartilhado
      );

      // Definir cookie httpOnly
      // document.cookie = `doc2b_session=${session.token}; HttpOnly; Path=/; Max-Age=${session.expiresAt.getTime() / 1000}; SameSite=Lax`;
      
      setHasCreatedAccount(true);
      router.push("/dashboard");
    } else {
      setError("Código inválido. Tente novamente.");
      setCode("");
    }

    setIsVerifying(false);
  };

  if (hasCreatedAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="bg-bone/80 rounded-xl p-8 text-center max-w-md">
          <Seal className="h-12 w-12 mx-auto text-neon mb-4" />
          <h2 className="text-2xl font-bold text-bone mb-2">
            Bem-vindo!
          </h2>
          <p className="text-bone/60 mb-6">
            Sua conta foi criada com sucesso. Você será redirecionado...
          </p>
          <CTAButton large onClick={() => router.push("/dashboard")}>
            Ir ao painel
          </CTAButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="bg-bone/80 rounded-xl p-8 text-center max-w-md">
        <Seal className="h-12 w-12 mx-auto text-neon mb-8" />

        <h2 className="text-2xl font-bold text-bone mb-6">
          Verificar Código
        </h2>

        {error && (
          <div className="bg-alert/20 border border-alert/40 rounded-xl p-6 mb-6 text-center">
            <X className="h-6 w-6 text-alert mx-auto mb-2" />
            <p className="text-alert text-base">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleVerify}
          aria-label="Verify code DOC2B"
          className="space-y-4"
        >
          <div>
            <label
              className="sr-only"
              htmlFor="code"
            >
              Código de 6 dígitos
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              placeholder="123456"
              aria-describedby="code-help"
            />
            <p
              id="code-help"
              className="text-bone/50 text-sm mt-1"
            >
              Código de 6 dígitos enviado por e-mail
            </p>
          </div>

          <CTAButton
            type="submit"
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? "Verificando..." : "Entrar"}
          </CTAButton>
        </form>

        <p className="mt-6 text-bone/50 text-xs">
          Código válido por 10 minutos. Conta criada automaticamente no primeiro acesso.
        </p>
      </div>
    </div>
  );
}