import { useEffect, useState } from "react";

type Filtro =
  "nenhum" | "protanopia" | "deuteranopia" | "tritanopia" | "alto-contraste";

const filtros: { id: Filtro; rotulo: string }[] = [
  { id: "nenhum", rotulo: "Cores originais" },
  { id: "protanopia", rotulo: "Protanopia" },
  { id: "deuteranopia", rotulo: "Deuteranopia" },
  { id: "tritanopia", rotulo: "Tritanopia" },
  { id: "alto-contraste", rotulo: "Alto contraste" },
];

export function AccessibilityBar() {
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("nenhum");
  const [semAnimacao, setSemAnimacao] = useState(false);
  const [fonteGrande, setFonteGrande] = useState(false);
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.remove(
      "a11y-protanopia",
      "a11y-deuteranopia",
      "a11y-tritanopia",
      "a11y-alto-contraste",
    );
    if (filtro !== "nenhum") raiz.classList.add(`a11y-${filtro}`);
    raiz.classList.toggle("a11y-sem-animacao", semAnimacao);
    raiz.classList.toggle("a11y-fonte-grande", fonteGrande);
  }, [filtro, semAnimacao, fonteGrande]);

  function narrarPagina() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (lendo) {
      window.speechSynthesis.cancel();
      setLendo(false);
      return;
    }
    const principal = document.querySelector("main");
    const texto = (principal?.innerText ?? "").slice(0, 4000);
    if (!texto) return;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 1;
    fala.onend = () => setLendo(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
    setLendo(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {aberto && (
        <div
          id="painel-acessibilidade"
          className="card-surface mb-3 w-[19rem] max-w-[calc(100vw-2rem)] space-y-4 p-4 text-sm"
        >
          <div>
            <p className="font-display font-semibold">Narração por voz</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lê em voz alta o conteúdo principal desta página.
            </p>
            <button
              onClick={narrarPagina}
              className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {lendo ? "Parar narração" : "Ouvir a página"}
            </button>
          </div>

          <fieldset>
            <legend className="font-display font-semibold">
              Filtro de cor
            </legend>
            <div className="mt-2 grid gap-1">
              {filtros.map((f) => (
                <label key={f.id} className="flex items-center gap-2 py-1">
                  <input
                    type="radio"
                    name="filtro-cor"
                    checked={filtro === f.id}
                    onChange={() => setFiltro(f.id)}
                  />
                  <span>{f.rotulo}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2 border-t border-border pt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={semAnimacao}
                onChange={(e) => setSemAnimacao(e.target.checked)}
              />
              <span>Reduzir movimento (epilepsia)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fonteGrande}
                onChange={(e) => setFonteGrande(e.target.checked)}
              />
              <span>Aumentar tamanho do texto</span>
            </label>
          </div>

          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            Toque no ícone azul de <strong>Libras</strong> no canto da tela para
            traduzir o conteúdo desta página para Língua Brasileira de Sinais
            (widget VLibras, do Governo Federal).
          </p>
        </div>
      )}

      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="painel-acessibilidade"
        className="flex min-h-12 min-w-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
      >
        Acessibilidade
      </button>
    </div>
  );
}

export function ColorBlindFilters() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0">
      <defs>
        <filter id="filtro-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="filtro-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="filtro-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
