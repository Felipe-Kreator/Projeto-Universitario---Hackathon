import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { eventos as eventosDemo } from "@/data/techCircles";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos e editais — Tech Circles" },
      {
        name: "description",
        content:
          "Agenda do ENCIBRAC, do PIBIC e dos encontros de pesquisa da Universidade Braz Cubas.",
      },
      { property: "og:title", content: "Eventos e editais — Tech Circles" },
      {
        property: "og:description",
        content: "Datas, locais e prazos dos eventos científicos da Universidade Braz Cubas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Eventos,
});

type Evento = {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  tipo: string;
  data_inicio: string;
};

function Eventos() {
  const { user } = useAuth();
  const [lista, setLista] = useState<Evento[]>([]);
  const [inscritos, setInscritos] = useState<Set<string>>(new Set());
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("eventos")
      .select("id, nome, descricao, local, tipo, data_inicio")
      .eq("publicado", true)
      .order("data_inicio", { ascending: true })
      .then(({ data }) => setLista((data ?? []) as Evento[]));
  }, []);

  async function carregarInscricoes() {
    if (!user) return setInscritos(new Set());
    const { data } = await supabase.from("inscricoes").select("evento_id").eq("user_id", user.id);
    setInscritos(new Set((data ?? []).map((i) => i.evento_id)));
  }

  useEffect(() => {
    void carregarInscricoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function alternar(id: string) {
    if (!user) return;
    if (inscritos.has(id)) {
      await supabase.from("inscricoes").delete().eq("evento_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("inscricoes").insert({ evento_id: id, user_id: user.id });
    }
    void carregarInscricoes();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Eventos e editais</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Congressos, prazos de bolsa e encontros abertos. Inscreva-se para acompanhar na sua agenda.
      </p>

      {lista.length === 0 ? (
        <>
          <p className="card-surface mt-8 p-4 text-sm text-muted-foreground">
            Nenhum evento cadastrado ainda. Abaixo, exemplos de demonstração.
          </p>
          <ol className="mt-4 space-y-4">
            {eventosDemo.map((e) => (
              <li key={e.id} className="card-surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{e.tipo}</span>
                  <span className="text-sm font-semibold text-primary">{e.data}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold">{e.nome}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.local}</p>
                <p className="mt-3">{e.descricao}</p>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <ol className="mt-8 space-y-4">
          {lista.map((e) => (
            <li key={e.id} className="card-surface p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{e.tipo}</span>
                <span className="text-sm font-semibold text-primary">
                  {new Date(e.data_inicio).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{e.nome}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{e.local}</p>
              {aberto === e.id && <p className="mt-3 whitespace-pre-line">{e.descricao}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setAberto(aberto === e.id ? null : e.id)}
                  aria-expanded={aberto === e.id}
                  className="min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  {aberto === e.id ? "Ocultar detalhes" : "Ver detalhes"}
                </button>
                {user ? (
                  <button
                    onClick={() => alternar(e.id)}
                    className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    {inscritos.has(e.id) ? "Cancelar inscrição" : "Inscrever-se"}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Entre para se inscrever
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
