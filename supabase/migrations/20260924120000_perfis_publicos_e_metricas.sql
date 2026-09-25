-- Permite que o papel (estudante/orientador/conselho) de cada pessoa seja
-- lido publicamente, para exibir perfis reais em /pessoas.
-- Não altera as policies existentes (que restringem UPDATE/INSERT/DELETE);
-- apenas adiciona uma policy permissiva de leitura, já que papel não é
-- informação sensível e o perfil (nome, e-mail, Lattes) já é público.
CREATE POLICY "papeis sao publicos para exibir perfil"
  ON public.user_roles
  FOR SELECT
  USING (true);
