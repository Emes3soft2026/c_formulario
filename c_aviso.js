/***********************************************************/
/* C_AVISO - Mensagens de aviso (toasts)                   */
/* Desenvolvido por Marco Meneses (EMES3SOFT)              */
/* Versão 1.0                                              */
/***********************************************************/

// Não depende de outras librarias: o estilo é injetado automaticamente e os ícones são SVG.
// Utilização:
//   c_aviso.mostrar("success", "Gravado com sucesso", "Título opcional", 4000);
//   c_aviso.erro("Mensagem"); c_aviso.sucesso("Mensagem"); c_aviso.aviso("Mensagem"); c_aviso.informacao("Mensagem");
// Tipos: success, danger, warning, info, primary, secondary, dark (ou sucesso, erro, aviso, informacao, primario, secundario, escuro)
// Tempo de espera 0 = o aviso só fecha no botão.

const c_aviso = {
    tempo_de_espera_pre_definido: 4000,
    maximo_visiveis: 5,
    // baixo-direita, baixo-esquerda, baixo-centro, topo-direita, topo-esquerda, topo-centro
    posicao: "baixo-direita",

    aliases: {
        sucesso: "success", erro: "danger", aviso: "warning", informacao: "info",
        primario: "primary", secundario: "secondary", escuro: "dark"
    },

    icones: {
        success: '<path d="M20 6 9 17l-5-5"/>',
        danger: '<path d="M18 6 6 18M6 6l12 12"/>',
        warning: '<path d="M12 7v6M12 17h.01"/>',
        info: '<path d="M12 11v6M12 7h.01"/>',
        outro: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'
    },

    estilos: `
.c-aviso-contentor {
    --c-aviso-fundo: #ffffff;
    --c-aviso-texto: #1f2937;
    --c-aviso-texto-suave: #6b7280;
    --c-aviso-borda: rgba(15, 23, 42, .08);
    --c-aviso-sombra: 0 12px 32px -12px rgba(15, 23, 42, .28), 0 2px 6px rgba(15, 23, 42, .06);
    --c-aviso-desloca: 24px;
    position: fixed;
    z-index: 10800;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: min(400px, 100%);
    padding: 16px;
    box-sizing: border-box;
    pointer-events: none;
    font-family: var(--bs-body-font-family, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
}
.c-aviso-contentor[data-posicao^="baixo"] { bottom: 0; }
.c-aviso-contentor[data-posicao^="topo"] { top: 0; flex-direction: column-reverse; }
.c-aviso-contentor[data-posicao$="direita"] { right: 0; }
.c-aviso-contentor[data-posicao$="esquerda"] { left: 0; --c-aviso-desloca: -24px; }
.c-aviso-contentor[data-posicao$="centro"] { left: 50%; transform: translateX(-50%); --c-aviso-desloca: 0px; }

@media (prefers-color-scheme: dark) {
    :root:not([data-bs-theme="light"]) .c-aviso-contentor {
        --c-aviso-fundo: #1e2430;
        --c-aviso-texto: #e5e7eb;
        --c-aviso-texto-suave: #9ca3af;
        --c-aviso-borda: rgba(255, 255, 255, .08);
        --c-aviso-sombra: 0 12px 32px -12px rgba(0, 0, 0, .65), 0 2px 6px rgba(0, 0, 0, .3);
    }
}
[data-bs-theme="dark"] .c-aviso-contentor {
    --c-aviso-fundo: #1e2430;
    --c-aviso-texto: #e5e7eb;
    --c-aviso-texto-suave: #9ca3af;
    --c-aviso-borda: rgba(255, 255, 255, .08);
    --c-aviso-sombra: 0 12px 32px -12px rgba(0, 0, 0, .65), 0 2px 6px rgba(0, 0, 0, .3);
}

.c-aviso {
    --c-aviso-cor: #64748b;
    pointer-events: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 14px 16px;
    background: var(--c-aviso-fundo);
    color: var(--c-aviso-texto);
    border: 1px solid var(--c-aviso-borda);
    border-radius: 14px;
    box-shadow: var(--c-aviso-sombra);
    font-size: .9rem;
    line-height: 1.4;
    animation: c-aviso-entrada .35s cubic-bezier(.21, 1.02, .73, 1) both;
}
.c-aviso-success   { --c-aviso-cor: #16a34a; }
.c-aviso-danger    { --c-aviso-cor: #dc2626; }
.c-aviso-warning   { --c-aviso-cor: #d97706; }
.c-aviso-info      { --c-aviso-cor: #0284c7; }
.c-aviso-primary   { --c-aviso-cor: #0d6efd; }
.c-aviso-secondary { --c-aviso-cor: #64748b; }
.c-aviso-dark      { --c-aviso-cor: #334155; }
@media (prefers-color-scheme: dark) {
    :root:not([data-bs-theme="light"]) .c-aviso-dark { --c-aviso-cor: #94a3b8; }
}
[data-bs-theme="dark"] .c-aviso-dark { --c-aviso-cor: #94a3b8; }

.c-aviso-icone {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--c-aviso-cor);
    background: color-mix(in srgb, var(--c-aviso-cor) 14%, transparent);
}
.c-aviso-icone svg { width: 18px; height: 18px; }
.c-aviso-corpo { flex: 1 1 auto; min-width: 0; padding-top: 5px; overflow-wrap: anywhere; }
.c-aviso-titulo { font-weight: 600; margin-bottom: 2px; }
.c-aviso-titulo + .c-aviso-mensagem { color: var(--c-aviso-texto-suave); }
.c-aviso-codigo {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--c-aviso-texto-suave);
    font-family: var(--bs-font-monospace, ui-monospace, SFMono-Regular, Menlo, monospace);
}
.c-aviso-fechar {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    margin: -2px -4px 0 0;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--c-aviso-texto-suave);
    cursor: pointer;
}
.c-aviso-fechar svg { width: 16px; height: 16px; }
.c-aviso-fechar:hover { color: var(--c-aviso-texto); background: color-mix(in srgb, currentColor 12%, transparent); }
.c-aviso-fechar:focus-visible { outline: 2px solid var(--c-aviso-cor); outline-offset: 1px; }
.c-aviso-progresso {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3px;
    background: var(--c-aviso-cor);
    opacity: .75;
    transform-origin: left;
    animation: c-aviso-progresso var(--c-aviso-tempo) linear forwards;
}
.c-aviso-pausa .c-aviso-progresso { animation-play-state: paused; }
.c-aviso.c-aviso-saida { animation: c-aviso-saida .2s ease-in forwards; }

@keyframes c-aviso-entrada { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes c-aviso-saida { to { opacity: 0; transform: translateX(var(--c-aviso-desloca)) scale(.96); } }
@keyframes c-aviso-progresso { from { transform: scaleX(1); } to { transform: scaleX(0); } }

@media (prefers-reduced-motion: reduce) {
    .c-aviso { animation: none; }
    .c-aviso.c-aviso-saida { animation: c-aviso-saida 1ms forwards; }
}
@media (max-width: 576px) {
    .c-aviso-contentor { width: 100%; left: 0; right: 0; transform: none; padding: 12px; }
}`,

    // Cria (apenas quando necessário) o estilo e o contentor, para o script poder ser carregado no <head>
    contentor: function () {
        if (!document.getElementById("c-aviso-estilos")) {
            const estilo = document.createElement("style");
            estilo.id = "c-aviso-estilos";
            estilo.textContent = c_aviso.estilos;
            document.head.appendChild(estilo);
        }

        let contentor = document.getElementById("c-aviso-contentor");
        if (!contentor) {
            contentor = document.createElement("div");
            contentor.id = "c-aviso-contentor";
            contentor.className = "c-aviso-contentor";
            document.body.appendChild(contentor);
        }
        contentor.dataset.posicao = c_aviso.posicao;
        return contentor;
    },

    svg: function (caminhos) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${caminhos}</svg>`;
    },

    // opcoes: { codigo: "texto pequeno por baixo da mensagem", html: true para aceitar HTML na mensagem }
    mostrar: function (tipo, mensagem, titulo = "", tempo_de_espera = undefined, opcoes = {}) {
        tipo = c_aviso.aliases[tipo] || tipo || "info";
        tempo_de_espera = (tempo_de_espera === undefined || tempo_de_espera === null) ? c_aviso.tempo_de_espera_pre_definido : tempo_de_espera;

        const urgente = (tipo === "danger" || tipo === "warning");
        const elemento = document.createElement("div");
        elemento.className = `c-aviso c-aviso-${tipo}`;
        elemento.setAttribute("role", urgente ? "alert" : "status");
        elemento.setAttribute("aria-live", urgente ? "assertive" : "polite");
        elemento.setAttribute("aria-atomic", "true");
        elemento.innerHTML =
            `<div class="c-aviso-icone">${c_aviso.svg(c_aviso.icones[tipo] || c_aviso.icones.outro)}</div>
            <div class="c-aviso-corpo"></div>
            <button type="button" class="c-aviso-fechar" aria-label="Fechar">${c_aviso.svg('<path d="M18 6 6 18M6 6l12 12"/>')}</button>`;

        const corpo = elemento.querySelector(".c-aviso-corpo");
        const adiciona = (classe, texto, html = false) => {
            const div = document.createElement("div");
            div.className = classe;
            html ? div.innerHTML = texto : div.textContent = texto;
            corpo.appendChild(div);
        };
        if (titulo) adiciona("c-aviso-titulo", titulo);
        adiciona("c-aviso-mensagem", mensagem ?? "", opcoes.html === true);
        if (opcoes.codigo) adiciona("c-aviso-codigo", opcoes.codigo);

        elemento.querySelector(".c-aviso-fechar").addEventListener("click", () => c_aviso.fechar(elemento));

        if (tempo_de_espera > 0) {
            const progresso = document.createElement("div");
            progresso.className = "c-aviso-progresso";
            elemento.style.setProperty("--c-aviso-tempo", tempo_de_espera + "ms");
            elemento.appendChild(progresso);

            // Pausa enquanto o rato ou o foco estão no aviso
            elemento._restante = tempo_de_espera;
            const retomar = () => {
                elemento.classList.remove("c-aviso-pausa");
                elemento._inicio = Date.now();
                elemento._temporizador = setTimeout(() => c_aviso.fechar(elemento), elemento._restante);
            };
            const pausar = () => {
                if (elemento.classList.contains("c-aviso-pausa")) return;
                clearTimeout(elemento._temporizador);
                elemento._restante -= Date.now() - elemento._inicio;
                elemento.classList.add("c-aviso-pausa");
            };
            elemento.addEventListener("mouseenter", pausar);
            elemento.addEventListener("mouseleave", retomar);
            elemento.addEventListener("focusin", pausar);
            elemento.addEventListener("focusout", retomar);
            retomar();
        }

        const contentor = c_aviso.contentor();
        contentor.appendChild(elemento);

        // Limita o número de avisos visíveis, fechando os mais antigos
        const abertos = contentor.querySelectorAll(".c-aviso:not([data-fechando])");
        for (let i = 0; i < abertos.length - c_aviso.maximo_visiveis; i++)
            c_aviso.fechar(abertos[i]);

        return elemento;
    },

    fechar: function (elemento) {
        if (!elemento || elemento.dataset.fechando) return;
        elemento.dataset.fechando = "1";
        clearTimeout(elemento._temporizador);

        const remover = () => {
            // Encolhe o espaço do aviso para os restantes deslizarem suavemente
            elemento.style.height = elemento.offsetHeight + "px";
            elemento.offsetHeight;
            elemento.style.transition = "height .2s ease, padding .2s ease, margin .2s ease, border-width .2s ease";
            elemento.style.height = "0px";
            elemento.style.paddingTop = elemento.style.paddingBottom = "0px";
            elemento.style.borderWidth = "0px";
            elemento.style.margin = "-5px 0";
            setTimeout(() => elemento.remove(), 220);
        };

        elemento.classList.add("c-aviso-saida");
        elemento.addEventListener("animationend", (e) => { if (e.animationName === "c-aviso-saida") remover(); });
        setTimeout(() => { if (elemento.isConnected && !elemento.style.transition) remover(); }, 400);
    },

    fechar_todos: function () {
        document.querySelectorAll("#c-aviso-contentor .c-aviso").forEach((elemento) => c_aviso.fechar(elemento));
    },

    // Número de avisos visíveis (que não estão a fechar)
    quantidade: function () {
        return document.querySelectorAll("#c-aviso-contentor .c-aviso:not([data-fechando])").length;
    },

    erro: function (mensagem, titulo, tempo_de_espera) {
        return c_aviso.mostrar("danger", mensagem, titulo, tempo_de_espera);
    },
    sucesso: function (mensagem, titulo, tempo_de_espera) {
        return c_aviso.mostrar("success", mensagem, titulo, tempo_de_espera);
    },
    aviso: function (mensagem, titulo, tempo_de_espera) {
        return c_aviso.mostrar("warning", mensagem, titulo, tempo_de_espera);
    },
    informacao: function (mensagem, titulo, tempo_de_espera) {
        return c_aviso.mostrar("info", mensagem, titulo, tempo_de_espera);
    },
};
