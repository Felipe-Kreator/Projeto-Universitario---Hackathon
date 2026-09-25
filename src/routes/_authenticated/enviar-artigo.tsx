import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { areas } from "@/data/techCircles";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/enviar-artigo")({
  head: () => ({
    meta: [
      { title: "Enviar artigo — Tech Circles" },
      {
        name: "description",
        content:
          "Envie seu artigo com autores, resumo, área, sub-área e arquivo PDF ou link para avaliação do conselho e dos orientadores.",
      },
      { property: "og:title", content: "Enviar artigo — Tech Circles" },
      {
        property: "og:description",
        content: "Submissão de artigos da Universidade Braz Cubas com acompanhamento da aprovação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EnviarArtigo,
});

type Envio = {
  id: string;
  titulo: string;
  status: string;
  parecer: string;
  area: string;
  subarea: string;
  ano: number;
  link: string | null;
  arquivo_path: string | null;
};

function EnviarArtigo() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [autores, setAutores] = useState("");
  const [orientador, setOrientador] = useState("");
  const [area, setArea] = useState(areas[0]!.nome);
  const [subarea, setSubarea] = useState(areas[0]!.subareas[0]!);
  const [evento, setEvento] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [link, setLink] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [meus, setMeus] = useState<Envio[]>([]);

  const subareasDisponiveis = areas.find((a) => a.nome === area)?.subareas ?? [];

  async function carregar() {
    if (!user) return;
    const { data } = await supabase
      .from("submissoes")
      .select("id, titulo, status, parecer, area, subarea, ano, link, arquivo_path")
      .eq("autor_id", user.id)
      .order("created_at", { ascending: false });
    setMeus((data ?? []) as Envio[]);
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setOk("");

    if (!arquivo && !link.trim()) {
      setErro("Anexe o PDF do artigo ou informe um link.");
      return;
    }

    setEnviando(true);
    let arquivoPath: string | null = null;

    if (arquivo) {
      if (arquivo.type !== "application/pdf") {
        setEnviando(false);
        setErro("O arquivo precisa estar em PDF.");
        return;
      }
      const caminho = `${user.id}/${Date.now()}-${arquivo.name.replace(/[^\w.-]/g, "_")}`;
      const { error: erroUpload } = await supabase.storage.from("artigos").upload(caminho, arquivo);
      if (erroUpload) {
        setEnviando(false);
        setErro("Não foi possível enviar o arquivo. Verifique o tamanho (até 20 MB).");
        return;
      }
      arquivoPath = caminho;
    }

    const { error } = await supabase.from("submissoes").insert({
      autor_id: user.id,
      titulo,
      resumo,
      autores: autores
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      orientador,
      area,
      subarea,
      evento,
      ano,
      link: link.trim() || null,
      arquivo_path: arquivoPath,
    });

    setEnviando(false);
    if (error) return setErro("Não foi possível registrar o envio. Tente novamente.");

    setOk("Artigo enviado. Agora ele aguarda avaliação do conselho ou de um orientador.");
    setTitulo("");
    setResumo("");
    setAutores("");
    setOrientador("");
    setEvento("");
    setLink("");
    setArquivo(null);
    void carregar();
  }

  async function remover(id: string) {
    await supabase.from("submissoes").delete().eq("id", id);
    void carregar();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Enviar artigo</h1>
      <p className="mt-2 text-muted-foreground">
        Cada envio passa por avaliação do conselho de pesquisa ou de um orientador antes de aparecer
        na busca pública.
      </p>

      <form onSubmit={enviar} className="card-surface mt-8 space-y-4 p-6">
        <div>
          <label htmlFor="titulo" className="text-sm font-medium">
            Título
          </label>
          <input
            id="titulo"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        <div>
          <label htmlFor="resumo" className="text-sm font-medium">
            Resumo
          </label>
          <textarea
            id="resumo"
            required
            rows={4}
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background p-3"
          />
        </div>

        <div>
          <label htmlFor="autores" className="text-sm font-medium">
            Autores (separados por vírgula)
          </label>
          <input
            id="autores"
            required
            value={autores}
            onChange={(e) => setAutores(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        <div>
          <label htmlFor="orientador" className="text-sm font-medium">
            Orientação (opcional)
          </label>
          <input
            id="orientador"
            value={orientador}
            onChange={(e) => setOrientador(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="area" className="text-sm font-medium">
              Área
            </label>
            <select
              id="area"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                const nova = areas.find((a) => a.nome === e.target.value);
                setSubarea(nova?.subareas[0] ?? "");
              }}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            >
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
              onChange={(e) => setSubarea(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              {subareasDisponiveis.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="evento" className="text-sm font-medium">
              Evento ou programa
            </label>
            <input
              id="evento"
              value={evento}
              placeholder="Anais do ENCIBRAC"
              onChange={(e) => setEvento(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            />
          </div>
          <div>
            <label htmlFor="ano" className="text-sm font-medium">
              Ano
            </label>
            <input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
            />
          </div>
        </div>

        <div>
          <label htmlFor="arquivo" className="text-sm font-medium">
            Arquivo PDF (até 20 MB)
          </label>
          <input
            id="arquivo"
            type="file"
            accept="application/pdf"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background p-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="link" className="text-sm font-medium">
            Ou link do artigo
          </label>
          <input
            id="link"
            type="url"
            value={link}
            placeholder="https://"
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        {ok && (
          <p role="status" className="rounded-lg bg-secondary p-3 text-sm">
            {ok}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="min-h-11 rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar para avaliação"}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Meus envios</h2>
        <ul className="mt-3 space-y-3">
          {meus.map((m) => (
            <li key={m.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{m.status}</span>
                <span className="chip">{m.subarea}</span>
                <span className="chip">{m.ano}</span>
              </div>
              <p className="mt-2 font-medium">{m.titulo}</p>
              {m.parecer && (
                <p className="mt-2 text-sm text-muted-foreground">Parecer: {m.parecer}</p>
              )}
              {m.status === "pendente" && (
                <button
                  onClick={() => remover(m.id)}
                  className="mt-3 min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  Cancelar envio
                </button>
              )}
            </li>
          ))}
          {meus.length === 0 && <li className="text-muted-foreground">Nenhum envio ainda.</li>}
        </ul>
      </section>
    </div>
  );
}
