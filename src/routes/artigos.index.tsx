import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { areas, artigos } from "@/data/techCircles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GlossarioTexto } from "@/components/GlossarioTexto";

export const Route = createFileRoute("/artigos/")({
  head: () => ({
    meta: [
      { title: "Artigos e pesquisas — Tech Circles" },
      {
        name: "description",
        content:
          "Filtre artigos dos Anais do ENCIBRAC e do PIBIC por área e sub-área de pesquisa da Universidade Braz Cubas.",
      },
      { property: "og:title", content: "Artigos e pesquisas — Tech Circles" },
      {
        property: "og:description",
        content:
          "Busque publicações acadêmicas por área, sub-área, autor ou evento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Artigos,
});

type ArtigoLista = {
  id: string;
  titulo: string;
  resumo: string;
  autores: string[];
  orientador: string;
  area: string;
  subarea: string;
  evento: string;
  ano: number;
  link?: string | null;
};

function Artigos() {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState("todas");
  const [subarea, setSubarea] = useState("todas");
  const [aprovados, setAprovados] = useState<ArtigoLista[]>([]);
  const [interesses, setInteresses] = useState<{
    areas: string[];
    subareas: string[];
  } | null>(null);
  const [filtroTocado, setFiltroTocado] = useState(false);
  const [mostrarRecomendados, setMostrarRecomendados] = useState(true);

  useEffect(() => {
    supabase
      .from("submissoes")
      .select(
        "id, titulo, resumo, autores, orientador, area, subarea, evento, ano, link",
      )
      .eq("status", "aprovado")
      .order("created_at", { ascending: false })
      .then(({ data }) => setAprovados((data ?? []) as ArtigoLista[]));
  }, []);

  // Matching engine: carrega as áreas/sub-áreas de interesse salvas no perfil
  // do usuário logado, para montar um feed personalizado e pré-selecionar os filtros.
  useEffect(() => {
    if (!user) {
      setInteresses(null);
      return;
    }
    let ativo = true;
    supabase
      .from("profiles")
      .select("areas, subareas")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!ativo) return;
        setInteresses({
          areas: data?.areas ?? [],
          subareas: data?.subareas ?? [],
        });
      });
    return () => {
      ativo = false;
    };
  }, [user]);

  // Pré-seleciona o filtro de área pelo interesse do usuário, só na primeira
  // carga (se a pessoa já tiver mexido nos filtros manualmente, não sobrescreve).
  useEffect(() => {
    if (filtroTocado) return;
    const primeiraArea = interesses?.areas[0];
    if (primeiraArea) setArea(primeiraArea);
  }, [interesses, filtroTocado]);

  const subareasDisponiveis = useMemo(() => {
    if (area === "todas") return areas.flatMap((a) => a.subareas);
    return areas.find((a) => a.nome === area)?.subareas ?? [];
  }, [area]);

  const todos: ArtigoLista[] = useMemo(
    () => [...aprovados, ...(artigos as ArtigoLista[])],
    [aprovados],
  );

  const recomendados = useMemo(() => {
    if (
      !interesses ||
      (interesses.areas.length === 0 && interesses.subareas.length === 0)
    )
      return [];
    return todos.filter(
      (a) =>
        interesses.areas.includes(a.area) ||
        interesses.subareas.includes(a.subarea),
    );
  }, [todos, interesses]);

  const resultado = todos.filter((a) => {
    const texto =
      `${a.titulo} ${a.resumo} ${a.autores.join(" ")} ${a.evento}`.toLowerCase();
    return (
      texto.includes(busca.toLowerCase()) &&
      (area === "todas" || a.area === area) &&
      (subarea === "todas" || a.subarea === subarea)
    );
  });

  function limparFiltroDeInteresse() {
    setFiltroTocado(true);
    setArea("todas");
    setSubarea("todas");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Artigos e pesquisas</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Publicações de todos os cursos, com o tema e a sub-área de pesquisa em
        destaque.
      </p>

      {recomendados.length > 0 && mostrarRecomendados && (
        <section
          aria-labelledby="recomendados"
          className="card-surface mt-8 border-primary/40 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="recomendados"
              className="font-display text-lg font-semibold"
            >
              Recomendados para você
              <span className="chip ml-2 align-middle text-xs font-normal">
                baseado no seu perfil
              </span>
            </h2>
            <div className="flex gap-3 text-sm">
              {filtroTocado && (
                <button
                  onClick={limparFiltroDeInteresse}
                  className="text-primary underline"
                >
                  Limpar filtro de interesse
                </button>
              )}
              <button
                onClick={() => setMostrarRecomendados(false)}
                className="text-muted-foreground underline"
              >
                Ocultar
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {recomendados.length} artigo(s) nas suas áreas e sub-áreas de
            interesse. Ajuste em{" "}
            <Link to="/perfil" className="underline">
              Meu perfil
            </Link>
            .
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {recomendados.slice(0, 4).map((a) => (
              <li key={a.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{a.subarea}</span>
                  <span className="chip">{a.ano}</span>
                </div>
                <h3 className="mt-2 font-semibold leading-snug">{a.titulo}</h3>
                <Link
                  to="/artigos/$id"
                  params={{ id: a.id }}
                  className="mt-2 inline-block text-sm text-primary underline"
                >
                  Ler artigo
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="card-surface mt-8 grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <label htmlFor="busca" className="text-sm font-medium">
            Buscar
          </label>
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Título, autor ou evento"
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3 placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label htmlFor="area" className="text-sm font-medium">
            Área
          </label>
          <select
            id="area"
            value={area}
            onChange={(e) => {
              setFiltroTocado(true);
              setArea(e.target.value);
              setSubarea("todas");
            }}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          >
            <option value="todas">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.nome}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subarea" className="text-sm font-medium">
            Sub-área
          </label>
          <select
            id="subarea"
            value={subarea}
            onChange={(e) => {
              setFiltroTocado(true);
              setSubarea(e.target.value);
            }}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          >
            <option value="todas">Todas as sub-áreas</option>
            {subareasDisponiveis.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {resultado.length} artigo(s) encontrado(s).
      </p>

      <ul className="mt-4 grid gap-4">
        {resultado.map((a) => (
          <li key={a.id} className="card-surface p-6">
            <div className="flex flex-wrap gap-2">
              <span className="chip">{a.area}</span>
              <span className="chip">{a.subarea}</span>
              <span className="chip">{a.evento}</span>
              <span className="chip">{a.ano}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold leading-snug">
              {a.titulo}
            </h2>
            <p className="mt-2 text-muted-foreground">
              <GlossarioTexto texto={a.resumo} />
            </p>
            <p className="mt-4 text-sm">
              <span className="font-medium">Autoria:</span>{" "}
              {a.autores.join(", ")}
              {a.orientador ? ` · Orientação: ${a.orientador}` : ""}
            </p>
            <Link
              to="/artigos/$id"
              params={{ id: a.id }}
              className="chip mt-4 inline-flex min-h-11 items-center px-5 font-medium"
            >
              Ler artigo
            </Link>
          </li>
        ))}
      </ul>

      {resultado.length === 0 && (
        <p className="card-surface mt-4 p-6 text-muted-foreground">
          Nenhum artigo corresponde a esses filtros. Tente outra área ou limpe a
          busca.
        </p>
      )}
    </div>
  );
}
