import { Fragment } from "react";
import { glossario } from "@/data/techCircles";

function escapeRegExp(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Termos maiores primeiro, para "Currículo Lattes" casar antes de um eventual "Lattes" avulso.
const termosOrdenados = [...glossario].sort(
  (a, b) => b.termo.length - a.termo.length,
);
const padrao =
  termosOrdenados.length > 0
    ? new RegExp(
        `(${termosOrdenados.map((g) => escapeRegExp(g.termo)).join("|")})`,
        "gi",
      )
    : null;

/**
 * Renderiza um texto destacando jargões acadêmicos (Anais, PIBIC, Lattes, peer
 * review etc.). Cada termo vira um link sublinhado que mostra o significado ao
 * passar o mouse/focar (acessível via aria-label) e redireciona para uma
 * página externa com a explicação completa ao clicar.
 */
export function GlossarioTexto({ texto }: { texto: string }) {
  if (!padrao || !texto) return <>{texto}</>;

  const partes = texto.split(padrao);

  return (
    <>
      {partes.map((parte, i) => {
        const termo = termosOrdenados.find(
          (g) => g.termo.toLowerCase() === parte.toLowerCase(),
        );
        if (!termo) return <Fragment key={i}>{parte}</Fragment>;
        return (
          <a
            key={i}
            href={termo.link}
            target="_blank"
            rel="noreferrer"
            title={termo.definicao}
            aria-label={`${parte}: ${termo.definicao}. Abre explicação em nova aba.`}
            className="underline decoration-dotted decoration-2 underline-offset-4 text-primary hover:decoration-solid"
          >
            {parte}
          </a>
        );
      })}
    </>
  );
}
