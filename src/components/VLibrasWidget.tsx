import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

const SCRIPT_ID = "vlibras-plugin-script";
const SCRIPT_SRC = "https://vlibras.gov.br/app/vlibras-plugin.js";

/**
 * Widget oficial de tradução para Libras do Governo Federal.
 * Renderiza o "bonequinho" fixo na tela que traduz o conteúdo da página
 * para Língua Brasileira de Sinais.
 * https://vlibras.gov.br/
 */
export function VLibrasWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function iniciar() {
      if (window.VLibras) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    }

    if (document.getElementById(SCRIPT_ID)) {
      iniciar();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = iniciar;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="print:hidden"
      // O script do VLibras procura por esses atributos exatos (vw, vw-access-button,
      // vw-plugin-wrapper), que não existem na tipagem padrão do JSX — por isso o
      // markup é injetado como HTML puro em vez de props React.
      dangerouslySetInnerHTML={{
        __html: `
          <div vw class="enabled">
            <div vw-access-button class="active"></div>
            <div vw-plugin-wrapper>
              <div class="vw-plugin-top-wrapper"></div>
            </div>
          </div>
        `,
      }}
    />
  );
}
