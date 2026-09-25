import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", rotulo: "Início" },
  { to: "/artigos", rotulo: "Artigos" },
  { to: "/pessoas", rotulo: "Pessoas" },
  { to: "/eventos", rotulo: "Eventos" },
  { to: "/glossario", rotulo: "Glossário" },
] as const;

export function SiteHeader() {
  const { user, podeModerar } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight">
          Tech<span className="text-primary">Circles</span>
        </Link>
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {l.rotulo}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-1 text-sm">
          {user ? (
            <>
              <Link to="/perfil" className="rounded-lg px-3 py-2 hover:bg-surface">Meu perfil</Link>
              <Link to="/enviar-artigo" className="rounded-lg px-3 py-2 hover:bg-surface">Enviar artigo</Link>
              <Link to="/minha-agenda" className="rounded-lg px-3 py-2 hover:bg-surface">Minha agenda</Link>
              {podeModerar && (
                <Link to="/painel" className="rounded-lg px-3 py-2 hover:bg-surface">Administração</Link>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="rounded-lg border border-border px-3 py-2 hover:bg-surface"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-display font-semibold text-foreground">Tech Circles</p>
        <p className="mt-1 max-w-2xl">
          Protótipo de comunidade acadêmica da Universidade Braz Cubas. Os perfis, artigos e datas
          exibidos são exemplos de demonstração.
        </p>
      </div>
    </footer>
  );
}
