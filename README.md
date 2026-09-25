[README.pt-BR.md](https://github.com/user-attachments/files/32634639/README.pt-BR.md)
# Tech Circles — Universidade Braz Cubas

Comunidade acadêmica que reúne, em um só lugar, os artigos, eventos e
pesquisadores da Universidade Braz Cubas — nascida para resolver um problema
concreto: a baixa divulgação dos Anais do ENCIBRAC, do PIBIC e da produção
científica dos alunos.

## Stack

- [TanStack Start](https://tanstack.com/start) (React + SSR)
- TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Edge Functions, Cron) via Lovable Cloud

## Funcionalidades

- **Autenticação e perfil** — cadastro, curso, e-mail profissional, Currículo
  Lattes, áreas e sub-áreas de pesquisa.
- **Pessoas da comunidade** (`/pessoas`) — perfis reais de estudantes,
  orientadores e conselho, lidos diretamente do banco (`profiles` +
  `user_roles`), com as publicações de cada um.
- **Artigos e pesquisas** (`/artigos`) — busca e filtro por área/sub-área, com
  um **feed personalizado** ("Recomendados para você") baseado nas áreas de
  interesse salvas no perfil do usuário logado, e um **glossário inline** que
  destaca jargões acadêmicos (Anais, PIBIC, Lattes, peer review...) com
  tooltip e link para explicação externa.
- **Envio e moderação de artigos** — alunos enviam PDF ou link; orientadores e
  conselho aprovam/rejeitam pelo painel administrativo (`/painel`), que também
  mostra **métricas iniciais** (perfis, artigos por status, eventos,
  inscrições, distribuição por área).
- **Eventos e agenda** — cadastro de eventos pelo conselho, inscrição pelos
  alunos, agenda pessoal (`/minha-agenda`) e **lembrete automático por
  e-mail** 48h antes do evento (Edge Function + cron).
- **Acessibilidade** — narração por voz (Web Speech API), filtros de
  daltonismo e alto contraste, redução de movimento, fonte ampliada, e o
  **widget oficial VLibras** (Governo Federal) para tradução em Libras.

## Rodando localmente

Pré-requisitos: Node.js 18+ (ou Bun).

```sh
npm i
npm run dev
```

Crie um arquivo `.env` (ou configure as variáveis de ambiente) com:

```
VITE_SUPABASE_URL=https://aaahgjvbybzhusisqhly.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua publishable key>
```

Essas credenciais ficam em Supabase Dashboard → Project Settings → API, ou no
painel de variáveis da Lovable Cloud.

## Publicando na nuvem (Supabase / Lovable Cloud)

O projeto já está conectado ao GitHub, então a Lovable Cloud sincroniza o
código e aplica as migrations automaticamente a cada push. Dois itens,
porém, **precisam ser configurados manualmente**, pois envolvem segredos que
nunca devem ir para o repositório:

1. **Secret `RESEND_API_KEY`** — necessário para o lembrete de evento por
   e-mail. Crie uma conta gratuita em [resend.com](https://resend.com), gere
   uma API key e cadastre-a em Supabase Dashboard → Edge Functions → Secrets
   (ou via CLI: `supabase secrets set RESEND_API_KEY=...`).
2. **Secret `service_role_key` no Vault** — necessário para o cron job
   conseguir chamar a Edge Function com autorização. Cadastre em Supabase
   Dashboard → Project Settings → Vault, com o valor da sua `service_role`
   key (em Project Settings → API).

Depois de configurar os dois, rode (ou deixe a Lovable Cloud rodar
automaticamente):

```sh
supabase link --project-ref aaahgjvbybzhusisqhly
supabase db push                          # aplica as migrations
supabase functions deploy enviar-lembretes # publica a Edge Function
```

Confira se o agendamento ficou ativo:

```sql
select * from cron.job;
```

Deve aparecer uma linha `enviar-lembretes-diario`, rodando todo dia às 08:00
(UTC).

## Estrutura de pastas (resumo)

```
src/
  components/     Header, footer, barra de acessibilidade, widget VLibras, glossário inline
  data/           Dados de demonstração (fallback quando o banco está vazio)
  hooks/          useAuth (sessão, papéis)
  routes/         Páginas (TanStack Router baseado em arquivos)
  integrations/   Cliente Supabase e tipos gerados
supabase/
  migrations/     Schema do banco e policies de segurança (RLS)
  functions/      Edge Functions (ex.: enviar-lembretes)
```

## Roadmap / próximos passos sugeridos

- Importação automática dos Anais do ENCIBRAC e do PIBIC (hoje é manual, via
  envio de artigo).
- Verificação de domínio no Resend para enviar e-mails de
  `@brazcubas.edu.br`.
- Testes de usabilidade com um grupo piloto de alunos e orientadores.


[README.en.md](https://github.com/user-attachments/files/32634644/README.en.md)# Tech Circles — Braz Cubas University

An academic community platform that brings together, in one place, the
papers, events, and researchers of Braz Cubas University — built to solve a
concrete problem: the low visibility of the ENCIBRAC proceedings, the PIBIC
undergraduate-research program, and students' scientific output in general.

## Stack

- [TanStack Start](https://tanstack.com/start) (React + SSR)
- TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Edge Functions, Cron) via Lovable Cloud

## Features

- **Auth & profile** — sign-up, course, professional email, Lattes CV link,
  research areas and sub-areas.
- **Community directory** (`/pessoas`) — real profiles of students, advisors
  and the research council, read straight from the database (`profiles` +
  `user_roles`), each showing their published papers.
- **Papers & research** (`/artigos`) — search and filter by area/sub-area,
  plus a **personalized feed** ("Recommended for you") based on the logged-in
  user's saved interest areas, and an **inline glossary** that highlights
  academic jargon (Anais, PIBIC, Lattes, peer review...) with a tooltip and a
  link to an external explanation.
- **Paper submission & moderation** — students submit a PDF or link; advisors
  and the council approve/reject from the admin panel (`/painel`), which also
  shows **baseline metrics** (profiles, papers by status, events,
  registrations, breakdown by area).
- **Events & agenda** — the council creates events, students register, a
  personal agenda page (`/minha-agenda`), and an **automatic email reminder**
  48h before each event (Edge Function + cron).
- **Accessibility** — text-to-speech (Web Speech API), color-blindness and
  high-contrast filters, reduced motion, larger font size, and the **official
  VLibras widget** (Brazilian Federal Government) for sign-language
  translation.

## Running locally

Prerequisites: Node.js 18+ (or Bun).

```sh
npm i
npm run dev
```

Create a `.env` file (or set environment variables) with:

```
VITE_SUPABASE_URL=https://aaahgjvbybzhusisqhly.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
```

You'll find these under Supabase Dashboard → Project Settings → API, or in
Lovable Cloud's environment-variables panel.

## Deploying to the cloud (Supabase / Lovable Cloud)

The project is already connected to GitHub, so Lovable Cloud syncs the code
and applies migrations automatically on every push. Two things, however,
**must be configured manually**, since they involve secrets that should never
be committed to the repository:

1. **`RESEND_API_KEY` secret** — required for the event email reminder.
   Create a free account at [resend.com](https://resend.com), generate an API
   key, and add it under Supabase Dashboard → Edge Functions → Secrets (or via
   CLI: `supabase secrets set RESEND_API_KEY=...`).
2. **`service_role_key` secret in the Vault** — required so the cron job can
   authorize its call to the Edge Function. Add it under Supabase Dashboard →
   Project Settings → Vault, using the value of your `service_role` key
   (found under Project Settings → API).

Once both are set, run (or let Lovable Cloud run it automatically):

```sh
supabase link --project-ref aaahgjvbybzhusisqhly
supabase db push                          # applies the migrations
supabase functions deploy enviar-lembretes # publishes the Edge Function
```

Check that the schedule is active:

```sql
select * from cron.job;
```

You should see a row named `enviar-lembretes-diario`, running daily at 08:00
UTC.

## Folder structure (summary)

```
src/
  components/     Header, footer, accessibility bar, VLibras widget, inline glossary
  data/           Demo data (fallback used when the database is empty)
  hooks/          useAuth (session, roles)
  routes/         Pages (file-based TanStack Router)
  integrations/   Supabase client and generated types
supabase/
  migrations/     Database schema and Row-Level Security policies
  functions/      Edge Functions (e.g. enviar-lembretes)
```

## Suggested next steps

- Automatic import of the ENCIBRAC proceedings and PIBIC papers (currently
  manual, via paper submission).
- Verify a custom domain on Resend to send emails from `@brazcubas.edu.br`.
- Usability testing with a pilot group of students and advisors.

