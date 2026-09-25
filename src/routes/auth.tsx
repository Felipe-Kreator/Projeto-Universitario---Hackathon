import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Tech Circles" },
      {
        name: "description",
        content:
          "Acesse o Tech Circles para enviar artigos, editar seu perfil acadêmico e se inscrever em eventos da Universidade Braz Cubas.",
      },
      { property: "og:title", content: "Entrar ou criar conta — Tech Circles" },
      {
        property: "og:description",
        content: "Publicadores usam e-mail institucional; leitores podem entrar com Google.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});

const DOMINIO_INSTITUCIONAL = "brazcubas.edu.br";

function Auth() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [tipo, setTipo] = useState<"publicador" | "leitor">("publicador");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/perfil", replace: true });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");

    if (modo === "criar" && tipo === "publicador" && !email.toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)) {
      setErro(`Para publicar artigos use seu e-mail institucional (@${DOMINIO_INSTITUCIONAL}).`);
      return;
    }

    setEnviando(true);
    if (modo === "criar") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin, data: { nome } },
      });
      setEnviando(false);
      if (error) return setErro(traduzir(error.message));
      if (!data.session) {
        setAviso("Conta criada. Confirme o cadastro pelo link enviado ao seu e-mail para entrar.");
        return;
      }
      navigate({ to: "/perfil" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setEnviando(false);
      if (error) return setErro(traduzir(error.message));
      navigate({ to: "/perfil" });
    }
  }

  async function entrarComGoogle() {
    setErro("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return setErro("Não foi possível entrar com o Google. Tente novamente.");
    if (result.redirected) return;
    navigate({ to: "/perfil" });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">{modo === "entrar" ? "Entrar" : "Criar conta"}</h1>
      <p className="mt-2 text-muted-foreground">
        Publicadores científicos entram com o e-mail institucional. Quem só quer acompanhar pode
        usar a conta Google.
      </p>

      <form onSubmit={enviar} className="card-surface mt-8 space-y-4 p-6">
        {modo === "criar" && (
          <>
            <div role="group" aria-label="Tipo de conta" className="flex gap-2">
              {(["publicador", "leitor"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-pressed={tipo === t}
                  className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-medium ${
                    tipo === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-surface"
                  }`}
                >
                  {t === "publicador" ? "Publico artigos" : "Só quero ler"}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="nome" className="text-sm font-medium">
                Nome completo
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        <div>
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            minLength={6}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        {aviso && (
          <p role="status" className="rounded-lg bg-secondary p-3 text-sm">
            {aviso}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="min-h-11 w-full rounded-lg bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={entrarComGoogle}
          className="min-h-11 w-full rounded-lg border border-border bg-card px-4 font-medium hover:bg-surface"
        >
          Continuar com Google
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {modo === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <button
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setErro("");
            setAviso("");
          }}
          className="font-medium text-primary underline"
        >
          {modo === "entrar" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}

function traduzir(mensagem: string) {
  if (mensagem.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (mensagem.includes("already registered")) return "Este e-mail já tem cadastro. Faça login.";
  if (mensagem.includes("Email not confirmed"))
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  return mensagem;
}
