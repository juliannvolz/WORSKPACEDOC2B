"use client";

import { useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CTAButton, Seal } from "@/components/ui";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Código de 6 dígitos inválido");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Senhas não coincidem");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao verificar código");
        setIsVerifying(false);
        return;
      }

      if (data.success) {
        router.push("/dashboard");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silencioso
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="bg-bone/80 rounded-2xl p-10 text-center max-w-md shadow-xl border border-bone/20">
        <Seal className="h-12 w-12 mx-auto text-neon mb-4" />

        <h2 className="text-2xl font-bold text-bone mb-2">
          Criar sua senha
        </h2>
        <p className="text-bone/60 mb-6">
          Confirme o código recebido em <strong className="text-neon">{email}</strong> e defina sua senha.
        </p>

        {error && (
          <div className="bg-alert/20 border border-alert/40 rounded-xl p-4 mb-6 text-left">
            <p className="text-alert text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 text-left">
          <div>
            <label className="block text-bone/80 text-sm font-medium mb-1">
              Código de 6 dígitos
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-bone/80 text-sm font-medium mb-1">
              Criar senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="block text-bone/80 text-sm font-medium mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-neon text-ink font-bold py-3 rounded-xl hover:bg-bone/80 transition-colors disabled:opacity-50"
          >
            {isVerifying ? "Criando conta..." : "Criar conta e entrar"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            className="w-full text-bone/50 text-sm underline hover:text-bone transition-colors"
            disabled={isVerifying}
          >
            Não recebeu o código? Reenviar
          </button>
        </form>

        <p className="text-bone/40 text-xs mt-6">
          Código válido por 10 minutos. Conta criada automaticamente no primeiro acesso.
        </p>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ink">Carregando...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
