import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  pessoas as pessoasDemo,
  artigos as artigosDemo,
} from "@/data/techCircles";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pessoas")({
  head: () => ({
    meta: [
      { title: "Estudantes e orientadores — Tech Circles" },
      {
        name: "description",
        content:
          "Perfis de estudantes, orientadores e conselho da Universidade Braz Cubas, com Lattes, e-mail institucional e linhas de pesquisa.",
      },
      {
        property: "og:title",
        content: "Estudantes e orientadores — Tech Circles",
      },
      {
        property: "og:description",
        content:
          "Veja quem pesquisa o quê na Universidade Braz Cubas e como entrar em contato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pessoas,
});

const papeis = ["Todos", "Estudante", "Orientador", "Conselho"] as const;
type Papel = (typeof papeis)[number];

type PessoaReal = {
  id: string;
  nome: string;
  curso: string;
  emailProfissional: string;
  lattes: string;
  bio: string;
  areas: string[];
  subareas: string[];
  papel: Exclude<Papel, "Todos">;
  iniciais: string;
};

type ArtigoResumo = {
  id: string;
  titulo: string;
  subarea: string;
  ano: number;
};

function papelMaisAlto(roles: string[]): Exclude<Papel, "Todos"> {
  if (roles.includes("conselho")) return "Conselho";
  if (roles.includes("orientador")) return "Orientador";
  return "Estudante";
}

function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = [partes[0]?.[0], partes[partes.length - 1]?.[0]].filter(
    Boolean,
  );
  return letras.join("").toUpperCase() || "?";
}

function Pessoas() {
  const [papel, setPapel] = useState<Papel>("Todos");
  const [pessoasReais, setPessoasReais] = useState<PessoaReal[] | null>(null);
  const [publicacoesPorAutor, setPublicacoesPorAutor] = useState<
    Record<string, ArtigoResumo[]>
  >({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [{ data: perfis }, { data: roles }, { data: subs }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, nome, curso, email_profissional, lattes, bio, areas, subareas",
            )
            .neq("nome", "")
            .order("nome", { ascending: true }),
          supabase.from("user_roles").select("user_id, role"),
          supabase
            .from("submissoes")
            .select("id, titulo, subarea, ano, autor_id, orientador")
            .eq("status", "aprovado"),
        ]);

      if (!ativo) return;

      const rolesPorUsuario = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        const lista = rolesPorUsuario.get(r.user_id) ?? [];
        lista.push(r.role as string);
        rolesPorUsuario.set(r.user_id, lista);
      });

      const lista: PessoaReal[] = (perfis ?? []).map((p) => ({
        id: p.id,
        nome: p.nome,
        curso: p.curso,
        emailProfissional: p.email_profissional,
        lattes: p.lattes,
        bio: p.bio,
        areas: p.areas ?? [],
        subareas: p.subareas ?? [],
        papel: papelMaisAlto(rolesPorUsuario.get(p.id) ?? []),
        iniciais: iniciaisDe(p.nome),
      }));

      const publicacoes: Record<string, ArtigoResumo[]> = {};
      (subs ?? []).forEach((s) => {
        const resumo: ArtigoResumo = {
          id: s.id,
          titulo: s.titulo,
          subarea: s.subarea,
          ano: s.ano,
        };
        if (s.autor_id) {
          publicacoes[s.autor_id] = [
            ...(publicacoes[s.autor_id] ?? []),
            resumo,
          ];
        }
        const orientadorCorrespondente = lista.find(
          (p) => p.nome === s.orientador,
        );
        if (orientadorCorrespondente) {
          publicacoes[orientadorCorrespondente.id] = [
            ...(publicacoes[orientadorCorrespondente.id] ?? []),
            resumo,
          ];
        }
      });

      setPessoasReais(lista);
      setPublicacoesPorAutor(publicacoes);
      setCarregando(false);
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const usandoDemo = !carregando && (pessoasReais?.length ?? 0) === 0;

  const listaExibida = usandoDemo
    ? pessoasDemo.map((p) => ({
        id: p.id,
        nome: p.nome,
        curso: p.curso,
        emailProfissional: p.emailProfissional,
        lattes: p.lattes,
        bio: p.bio,
        areas: p.areas,
        subareas: p.subareas,
        papel: p.papel,
        iniciais: p.iniciais,
      }))
    : (pessoasReais ?? []);

  const lista = listaExibida.filter(
    (p) => papel === "Todos" || p.papel === papel,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Pessoas da comunidade</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Cada perfil mostra o e-mail profissional, o curso, as linhas de pesquisa
        e o Currículo Lattes.
      </p>

      {usandoDemo && (
        <p className="card-surface mt-6 p-4 text-sm text-muted-foreground">
          Ainda não há perfis preenchidos na plataforma. Abaixo, exemplos de
          demonstração — assim que estudantes e orientadores completarem o
          próprio perfil, eles aparecem aqui automaticamente.
        </p>
      )}

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por papel"
      >
        {papeis.map((p) => (
          <button
            key={p}
            onClick={() => setPapel(p)}
            aria-pressed={papel === p}
            className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${
              papel === p
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-surface"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="mt-8 text-muted-foreground">Carregando pessoas...</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {lista.map((p) => {
            const publicacoes = usandoDemo
              ? artigosDemo.filter(
                  (a) => a.autores.includes(p.nome) || a.orientador === p.nome,
                )
              : (publicacoesPorAutor[p.id] ?? []);
            return (
              <article key={p.id} className="card-surface p-6">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground"
                  >
                    {p.iniciais}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{p.nome}</h2>
                    <p className="text-sm text-muted-foreground">{p.curso}</p>
                    <span className="chip mt-2">{p.papel}</span>
                  </div>
                </div>

                {p.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">{p.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.subareas.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>

                <dl className="mt-4 space-y-1 text-sm">
                  {p.emailProfissional && (
                    <div className="flex gap-2">
                      <dt className="font-medium">E-mail:</dt>
                      <dd>
                        <a
                          className="text-primary underline"
                          href={`mailto:${p.emailProfissional}`}
                        >
                          {p.emailProfissional}
                        </a>
                      </dd>
                    </div>
                  )}
                  {p.lattes && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Lattes:</dt>
                      <dd>
                        <a
                          className="text-primary underline"
                          href={p.lattes}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir currículo
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {publicacoes.length > 0 && (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-medium">
                      Publicações ({publicacoes.length})
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {publicacoes.map((a) => (
                        <li key={a.id}>
                          {a.titulo}{" "}
                          <span className="text-xs">
                            — {a.subarea}, {a.ano}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
          {lista.length === 0 && (
            <p className="card-surface p-6 text-muted-foreground">
              Nenhuma pessoa encontrada com esse filtro.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
