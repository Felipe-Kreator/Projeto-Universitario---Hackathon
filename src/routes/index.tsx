import { createFileRoute, Link } from "@tanstack/react-router";
import { artigos, eventos, pessoas } from "@/data/techCircles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech Circles — Pesquisa acadêmica da Universidade Braz Cubas" },
      {
        name: "description",
        content:
          "Comunidade que reúne artigos, eventos e pesquisadores da Universidade Braz Cubas, do ENCIBRAC ao PIBIC.",
      },
      { property: "og:title", content: "Tech Circles — Pesquisa acadêmica Braz Cubas" },
      {
        property: "og:description",
        content: "Encontre artigos, orientadores e eventos científicos da Universidade Braz Cubas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const destaques = artigos.slice(0, 3);
  const proximos = eventos.slice(0, 2);

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="chip">Universidade Braz Cubas</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            A pesquisa da sua universidade, finalmente fácil de encontrar.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            O Tech Circles reúne artigos dos Anais do ENCIBRAC, projetos do PIBIC, perfis de
            estudantes e orientadores — organizados por área e sub-área de pesquisa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/artigos"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90"
            >
              Explorar artigos
            </Link>
            <Link
              to="/pessoas"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-5 font-medium hover:bg-surface"
            >
              Conhecer pesquisadores
            </Link>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { n: `${artigos.length}+`, r: "artigos catalogados no protótipo" },
              { n: `${pessoas.length}`, r: "perfis com Lattes e e-mail institucional" },
              { n: `${eventos.length}`, r: "eventos e editais divulgados" },
            ].map((item) => (
              <div key={item.r} className="card-surface p-5">
                <dt className="font-display text-3xl font-bold text-primary">{item.n}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.r}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold">Publicações recentes</h2>
          <Link to="/artigos" className="text-sm font-medium text-primary underline">
            Ver todos os artigos
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {destaques.map((a) => (
            <article key={a.id} className="card-surface flex flex-col p-5">
              <span className="chip self-start">{a.subarea}</span>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{a.titulo}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.resumo}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {a.autores.join(", ")} · {a.evento} · {a.ano}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold">Agenda acadêmica</h2>
          <Link to="/eventos" className="text-sm font-medium text-primary underline">
            Ver agenda completa
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {proximos.map((e) => (
            <article key={e.id} className="card-surface p-5">
              <span className="chip">{e.tipo}</span>
              <h3 className="mt-3 text-lg font-semibold">{e.nome}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{e.data}</p>
              <p className="mt-2 text-sm text-muted-foreground">{e.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
