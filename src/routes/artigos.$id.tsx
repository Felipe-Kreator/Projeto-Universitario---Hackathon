import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { artigos as artigosMock } from "@/data/techCircles";
import { supabase } from "@/integrations/supabase/client";
import { GlossarioTexto } from "@/components/GlossarioTexto";

export const Route = createFileRoute("/artigos/$id")({
  head: () => ({
    meta: [
      { title: "Leitura de artigo — Tech Circles" },
      {
        name: "description",
        content:
          "Leia o resumo completo do artigo e acesse o PDF ou o link de publicação.",
      },
      { property: "og:title", content: "Leitura de artigo — Tech Circles" },
      {
        property: "og:description",
        content: "Resumo, autoria e acesso ao arquivo completo do artigo.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LerArtigo,
});

type ArtigoDetalhe = {
  id: string;
  titulo: string;
  resumo: string;
  autores: string[];
  orientador?: string | null;
  area: string;
  subarea: string;
  evento: string;
  ano: number;
  link?: string | null;
  arquivo_path?: string | null;
};

function LerArtigo() {
  const { id } = useParams({ from: "/artigos/$id" });
  const [artigo, setArtigo] = useState<ArtigoDetalhe | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const { data } = await supabase
        .from("submissoes")
        .select(
          "id, titulo, resumo, autores, orientador, area, subarea, evento, ano, link, arquivo_path",
        )
        .eq("id", id)
        .eq("status", "aprovado")
        .maybeSingle();

      let encontrado = (data as ArtigoDetalhe | null) ?? null;
      if (!encontrado) {
        encontrado =
          (artigosMock.find((a) => a.id === id) as ArtigoDetalhe | undefined) ??
          null;
      }
      if (!ativo) return;
      setArtigo(encontrado);

      if (encontrado?.arquivo_path) {
        const { data: assinado } = await supabase.storage
          .from("artigos")
          .createSignedUrl(encontrado.arquivo_path, 60 * 60);
        if (ativo) setPdfUrl(assinado?.signedUrl ?? null);
      }
      if (ativo) setCarregando(false);
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-muted-foreground">Carregando artigo…</p>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Ele pode ter sido removido ou ainda não foi aprovado.
        </p>
        <Link to="/artigos" className="chip mt-6 inline-block">
          Voltar para a lista de artigos
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        to="/artigos"
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Voltar para artigos
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="chip">{artigo.area}</span>
        <span className="chip">{artigo.subarea}</span>
        <span className="chip">{artigo.evento}</span>
        <span className="chip">{artigo.ano}</span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight">{artigo.titulo}</h1>

      <p className="mt-4 text-sm">
        <span className="font-medium">Autoria:</span>{" "}
        {artigo.autores.join(", ")}
        {artigo.orientador ? ` · Orientação: ${artigo.orientador}` : ""}
      </p>

      <section aria-labelledby="resumo" className="card-surface mt-8 p-6">
        <h2 id="resumo" className="text-lg font-semibold">
          Resumo
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          <GlossarioTexto texto={artigo.resumo} />
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Palavras sublinhadas são jargões acadêmicos — passe o mouse para ver o
          significado ou clique para saber mais. Veja também o{" "}
          <Link to="/glossario" className="underline">
            glossário completo
          </Link>
          .
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="chip inline-flex min-h-11 items-center px-5 font-medium"
          >
            Abrir PDF completo
          </a>
        )}
        {artigo.link && (
          <a
            href={artigo.link}
            target="_blank"
            rel="noreferrer"
            className="chip inline-flex min-h-11 items-center px-5 font-medium"
          >
            Ver publicação original
          </a>
        )}
        {!pdfUrl && !artigo.link && (
          <p className="text-sm text-muted-foreground">
            O arquivo completo deste artigo ainda não está disponível na
            plataforma.
          </p>
        )}
      </div>
    </article>
  );
}
