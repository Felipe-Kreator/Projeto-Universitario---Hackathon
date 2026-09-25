import { createFileRoute } from "@tanstack/react-router";
import { glossario } from "@/data/techCircles";

export const Route = createFileRoute("/glossario")({
  head: () => ({
    meta: [
      { title: "Glossário acadêmico — Tech Circles" },
      {
        name: "description",
        content:
          "Termos e jargões da vida acadêmica explicados em linguagem simples, com links para leitura complementar.",
      },
      { property: "og:title", content: "Glossário acadêmico — Tech Circles" },
      {
        property: "og:description",
        content: "Anais, PIBIC, Lattes, DOI e outros termos explicados para quem está começando.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Glossario,
});

function Glossario() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Glossário acadêmico</h1>
      <p className="mt-2 text-muted-foreground">
        Jargões técnicos explicados em poucas linhas, com um link externo para se aprofundar.
      </p>

      <dl className="mt-8 grid gap-4">
        {glossario.map((g) => (
          <div key={g.termo} className="card-surface p-5">
            <dt className="font-display text-lg font-semibold">{g.termo}</dt>
            <dd className="mt-1 text-muted-foreground">{g.definicao}</dd>
            <dd className="mt-2">
              <a className="text-sm text-primary underline" href={g.link} target="_blank" rel="noreferrer">
                Saiba mais sobre {g.termo}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
