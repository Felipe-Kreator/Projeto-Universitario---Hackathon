// Edge Function: enviar-lembretes
//
// Roda periodicamente (ver migration de cron) e envia um e-mail de lembrete
// para quem se inscreveu em um evento que começa nas próximas 48 horas e
// ainda não recebeu o lembrete (inscricoes.lembrete_enviado_em IS NULL).
//
// Variáveis de ambiente necessárias (configuradas como Secrets do projeto):
// - SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY: já disponíveis automaticamente
//   em toda Edge Function do Supabase/Lovable Cloud.
// - RESEND_API_KEY: crie uma conta gratuita em https://resend.com, gere uma
//   API key e cadastre-a como secret do projeto com esse nome.
//
// Deploy (via Supabase CLI, ou automaticamente ao sincronizar com o Lovable
// Cloud quando este arquivo estiver na pasta supabase/functions):
//   supabase functions deploy enviar-lembretes

import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const REMETENTE = Deno.env.get("LEMBRETE_EMAIL_REMETENTE") ?? "Tech Circles <onboarding@resend.dev>";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type InscricaoPendente = {
  id: string;
  user_id: string;
  eventos: {
    nome: string;
    local: string;
    tipo: string;
    data_inicio: string;
  } | null;
};

Deno.serve(async () => {
  if (!RESEND_API_KEY) {
    return jsonResponse(
      { erro: "RESEND_API_KEY não configurada. Cadastre o secret no projeto para ativar os lembretes." },
      500,
    );
  }

  const agora = new Date();
  const em48h = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

  // "eventos!inner" faz o filtro de data abaixo restringir as próprias
  // inscrições retornadas (e não só o objeto aninhado).
  const { data: inscricoes, error } = await supabaseAdmin
    .from("inscricoes")
    .select("id, user_id, eventos!inner(nome, local, tipo, data_inicio)")
    .eq("lembrete_email", true)
    .is("lembrete_enviado_em", null)
    .gte("eventos.data_inicio", agora.toISOString())
    .lte("eventos.data_inicio", em48h.toISOString());

  if (error) {
    console.error("Erro ao buscar inscrições", error);
    return jsonResponse({ erro: error.message }, 500);
  }

  const pendentes = ((inscricoes ?? []) as unknown as InscricaoPendente[]).filter((i) => i.eventos);

  let enviados = 0;
  const falhas: string[] = [];

  for (const inscricao of pendentes) {
    try {
      const email = await buscarEmail(inscricao.user_id);
      if (!email) {
        falhas.push(`Sem e-mail para usuário ${inscricao.user_id}`);
        continue;
      }

      const evento = inscricao.eventos!;
      const dataFormatada = new Date(evento.data_inicio).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const resposta = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: REMETENTE,
          to: [email],
          subject: `Lembrete: ${evento.nome} é em breve`,
          html: `
            <p>Olá!</p>
            <p>Você está inscrito(a) em <strong>${evento.nome}</strong> (${evento.tipo}),
            que acontece em <strong>${dataFormatada}</strong>${evento.local ? `, em ${evento.local}` : ""}.</p>
            <p>Nos vemos lá! — Tech Circles, Universidade Braz Cubas</p>
          `,
        }),
      });

      if (!resposta.ok) {
        falhas.push(`Falha ao enviar para ${email}: ${await resposta.text()}`);
        continue;
      }

      await supabaseAdmin
        .from("inscricoes")
        .update({ lembrete_enviado_em: new Date().toISOString() })
        .eq("id", inscricao.id);
      enviados += 1;
    } catch (err) {
      falhas.push(String(err));
    }
  }

  return jsonResponse({ verificados: pendentes.length, enviados, falhas });
});

async function buscarEmail(userId: string): Promise<string | null> {
  const { data: perfil } = await supabaseAdmin
    .from("profiles")
    .select("email_profissional")
    .eq("id", userId)
    .maybeSingle();
  if (perfil?.email_profissional) return perfil.email_profissional;

  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
