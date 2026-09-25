import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/minha-agenda")({
  head: () => ({
    meta: [
      { title: "Minha agenda de eventos — Tech Circles" },
      {
        name: "description",
        content:
          "Veja os eventos acadêmicos em que você se inscreveu e escolha receber lembrete por e-mail.",
      },
      { property: "og:title", content: "Minha agenda de eventos — Tech Circles" },
      { property: "og:description", content: "Suas inscrições e lembretes em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MinhaAgenda,
});

type Inscricao = {
  id: string;
  lembrete_email: boolean;
  eventos: {
    id: string;
    nome: string;
    local: string;
    tipo: string;
    data_inicio: string;
    descricao: string;
  } | null;
};

function MinhaAgenda() {
  const { user } = useAuth();
  const [lista, setLista] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    if (!user) return;
    const { data } = await supabase
      .from("inscricoes")
      .select("id, lembrete_email, eventos(id, nome, local, tipo, data_inicio, descricao)")
      .eq("user_id", user.id);
    setLista((data ?? []) as unknown as Inscricao[]);
    setCarregando(false);
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function alternarLembrete(id: string, valor: boolean) {
    await supabase.from("inscricoes").update({ lembrete_email: valor }).eq("id", id);
    void carregar();
  }

  async function cancelar(id: string) {
    await supabase.from("inscricoes").delete().eq("id", id);
    void carregar();
  }

  if (carregando) return <p className="mx-auto max-w-3xl px-4 py-12">Carregando...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Minha agenda</h1>
      <p className="mt-2 text-muted-foreground">
        Eventos em que você se inscreveu.{" "}
        <Link to="/eventos" className="text-primary underline">
          Ver todos os eventos
        </Link>
        .
      </p>

      {lista.length === 0 ? (
        <p className="card-surface mt-8 p-6 text-muted-foreground">
          Você ainda não se inscreveu em nenhum evento.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {lista
            .filter((i) => i.eventos)
            .sort((a, b) => a.eventos!.data_inicio.localeCompare(b.eventos!.data_inicio))
            .map((i) => (
              <li key={i.id} className="card-surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{i.eventos!.tipo}</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatarData(i.eventos!.data_inicio)}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold">{i.eventos!.nome}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{i.eventos!.local}</p>
                <p className="mt-3">{i.eventos!.descricao}</p>

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={i.lembrete_email}
                    onChange={(e) => alternarLembrete(i.id, e.target.checked)}
                    className="size-4"
                  />
                  Quero lembrete por e-mail
                </label>

                <button
                  onClick={() => cancelar(i.id)}
                  className="mt-4 min-h-11 rounded-lg border border-border px-4 text-sm hover:bg-surface"
                >
                  Cancelar inscrição
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
