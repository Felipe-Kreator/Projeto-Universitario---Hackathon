CREATE TYPE public.app_role AS ENUM ('estudante','orientador','conselho');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  curso text NOT NULL DEFAULT '',
  email_profissional text NOT NULL DEFAULT '',
  lattes text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  areas text[] NOT NULL DEFAULT '{}',
  subareas text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfis visiveis para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "editar proprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "criar proprio perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.pode_moderar(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('orientador','conselho'))
$$;

CREATE POLICY "ver papeis" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.pode_moderar(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email_profissional)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'estudante') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.submissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  resumo text NOT NULL DEFAULT '',
  autores text[] NOT NULL DEFAULT '{}',
  orientador text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  subarea text NOT NULL DEFAULT '',
  evento text NOT NULL DEFAULT '',
  ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  arquivo_path text,
  link text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  parecer text NOT NULL DEFAULT '',
  revisor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissoes TO authenticated;
GRANT SELECT ON public.submissoes TO anon;
GRANT ALL ON public.submissoes TO service_role;
ALTER TABLE public.submissoes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER submissoes_updated_at BEFORE UPDATE ON public.submissoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "artigos aprovados sao publicos" ON public.submissoes FOR SELECT USING (status = 'aprovado');
CREATE POLICY "autor ve proprios envios" ON public.submissoes FOR SELECT TO authenticated USING (auth.uid() = autor_id);
CREATE POLICY "moderadores veem tudo" ON public.submissoes FOR SELECT TO authenticated USING (public.pode_moderar(auth.uid()));
CREATE POLICY "autor envia artigo" ON public.submissoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "autor edita pendente" ON public.submissoes FOR UPDATE TO authenticated USING (auth.uid() = autor_id AND status = 'pendente') WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "moderadores atualizam" ON public.submissoes FOR UPDATE TO authenticated USING (public.pode_moderar(auth.uid())) WITH CHECK (public.pode_moderar(auth.uid()));
CREATE POLICY "autor remove pendente" ON public.submissoes FOR DELETE TO authenticated USING (auth.uid() = autor_id AND status = 'pendente');

CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  local text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'Encontro',
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz,
  publicado boolean NOT NULL DEFAULT false,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT SELECT ON public.eventos TO anon;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "eventos publicados sao publicos" ON public.eventos FOR SELECT USING (publicado = true);
CREATE POLICY "moderadores veem eventos" ON public.eventos FOR SELECT TO authenticated USING (public.pode_moderar(auth.uid()));
CREATE POLICY "moderadores criam eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (public.pode_moderar(auth.uid()));
CREATE POLICY "moderadores editam eventos" ON public.eventos FOR UPDATE TO authenticated USING (public.pode_moderar(auth.uid())) WITH CHECK (public.pode_moderar(auth.uid()));
CREATE POLICY "moderadores removem eventos" ON public.eventos FOR DELETE TO authenticated USING (public.pode_moderar(auth.uid()));

CREATE TABLE public.inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lembrete_email boolean NOT NULL DEFAULT true,
  lembrete_enviado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (evento_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscricoes TO authenticated;
GRANT ALL ON public.inscricoes TO service_role;
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver proprias inscricoes" ON public.inscricoes FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.pode_moderar(auth.uid()));
CREATE POLICY "criar propria inscricao" ON public.inscricoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "editar propria inscricao" ON public.inscricoes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cancelar propria inscricao" ON public.inscricoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "artigos leitura autenticada" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'artigos');
CREATE POLICY "envio de artigo autenticado" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artigos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "atualizar proprio arquivo" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'artigos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "remover proprio arquivo" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artigos' AND auth.uid()::text = (storage.foldername(name))[1]);