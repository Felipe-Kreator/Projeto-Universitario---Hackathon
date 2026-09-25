import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { areas } from "@/data/techCircles";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil acadêmico — Tech Circles" },
      {
        name: "description",
        content:
          "Atualize curso, áreas de pesquisa, e-mail profissional e link do Currículo Lattes no Tech Circles.",
      },
      { property: "og:title", content: "Meu perfil acadêmico — Tech Circles" },
      { property: "og:description", content: "Mantenha seus dados de pesquisa sempre atualizados." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

type Form = {
  nome: string;
  curso: string;
  email_profissional: string;
  lattes: string;
  bio: string;
  areas: string[];
  subareas: string[];
};

const vazio: Form = {
  nome: "",
  curso: "",
  email_profissional: "",
  lattes: "",
  bio: "",
  areas: [],
  subareas: [],
};

function Perfil() {
  const { user, papeis, podeModerar } = useAuth();
  const [form, setForm] = useState<Form>(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState("");
  const [erro, setErro] = useState("");
  const [publicacoes, setPublicacoes] = useState<
    { id: string; titulo: string; status: string; subarea: string; ano: number }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setForm({
          nome: data.nome ?? "",
          curso: data.curso ?? "",
          email_profissional: data.email_profissional ?? "",
          lattes: data.lattes ?? "",
          bio: data.bio ?? "",
          areas: data.areas ?? [],
          subareas: data.subareas ?? [],
        });
      }
      const { data: subs } = await supabase
        .from("submissoes")
        .select("id, titulo, status, subarea, ano")
        .eq("autor_id", user.id)
        .order("created_at", { ascending: false });
      setPublicacoes(subs ?? []);
      setCarregando(false);
    })();
  }, [user]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setSalvo("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...form }, { onConflict: "id" });
    if (error) setErro("Não foi possível salvar agora. Tente novamente.");
    else setSalvo("Perfil atualizado.");
  }

  function alternar(campo: "areas" | "subareas", valor: string) {
    setForm((f) => ({
      ...f,
      [campo]: f[campo].includes(valor)
        ? f[campo].filter((v) => v !== valor)
        : [...f[campo], valor],
    }));
  }

  const subareasDisponiveis = areas
    .filter((a) => form.areas.length === 0 || form.areas.includes(a.nome))
    .flatMap((a) => a.subareas);

  if (carregando) return <p className="mx-auto max-w-3xl px-4 py-12">Carregando perfil...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Meu perfil</h1>
      <p className="mt-2 text-muted-foreground">
        Papel na comunidade: {papeis.join(", ") || "estudante"}.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/enviar-artigo" className="chip underline">
          Enviar artigo
        </Link>
        <Link to="/minha-agenda" className="chip underline">
          Minha agenda
        </Link>
        {podeModerar && (
          <Link to="/painel" className="chip underline">
            Área administrativa
          </Link>
        )}
      </div>

      <form onSubmit={salvar} className="card-surface mt-8 space-y-4 p-6">
        {(
          [
            ["nome", "Nome completo"],
            ["curso", "Curso e semestre"],
            ["email_profissional", "E-mail profissional"],
            ["lattes", "Link do Currículo Lattes"],
          ] as const
        ).map(([campo, rotulo]) => (
          <div key={campo}>
            <label htmlFor={campo} className="text-sm font-medium">
              {rotulo}
            </label>
            <input
              id={campo}
              value={form[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            />
          </div>
        ))}

        <div>
          <label htmlFor="bio" className="text-sm font-medium">
            Resumo da sua pesquisa
          </label>
          <textarea
            id="bio"
            value={form.bio}
            rows={3}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full rounded-lg border border-input bg-background p-3"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Áreas de pesquisa</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {areas.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => alternar("areas", a.nome)}
                aria-pressed={form.areas.includes(a.nome)}
                className={`min-h-11 rounded-lg border px-3 text-sm ${
                  form.areas.includes(a.nome)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-surface"
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Sub-áreas</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {subareasDisponiveis.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => alternar("subareas", s)}
                aria-pressed={form.subareas.includes(s)}
                className={`min-h-11 rounded-lg border px-3 text-sm ${
                  form.subareas.includes(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-surface"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        {salvo && (
          <p role="status" className="rounded-lg bg-secondary p-3 text-sm">
            {salvo}
          </p>
        )}

        <button
          type="submit"
          className="min-h-11 rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90"
        >
          Salvar perfil
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Minhas publicações</h2>
        {publicacoes.length === 0 ? (
          <p className="card-surface mt-3 p-5 text-muted-foreground">
            Você ainda não enviou artigos.{" "}
            <Link to="/enviar-artigo" className="text-primary underline">
              Enviar o primeiro
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {publicacoes.map((p) => (
              <li key={p.id} className="card-surface flex flex-wrap items-center gap-3 p-4">
                <span className="chip">{p.status}</span>
                <span className="font-medium">{p.titulo}</span>
                <span className="text-sm text-muted-foreground">
                  {p.subarea} · {p.ano}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
