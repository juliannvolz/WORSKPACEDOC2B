import { CRMApp } from "@/components/crm";
import { ensureSeeded, getIdentity, getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const identity = await getIdentity();

  // Não autenticado: mostra landing page pública com opção de entrar
  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="bg-bone/80 rounded-2xl p-10 text-center max-w-md shadow-xl border border-bone/20">
          <div className="mb-6">
            <div className="bg-neon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-ink text-xl font-bold">D</span>
            </div>
            <h1 className="text-3xl font-bold text-bone mb-2">DOC2B</h1>
            <p className="text-bone/60 text-sm">
              Crescimento em movimento. Seu workspace comercial em um só lugar.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get("email") as string;
              if (!email) return;

              try {
                const res = await fetch("/api/auth/send-code", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                if (!res.ok) {
                  const err = await res.json();
                  alert(err.error || "Erro ao enviar código");
                  return;
                }

                // Redireciona para a tela de verificação com o e-mail
                window.location.href = `/verify?email=${encodeURIComponent(email)}`;
              } catch {
                alert("Erro de conexão. Tente novamente.");
              }
            }}
            className="space-y-4"
          >
            <div className="text-left">
              <label className="block text-bone/80 text-sm font-medium mb-1">
                Seu e-mail
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-ink/50 border border-bone/20 rounded-xl text-bone focus:outline-none focus:border-neon transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-neon text-ink font-bold py-3 rounded-xl hover:bg-bone/80 transition-colors"
            >
              Enviar código de acesso
            </button>

            <p className="text-bone/40 text-xs mt-3">
              Receberá um código de 6 dígitos por e-mail. Ao confirmar, poderá criar sua senha própria.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Autenticado: carrega workspace
  const initialData = await getWorkspaceData(identity);
  return <CRMApp initialData={initialData} />;
}
