-- Agenda a Edge Function "enviar-lembretes" para rodar todo dia às 08:00 (UTC).
--
-- IMPORTANTE — passo manual necessário antes disso funcionar:
-- Esta migration só consegue chamar a função com autorização se existir, no
-- Vault do projeto (Project Settings > Vault, ou Lovable Cloud > secrets),
-- um secret chamado "service_role_key" com o valor da Service Role Key do
-- projeto. Isso evita commitar a chave em texto puro neste arquivo SQL.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'enviar-lembretes-diario',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://aaahgjvbybzhusisqhly.supabase.co/functions/v1/enviar-lembretes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'service_role_key' LIMIT 1
      )
    ),
    body := jsonb_build_object('executado_em', now())
  ) AS request_id;
  $$
);
