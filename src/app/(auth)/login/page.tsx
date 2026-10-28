"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendCode, generateCode, isEmailAllowed, ALLOWED_EMAILS } from "@/lib/auth";
import { CTAButton, Seal, Reveal } from "@/components/ui";
import { Sun, X } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailAllowed(email)) {
      // Em produção, mostrar erro na UI
      return;
    }

    const code = generateCode();
    const result = await sendCode({
      to: email,
      code,
      type: "login",
    });

    if (result.success) {
      setShowSuccess(true);
      // Após algum tempo, auto-redirect para verificação
      // ou armazenar código na sessão para verificação posterior
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="bg-bone/80 rounded-xl p-8 text-center max-w-md">
          <Seal className="h-12 w-12 mx-auto text-neon mb-4" />
          <h2 className="text-2xl font-bold text-bone mb-2">
            Código enviado!
          </h2>
          <p className="text-bone/60 mb-6">
            Um código de 6 dígitos foi enviado para <strong className="text-neon">{email}</strong>.
          </p>
          <p className="text-bone/50 text-sm">
            Verifique sua caixa de entrada (e spam). O código expira em 10 minutos.
          </p>
          <CTAButton
            large
            onClick={() => {
              setShowSuccess(false);
              setEmail("");
              setCode("");
              router.push("/verify-code");
            }}
          >
            Verificar código
          </CTAButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="bg-bone/80 rounded-xl p-8 text-center max-w-md">
        <Seal className="h-12 w-12 mx-auto text-neon mb-8" />

        <h1 className="text-3xl font-bold text-bone mb-6">
          Bem-vindo à DOC2B
        </h1>

        <p className="text-bone/60 mb-8">
          Acesso rápido ao seu diagnóstico comercial
        </p>

        {/* Campo e-mail - apenas e-mail, nada mais */}
        <form
          onSubmit={handleSend}
          className="space-y-4"
          aria-label="Login DOC2B"
        >
          <div>
            <label
              className="sr-only"
              htmlFor="email"
            >
              E-mail DOC2B
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isResending}
              className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              placeholder="seu@email.com"
              aria-describedby="email-help"
            />
            <p
              id="email-help"
              className="text-bone/50 text-sm mt-1"
            >
              {ALLOWED_EMAILS.length > 0
                ? `Usei um e-mail da lista: ${ALLOWED_EMAILS.join(", ")}`
                : "Use e-mails autorizados como: edu@doc2b.com.br, andre@doc2b.com.br"}
            </p>
          </div>

          <CTAButton
            type="submit"
            disabled={isResending || !email || !isEmailAllowed(email)}
            className="w-full"
          >
            {isResending ? "Enviando..." : "Enviar código de 6 dígitos"}
          </CTAButton>
        </form>

        {/* Informações sobre allowed emails */}
        <p className="mt-6 text-bone/50 text-xs">
          Conta criada automaticamente no primeiro acesso.
        </p>
      </div>
    </div>
  );
}