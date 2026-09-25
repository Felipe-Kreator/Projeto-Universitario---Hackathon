import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Área administrativa — Tech Circles" },
      {
        name: "description",
        content:
          "Conselho e orientadores avaliam artigos enviados e cadastram eventos acadêmicos da Universidade Braz Cubas.",
      },
      { property: "og:title", content: "Área administrativa — Tech Circles" },
      {
        property: "og:description",
        content: "Moderação de artigos e gestão de eventos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

type Submissao = {
  id: string;
  titulo: string;
  resumo: string;
  autores: string[];
  orientador: string;
  area: string;
  subarea: string;
  evento: string;
  ano: number;
  status: string;
  parecer: string;
  link: string | null;
  arquivo_path: string | null;
};

type Evento = {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  tipo: string;
  data_inicio: string;
  publicado: boolean;
};

type Metricas = {
  perfis: number;
  aprovados: number;
  pendentes: number;
  rejeitados: number;
  eventosPublicados: number;
  inscricoes: number;
  porArea: { area: string; total: number }[];
};

const metricasVazias: Metricas = {
  perfis: 0,
  aprovados: 0,
  pendentes: 0,
  rejeitados: 0,
  eventosPublicados: 0,
  inscricoes: 0,
  porArea: [],
};

function Painel() {
  const { user, podeModerar, carregando } = useAuth();
  const [subs, setSubs] = useState<Submissao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [pareceres, setPareceres] = useState<Record<string, string>>({});
  const [metricas, setMetricas] = useState<Metricas>(metricasVazias);
  const [novo, setNovo] = useState({
    nome: "",
    descricao: "",
    local: "",
    tipo: "Encontro",
    data_inicio: "",
    publicado: true,
  });
  const [erro, setErro] = useState("");

  async function carregar() {
    const [{ data: s }, { data: e }, contagens] = await Promise.all([
      supabase
        .from("submissoes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("eventos")
        .select("*")
        .order("data_inicio", { ascending: true }),
      Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .neq("nome", ""),
        supabase
          .from("eventos")
          .select("*", { count: "exact", head: true })
          .eq("publicado", true),
        supabase.from("inscricoes").select("*", { count: "exact", head: true }),
      ]),
    ]);
    const listaSubs = (s ?? []) as Submissao[];
    setSubs(listaSubs);
    setEventos((e ?? []) as Evento[]);

    const [
      { count: perfis },
      { count: eventosPublicados },
      { count: inscricoes },
    ] = contagens;

    const porAreaMapa = new Map<string, number>();
    listaSubs
      .filter((sub) => sub.status === "aprovado")
      .forEach((sub) =>
        porAreaMapa.set(sub.area, (porAreaMapa.get(sub.area) ?? 0) + 1),
      );

    setMetricas({
      perfis: perfis ?? 0,
      aprovados: listaSubs.filter((sub) => sub.status === "aprovado").length,
      pendentes: listaSubs.filter((sub) => sub.status === "pendente").length,
      rejeitados: listaSubs.filter((sub) => sub.status === "rejeitado").length,
      eventosPublicados: eventosPublicados ?? 0,
      inscricoes: inscricoes ?? 0,
      porArea: [...porAreaMapa.entries()]
        .map(([area, total]) => ({ area, total }))
        .sort((a, b) => b.total - a.total),
    });
  }

  useEffect(() => {
    if (podeModerar) void carregar();
  }, [podeModerar]);

  if (carregando)
    return <p className="mx-auto max-w-4xl px-4 py-12">Carregando...</p>;

  if (!podeModerar) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Área restrita</h1>
        <p className="mt-3 text-muted-foreground">
          Esta área é do conselho de pesquisa e dos orientadores. Se você
          orienta pesquisas, peça ao conselho para liberar seu acesso.
        </p>
      </div>
    );
  }

  async function avaliar(id: string, status: "aprovado" | "rejeitado") {
    const { error } = await supabase
      .from("submissoes")
      .update({
        status,
        parecer: pareceres[id] ?? "",
        revisor_id: user?.id ?? null,
      })
      .eq("id", id);
    if (error) setErro("Não foi possível registrar a avaliação.");
    void carregar();
  }

  async function abrirArquivo(path: string) {
    const { data } = await supabase.storage
      .from("artigos")
      .createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  async function criarEvento(ev: React.FormEvent) {
    ev.preventDefault();
    setErro("");
    const { error } = await supabase.from("eventos").insert({
      ...novo,
      data_inicio: new Date(novo.data_inicio).toISOString(),
      criado_por: user?.id ?? null,
    });
    if (error) return setErro("Não foi possível criar o evento.");
    setNovo({
      nome: "",
      descricao: "",
      local: "",
      tipo: "Encontro",
      data_inicio: "",
      publicado: true,
    });
    void carregar();
  }

  async function alternarPublicacao(id: string, publicado: boolean) {
    await supabase.from("eventos").update({ publicado }).eq("id", id);
    void carregar();
  }

  async function removerEvento(id: string) {
    await supabase.from("eventos").delete().eq("id", id);
    void carregar();
  }

  const pendentes = subs.filter((s) => s.status === "pendente");
  const avaliados = subs.filter((s) => s.status !== "pendente");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Área administrativa</h1>
      <p className="mt-2 text-muted-foreground">
        Avalie artigos enviados e mantenha a agenda de eventos da universidade.
      </p>

      {erro && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {erro}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold">Métricas iniciais</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Perfis cadastrados", metricas.perfis],
            ["Artigos aprovados", metricas.aprovados],
            ["Aguardando avaliação", metricas.pendentes],
            ["Artigos rejeitados", metricas.rejeitados],
            ["Eventos publicados", metricas.eventosPublicados],
            ["Inscrições em eventos", metricas.inscricoes],
          ].map(([rotulo, valor]) => (
            <div key={rotulo as string} className="card-surface p-4">
              <p className="text-2xl font-bold">{valor}</p>
              <p className="text-xs text-muted-foreground">{rotulo}</p>
            </div>
          ))}
        </div>

        {metricas.porArea.length > 0 && (
          <div className="card-surface mt-3 p-5">
            <p className="text-sm font-medium">Artigos aprovados por área</p>
            <ul className="mt-3 space-y-2">
              {metricas.porArea.map(({ area, total }) => {
                const maiorTotal = metricas.porArea[0]?.total ?? total;
                return (
                  <li key={area} className="flex items-center gap-3 text-sm">
                    <span className="w-48 shrink-0 truncate">{area}</span>
                    <span
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.max((total / maiorTotal) * 100, 6)}%`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{total}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">
          Artigos aguardando avaliação ({pendentes.length})
        </h2>
        <ul className="mt-3 space-y-4">
          {pendentes.map((s) => (
            <li key={s.id} className="card-surface p-6">
              <div className="flex flex-wrap gap-2">
                <span className="chip">{s.area}</span>
                <span className="chip">{s.subarea}</span>
                <span className="chip">{s.ano}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{s.titulo}</h3>
              <p className="mt-2 text-muted-foreground">{s.resumo}</p>
              <p className="mt-2 text-sm">
                Autoria: {s.autores.join(", ")}
                {s.orientador ? ` · Orientação: ${s.orientador}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {s.arquivo_path && (
                  <button
                    onClick={() => abrirArquivo(s.arquivo_path!)}
                    className="text-primary underline"
                  >
                    Abrir PDF
                  </button>
                )}
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Abrir link
                  </a>
                )}
              </div>

              <label
                htmlFor={`parecer-${s.id}`}
                className="mt-4 block text-sm font-medium"
              >
                Parecer
              </label>
              <textarea
                id={`parecer-${s.id}`}
                rows={2}
                value={pareceres[s.id] ?? ""}
                onChange={(e) =>
                  setPareceres({ ...pareceres, [s.id]: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background p-3"
              />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => avaliar(s.id, "aprovado")}
                  className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => avaliar(s.id, "rejeitado")}
                  className="min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  Rejeitar
                </button>
              </div>
            </li>
          ))}
          {pendentes.length === 0 && (
            <li className="text-muted-foreground">Nenhum artigo pendente.</li>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Já avaliados</h2>
        <ul className="mt-3 space-y-2">
          {avaliados.map((s) => (
            <li
              key={s.id}
              className="card-surface flex flex-wrap items-center gap-3 p-4"
            >
              <span className="chip">{s.status}</span>
              <span className="font-medium">{s.titulo}</span>
              <span className="text-sm text-muted-foreground">{s.subarea}</span>
            </li>
          ))}
          {avaliados.length === 0 && (
            <li className="text-muted-foreground">Nada por aqui ainda.</li>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Cadastrar evento</h2>
        <form
          onSubmit={criarEvento}
          className="card-surface mt-3 space-y-4 p-6"
        >
          <div>
            <label htmlFor="ev-nome" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="ev-nome"
              required
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            />
          </div>
          <div>
            <label htmlFor="ev-desc" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="ev-desc"
              rows={3}
              value={novo.descricao}
              onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background p-3"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ev-local" className="text-sm font-medium">
                Local
              </label>
              <input
                id="ev-local"
                value={novo.local}
                onChange={(e) => setNovo({ ...novo, local: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
              />
            </div>
            <div>
              <label htmlFor="ev-tipo" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="ev-tipo"
                value={novo.tipo}
                onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
              >
                <option>Congresso</option>
                <option>Edital</option>
                <option>Encontro</option>
              </select>
            </div>
            <div>
              <label htmlFor="ev-data" className="text-sm font-medium">
                Data e hora
              </label>
              <input
                id="ev-data"
                type="datetime-local"
                required
                value={novo.data_inicio}
                onChange={(e) =>
                  setNovo({ ...novo, data_inicio: e.target.value })
                }
                className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={novo.publicado}
              onChange={(e) =>
                setNovo({ ...novo, publicado: e.target.checked })
              }
              className="size-4"
            />
            Publicar imediatamente
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90"
          >
            Cadastrar evento
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Eventos cadastrados</h2>
        <ul className="mt-3 space-y-3">
          {eventos.map((e) => (
            <li key={e.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{e.tipo}</span>
                <span className="chip">
                  {e.publicado ? "publicado" : "rascunho"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(e.data_inicio).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 font-medium">{e.nome}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => alternarPublicacao(e.id, !e.publicado)}
                  className="min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  {e.publicado ? "Despublicar" : "Publicar"}
                </button>
                <button
                  onClick={() => removerEvento(e.id)}
                  className="min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
          {eventos.length === 0 && (
            <li className="text-muted-foreground">Nenhum evento ainda.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
