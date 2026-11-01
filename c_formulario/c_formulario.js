/***********************************************************/
/* C_FORMULÁRIO - Validador de formulários                 */
/* Desenvolvido por Marco Meneses (EMES3SOFT)              */
/* Versão 2.0                                              */
/***********************************************************/
// Não depende de outras librarias (já não é necessário o jQuery nem o JS do Bootstrap).
// As condições são lidas por um analisador próprio: não é usado o eval.

// Endereço deste script (para encontrar o c_formulario.json na mesma pasta)
const c_formulario_script_src = document.currentScript ? document.currentScript.src : "";

const tipos_aviso = Object.freeze({ aviso_texto: 0, aviso_tooltip: 1 });

// Mensagens pré-definidas (usadas se o c_formulario.json não puder ser lido, ex: a partir de file://)
const c_formulario_mensagens = {
    tempo_de_espera: 3500,
    tipos_mensagens: [[0, "Erro", "danger"], [1, "Aviso", "warning"], [2, "Informação", "info"], [3, "Sucesso", "success"]],
    construtor: [[0, 0, "C_F - E0", "Construtor: O objeto não é um formulário"]],
    formulario: [[0, 0, "C_F - E0", "Resolva os erros"]]
};

const c_formulario_constantes = Object.freeze({
    classe_valido: "is-valid",
    classe_invalido: "is-invalid",
    classe_obj_valido: "objeto_valido_c_formulario",
    classe_obj_invalido: "objeto_invalido_c_formulario",
    classe_erro: "erro_c_formulario",
    classe_esconde: "esconde_c_formulario",
    prefixo_erro: "erro_",
    email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
    ip: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    url: /(https?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/,
    codigo_postal: /^\d{4}-\d{3}?$/,
    nao_limpar: ["passe", "complexity", "check", "checked"]
});

// ---------------------------------------------------------------------------
// Funções auxiliares

function c_formulario_isNumeric(valor) {
    return !isNaN(valor) && !isNaN(parseFloat(valor));
}

// 10 a 25 carateres, maiúsculas, minúsculas, números e símbolos, sem espaços
function c_formulario_passe(valor) {
    return /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/_₹]).{10,25}$/.test(valor);
}

// Aceita AAAA-MM-DD, DD-MM-AAAA, MM-DD-AAAA (e com ano de 2 dígitos), com - / ou . como separador
function c_formulario_data(valor) {
    const str = String(valor ?? "").trim().replace(/[/.]/g, "-");
    if (!str) return null;
    const p = str.split("-");
    if (p.length !== 3 || !p.every(x => /^\d+$/.test(x))) return null;
    const n = p.map(Number);
    const formatos = [["Y", "M", "D"], ["D", "M", "Y"], ["M", "D", "Y"], ["y", "M", "D"], ["D", "M", "y"], ["M", "D", "y"]];
    for (const f of formatos) {
        let dia, mes, ano;
        f.forEach((c, i) => {
            if (c === "D") dia = n[i];
            else if (c === "M") mes = n[i];
            else if (c === "Y") ano = n[i];
            else ano = n[i] < 50 ? 2000 + n[i] : 1900 + n[i];
        });
        if (f.includes("Y") && ano < 100) continue;
        const dt = new Date(ano, mes - 1, dia);
        if (dt.getFullYear() === ano && dt.getMonth() === mes - 1 && dt.getDate() === dia) return dt;
    }
    return null;
}

// Converte os dados de um pedido (dicionário JSON ou querystring) em FormData
function c_formulario_formdata(texto) {
    const fd = new FormData();
    let obj = null;
    try { obj = JSON.parse(texto); } catch (e) {
        if (String(texto).includes("=")) obj = Object.fromEntries(new URLSearchParams(String(texto).replace(/^\?/, "")));
    }
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return null;
    for (const chave in obj) fd.append(chave, obj[chave]);
    return fd;
}

// Pedido síncrono ao servidor (como o original), para o Testa_Validacoes continuar a devolver verdadeiro/falso
function c_formulario_pedido(ligacao, dados) {
    const x = new XMLHttpRequest();
    try {
        x.open("POST", ligacao, false);
        x.send(dados);
    } catch (e) {
        return "0 - " + e;
    }
    const resposta = String(x.responseText ?? "").trim();
    if (x.status >= 200 && x.status < 300) return c_formulario_isNumeric(resposta) ? parseInt(resposta, 10) : resposta;
    console.log(x.status + " - " + resposta);
    return x.status + " - " + resposta;
}

// ---------------------------------------------------------------------------
// Analisador das condições: expressões ao estilo JavaScript com marcadores «id.propriedade»

const c_formulario_metodos = ["charAt", "toLowerCase", "toUpperCase", "trim", "includes", "startsWith", "endsWith", "indexOf", "substring", "slice", "toString"];
const c_formulario_operadores = ["===", "!==", "==", "!=", "<=", ">=", "&&", "||", "<", ">", "!", "(", ")", ".", ",", "+", "-", "*", "/", "%", "[", "]"];

function c_formulario_tokens(src) {
    const t = [];
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === "«") {
            // Os marcadores podem ter outros marcadores dentro (ex: data_address com «email.val»)
            let j = i + 1, nivel = 0;
            while (j < src.length && !(src[j] === "»" && nivel === 0)) {
                if (src[j] === "«") nivel++;
                else if (src[j] === "»") nivel--;
                j++;
            }
            if (j >= src.length) throw new Error("Falta o limitador » na expressão: " + src);
            t.push({ tipo: "marcador", valor: src.slice(i + 1, j) });
            i = j + 1;
        } else if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
            const m = src.slice(i).match(/^[0-9]*\.?[0-9]+/)[0];
            t.push({ tipo: "numero", valor: Number(m) });
            i += m.length;
        } else if (c === "'" || c === '"' || c === "`") {
            let s = "";
            i++;
            while (true) {
                if (i >= src.length) throw new Error("Texto sem aspas de fecho");
                const d = src[i++];
                if (d === c) break;
                if (d === "\\") { const e = src[i++]; s += e === "n" ? "\n" : e === "t" ? "\t" : e; }
                else s += d;
            }
            t.push({ tipo: "texto", valor: s });
        } else if (/[A-Za-z_$À-ÿ]/.test(c)) {
            const m = src.slice(i).match(/^[A-Za-z0-9_$À-ÿ]+/)[0];
            t.push({ tipo: "nome", valor: m });
            i += m.length;
        } else {
            const op = c_formulario_operadores.find(o => src.startsWith(o, i));
            if (!op) throw new Error("Carater inesperado: " + c);
            t.push({ tipo: "op", valor: op });
            i += op.length;
        }
    }
    return t;
}

function c_formulario_avaliar(src, ler_marcador) {
    const t = c_formulario_tokens(src);
    if (!t.length) throw new Error("Expressão de comparação vazia");
    let p = 0;
    const op = () => (t[p] && t[p].tipo === "op") ? t[p].valor : null;
    const come = (o) => { if (op() === o) { p++; return true; } return false; };
    const espera = (o) => { if (!come(o)) throw new Error("Esperava " + o); };

    function ou() { let l = e(); while (come("||")) { const r = e(); l = l || r; } return l; }
    function e() { let l = igual(); while (come("&&")) { const r = igual(); l = l && r; } return l; }
    function igual() {
        let l = relacao();
        for (let o = op(); ["==", "!=", "===", "!=="].includes(o); o = op()) {
            p++;
            const r = relacao();
            l = o === "==" ? l == r : o === "!=" ? l != r : o === "===" ? l === r : l !== r;
        }
        return l;
    }
    function relacao() {
        let l = soma();
        for (let o = op(); ["<", ">", "<=", ">="].includes(o); o = op()) {
            p++;
            const r = soma();
            l = o === "<" ? l < r : o === ">" ? l > r : o === "<=" ? l <= r : l >= r;
        }
        return l;
    }
    function soma() {
        let l = produto();
        for (let o = op(); o === "+" || o === "-"; o = op()) { p++; const r = produto(); l = o === "+" ? l + r : l - r; }
        return l;
    }
    function produto() {
        let l = unario();
        for (let o = op(); o === "*" || o === "/" || o === "%"; o = op()) {
            p++;
            const r = unario();
            l = o === "*" ? l * r : o === "/" ? l / r : l % r;
        }
        return l;
    }
    function unario() {
        if (come("!")) return !unario();
        if (come("-")) return -unario();
        if (come("+")) return +unario();
        return sufixo();
    }
    function argumentos() {
        const a = [];
        if (come(")")) return a;
        while (true) { a.push(ou()); if (come(")")) return a; espera(","); }
    }
    function sufixo() {
        let v = primario();
        while (true) {
            if (come(".")) {
                const n = t[p++];
                if (!n || n.tipo !== "nome") throw new Error("Esperava o nome de uma propriedade depois de .");
                if (come("(")) {
                    const a = argumentos();
                    if (!c_formulario_metodos.includes(n.valor) || v === null || v === undefined || typeof v[n.valor] !== "function")
                        throw new Error(n.valor + " não é uma função conhecida");
                    v = (typeof v === "number" || typeof v === "boolean") ? String(v)[n.valor](...a) : v[n.valor](...a);
                } else if (n.valor === "length") {
                    v = String(v).length;
                } else throw new Error(n.valor + " não é uma propriedade conhecida");
            } else if (come("[")) {
                const i = ou();
                espera("]");
                v = String(v).charAt(i);
            } else return v;
        }
    }
    function primario() {
        const k = t[p++];
        if (!k) throw new Error("A expressão termina antes do tempo");
        if (k.tipo === "numero" || k.tipo === "texto") return k.valor;
        if (k.tipo === "marcador") return ler_marcador(k.valor);
        if (k.tipo === "nome") {
            const constantes = { true: true, false: false, null: null, undefined: undefined, NaN: NaN, Infinity: Infinity };
            if (k.valor in constantes) return constantes[k.valor];
            throw new Error(k.valor + " não está definido");
        }
        if (k.valor === "(") { const v = ou(); espera(")"); return v; }
        throw new Error("Operador inesperado: " + k.valor);
    }

    const v = ou();
    if (p < t.length) throw new Error("Sobra texto na expressão: " + JSON.stringify(t[p].valor));
    return v;
}

// ---------------------------------------------------------------------------
// Tooltip de erro (sem o Bootstrap): aparece por cima do objeto ao passar o rato ou com o foco

const c_formulario_tooltip = {
    elemento: null,
    mostrar(alvo) {
        const texto = alvo && alvo.dataset.cFormularioErro;
        if (!texto) return;
        if (!this.elemento) {
            this.elemento = document.createElement("div");
            this.elemento.className = "c_formulario_tooltip";
            this.elemento.setAttribute("role", "tooltip");
            document.body.appendChild(this.elemento);
        }
        this.elemento.innerHTML = texto;
        this.elemento.style.display = "block";
        const r = alvo.getBoundingClientRect();
        const w = this.elemento.offsetWidth, h = this.elemento.offsetHeight;
        const x = Math.max(4, Math.min(window.innerWidth - w - 4, r.left + r.width / 2 - w / 2));
        this.elemento.style.left = (x + window.scrollX) + "px";
        this.elemento.style.top = (r.top + window.scrollY - h - 8) + "px";
        this.elemento.style.setProperty("--seta", (r.left + r.width / 2 - x) + "px");
    },
    esconder() {
        if (this.elemento) this.elemento.style.display = "none";
    },
    ligar(alvo) {
        if (alvo._c_formulario_tooltip) return;
        alvo._c_formulario_tooltip = true;
        const mostrar = () => this.mostrar(alvo);
        const esconder = () => { if (!alvo.contains(document.activeElement) || !alvo.dataset.cFormularioErro) this.esconder(); };
        alvo.addEventListener("mouseenter", mostrar);
        alvo.addEventListener("focusin", mostrar);
        alvo.addEventListener("mouseleave", esconder);
        alvo.addEventListener("focusout", () => this.esconder());
    }
};

// ---------------------------------------------------------------------------
// Classe c_formulario

class c_formulario {
    constructor(id, ficheiro_json_mensagens_personalizadas = undefined) {
        this.erros = [];
        this.validacoes = [];
        this.tipo_aviso = tipos_aviso.aviso_texto;
        this.nome = String(id).replace("#", "");
        this.id = "#" + this.nome;
        this.formulario = document.getElementById(this.nome);
        this.msgs = JSON.parse(JSON.stringify(c_formulario_mensagens));
        this.msgs_carregadas = this.#Carregar_Mensagens(ficheiro_json_mensagens_personalizadas);
        this._aviso_pendente = false;

        if (!this.formulario || this.formulario.tagName !== "FORM") {
            this.#Mostra_Mensagem("construtor", 0);
            this.erros.push({ funcao: "Construtor", mensagem_erro: "O objeto não é um formulário " + this.id });
            console.log("Construtor: O objeto não é um formulário " + this.id);
        }
    }

    // As mensagens do c_formulario.json (e do ficheiro personalizado) substituem as pré-definidas
    #Carregar_Mensagens(personalizado) {
        const pasta = c_formulario_script_src.substring(0, c_formulario_script_src.lastIndexOf("/") + 1);
        const ler = (f) => fetch(f).then(r => r.ok ? r.json() : {}).catch(() => ({}));
        const pedidos = [ler(pasta + "c_formulario.json")];
        if (personalizado) pedidos.push(ler(personalizado));
        return Promise.all(pedidos).then(lista => { for (const d of lista) Object.assign(this.msgs, d); });
    }

    #Mostra_Mensagem(variavel, codigo) {
        if (typeof c_aviso === "undefined") {
            console.error("O objeto c_aviso (ficheiro c_aviso.js) não existe. Carregue-o antes do c_formulario.js.");
            return;
        }
        const linha = (this.msgs[variavel] || []).find(l => l[0] === codigo);
        if (!linha) {
            c_aviso.mostrar("danger", "Variável não encontrada: " + variavel, "Erro", this.msgs.tempo_de_espera);
            return;
        }
        const tipo = (this.msgs.tipos_mensagens.find(l => l[0] === linha[1]) || [0, "Erro", "danger"])[2];
        c_aviso.mostrar(tipo, linha[3], "", this.msgs.tempo_de_espera, { codigo: linha[2] });
    }

    // Transforma o id (com ou sem # ou ?) ou o número do atributo formulario-numobj no id do objeto
    #Normaliza_Id(id) {
        if (id === undefined || id === null) return undefined;
        let s = String(id).trim().replace("#", "");
        if (/^\d+$/.test(s)) {
            const el = this.formulario && this.formulario.querySelector(`[formulario-numobj="${s}"]`);
            return el ? el.id : undefined;
        }
        return s;
    }

    #Grupo(nome) {
        return this.formulario ? [...this.formulario.querySelectorAll(`input[name="${CSS.escape(nome)}"]`)] : [];
    }

    // O objeto onde se coloca o estado e o erro (num grupo, o contentor com o id igual ao name)
    #Objeto(id) {
        const nome = id.replace("?", "");
        return document.getElementById(nome) || (id.includes("?") ? this.#Grupo(nome)[0] : null);
    }

    #Existe(id) {
        if (!id) return false;
        const nome = id.replace("?", "");
        return !!document.getElementById(nome) || this.#Grupo(nome).length > 0;
    }

    // Os objetos escondidos, com a classe esconde_c_formulario ou desativados não são validados
    #Ignorado(id) {
        const nome = id.replace("?", "");
        const objetos = id.includes("?") ? this.#Grupo(nome) : [document.getElementById(nome)];
        const ativos = objetos.filter(o => o && !o.disabled && !o.classList.contains(c_formulario_constantes.classe_esconde) && o.getClientRects().length > 0);
        return ativos.length === 0;
    }

    #Ler_Marcador(marcador) {
        if (marcador.includes("data_address") || marcador.includes("form_address")) return this.#Pedido(marcador);

        const ponto = marcador.indexOf(".");
        const parte_objeto = ponto === -1 ? marcador : marcador.slice(0, ponto);
        const original = ponto === -1 ? "" : marcador.slice(ponto + 1);
        const prop = /dh|datahoje/i.test(original) ? original : original.toLowerCase();
        const por_nome = parte_objeto.includes("?");
        const nome = parte_objeto.replace("?", "");
        const grupo = por_nome ? this.#Grupo(nome) : null;
        const el = por_nome ? null : document.getElementById(nome);
        if (!por_nome && !el) return undefined;

        // Antes de cada teste é retirado o espaço no início e no fim do campo
        if (el && !c_formulario_constantes.nao_limpar.includes(prop) && typeof el.value === "string" && !["checkbox", "radio", "file"].includes(el.type))
            el.value = el.value.trim();

        const valor = por_nome ? String((grupo.find(o => o.checked) || {}).value ?? "") : String(el.value ?? "");
        const entre = () => {
            const m = original.match(/\((.*)\)/s);
            return m ? m[1].trim().replace(/^['"`]|['"`]$/g, "") : null;
        };

        if (prop === "passe" || prop === "complexity") return c_formulario_passe(valor);
        if (prop.includes("contar") || prop.includes("count")) {
            const c = entre();
            return c ? valor.toLowerCase().split(c.toLowerCase()).length - 1 : -1;
        }
        if (prop === "val" || prop === "value") return valor;
        if (prop === "valemail" || prop === "email") return c_formulario_constantes.email.test(valor);
        if (prop === "valurl" || prop === "url") return c_formulario_constantes.url.test(valor);
        if (prop === "valip" || prop === "ip") return c_formulario_constantes.ip.test(valor);
        if (prop === "valdata" || prop === "data") return c_formulario_data(valor) === null; // verdadeiro quando INVÁLIDA
        if (/datahoje|dh/i.test(prop)) {
            const d = c_formulario_data(valor);
            if (!d) return false;
            const h = new Date(); h.setHours(0, 0, 0, 0);
            switch (prop.split("_")[1]) {
                case "M": return d > h;
                case "m": return d < h;
                case "Mi": case "MI": return d >= h;
                case "mi": case "mI": return d <= h;
            }
            return false;
        }
        if (prop === "valcodpostal" || prop === "codpostal") return c_formulario_constantes.codigo_postal.test(valor);
        if (prop === "check" || prop === "checked") return por_nome ? grupo.some(o => o.checked) : !!el.checked;
        if (prop === "length" || prop === "len") return por_nome ? grupo.filter(o => o.checked).length : valor.length;
        if (prop.includes("isnumeric")) return c_formulario_isNumeric(valor);
        if (prop.includes("includes") || prop.includes("indexof")) {
            const c = entre();
            return c === null ? "ERRO AO AVALIAR A PROPRIEDADE " + prop.toUpperCase() : valor.includes(c);
        }
        return "ERRO DE PROPRIEDADE NÃO IDENTIFICADO";
    }

    // data_address((<ligação>;;<dados JSON>)) ou form_address((<ligação>;;<id do formulário>))
    #Pedido(texto) {
        const tipo = texto.includes("data_address") ? "DATA_ADDRESS" : "FORM_ADDRESS";
        const a = texto.indexOf("(("), b = texto.lastIndexOf("))");
        if (a === -1 || b === -1) return `ERRO AO AVALIAR A PROPRIEDADE ${tipo}: Existem um ou os dois limitadores dos dados - (( ou ))`;
        const dentro = texto.slice(a + 2, b);
        const sep = dentro.indexOf(";;");
        if (sep === -1) return `ERRO AO AVALIAR A PROPRIEDADE ${tipo}: falta o separador ;;`;
        const ligacao = dentro.slice(0, sep).trim();
        const dados = dentro.slice(sep + 2);
        if (!ligacao) return `ERRO AO AVALIAR A PROPRIEDADE ${tipo}: Valor de LINK inválido`;
        let fd;
        if (tipo === "DATA_ADDRESS") {
            // Os marcadores dentro dos dados são substituídos pelos valores (com escape)
            const substituido = dados.replace(/«([^«»]*)»/g, (_, m) => {
                const v = this.#Ler_Marcador(m);
                return typeof v === "string" ? JSON.stringify(v) : String(v);
            });
            fd = c_formulario_formdata(substituido);
            if (!fd) return `ERRO AO AVALIAR A PROPRIEDADE DATA_ADDRESS: Valor de DATA inválida (${substituido})`;
        } else {
            const form = document.getElementById(dados.trim().replace("#", ""));
            if (!form || form.tagName !== "FORM") return `ERRO AO AVALIAR A PROPRIEDADE FORM_ADDRESS: Valor de DATA inválida (${dados})`;
            fd = new FormData(form);
        }
        return c_formulario_pedido(ligacao, fd);
    }

    Adiciona_Validacoes(validacao = []) {
        if (!Array.isArray(validacao) || validacao.length < 3) {
            console.error("ADICIONA_VALIDACOES: indique [id do objeto, condição, texto do erro]");
            return false;
        }
        this.validacoes.push({ id: String(validacao[0]), comparacao: String(validacao[1]), texto_erro: String(validacao[2]), mostra_resultado: validacao[3] === true });
        return true;
    }

    // Coloca o estado (válido / inválido) e a mensagem de erro de uma validação
    #Colocar_Estado(v, erro, focar, mostrar_aviso) {
        const id = v.id.replace("?", "");
        const obj = this.#Objeto(this.#Normaliza_Id(v.id));
        if (!obj) return;
        const campo = obj.matches("input, select, textarea");
        const cl_erro = campo ? c_formulario_constantes.classe_invalido : c_formulario_constantes.classe_obj_invalido;
        const cl_valido = campo ? c_formulario_constantes.classe_valido : c_formulario_constantes.classe_obj_valido;
        const id_erro = c_formulario_constantes.prefixo_erro + obj.id;

        let div = document.getElementById(id_erro);
        if (this.tipo_aviso === tipos_aviso.aviso_texto && !div) {
            div = document.createElement("div");
            div.id = id_erro;
            div.className = `${c_formulario_constantes.classe_erro} ${c_formulario_constantes.classe_esconde}`;
            div.setAttribute("aria-live", "polite");
            const contentor = obj.closest("div") || obj.parentElement;
            if ((obj.type === "checkbox" || v.id.includes("?")) && contentor) contentor.after(div);
            else contentor.appendChild(div);
        }

        if (!erro) {
            obj.classList.remove(cl_erro);
            obj.classList.add(cl_valido);
            obj.removeAttribute("aria-invalid");
            delete obj.dataset.cFormularioErro;
            if (div) { div.classList.add(c_formulario_constantes.classe_esconde); div.textContent = ""; }
            if (obj.contains(document.activeElement)) c_formulario_tooltip.esconder();
            return;
        }

        if (mostrar_aviso && !this._aviso_pendente && (typeof c_aviso === "undefined" || c_aviso.quantidade() === 0)) {
            this._aviso_pendente = true;
            this.#Mostra_Mensagem("formulario", 0);
            setTimeout(() => { this._aviso_pendente = false; }, 0);
        }
        obj.classList.remove(cl_valido);
        obj.classList.add(cl_erro);
        obj.setAttribute("aria-invalid", "true");
        if (this.tipo_aviso === tipos_aviso.aviso_tooltip) {
            obj.dataset.cFormularioErro = v.texto_erro;
            c_formulario_tooltip.ligar(obj);
            if (obj.contains(document.activeElement)) c_formulario_tooltip.mostrar(obj);
        } else if (div) {
            div.classList.remove(c_formulario_constantes.classe_esconde);
            div.innerHTML = v.texto_erro;
            const desc = (obj.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
            if (!desc.includes(id_erro)) obj.setAttribute("aria-describedby", [...desc, id_erro].join(" "));
        }
        if (focar) {
            // O foco vai para o primeiro objeto com erro, centrado no ecrã
            const alvo = campo ? obj : (obj.querySelector("input, select, textarea") || obj);
            obj.scrollIntoView({ behavior: "smooth", block: "center" });
            if (alvo.focus) alvo.focus({ preventScroll: true });
        }
    }

    // Testa todas as validações (ou só as de um objeto). Devolve verdadeiro se existirem erros
    // ou se não for possível validar (ex: objeto inexistente), para impedir a submissão
    Testa_Validacoes(num_ou_nome_objeto = undefined, coloca_focus_erro = true) {
        if (this.erros.length) {
            console.log(`TESTA_VALIDACOES: O objeto ${this.id} definido não é um formulário!`);
            return true;
        }
        let alvo;
        if (num_ou_nome_objeto !== undefined) {
            alvo = this.#Normaliza_Id(num_ou_nome_objeto);
            if (!this.#Existe(alvo)) {
                console.log(`TESTA_VALIDACOES: O objeto ${num_ou_nome_objeto} definido não existe no formulário!`);
                return true;
            }
            alvo = alvo.replace("?", "");
        }
        const testar = this.validacoes.filter(v => alvo === undefined || (this.#Normaliza_Id(v.id) || "").replace("?", "") === alvo);
        if (!testar.length) return false;

        const testados = new Set();
        let existe_erros = false;
        for (const v of testar) {
            const id = this.#Normaliza_Id(v.id);
            if (!id || !this.#Existe(id)) continue;
            const chave = id.replace("?", "");
            if (testados.has(chave) || this.#Ignorado(id)) continue;

            let resultado;
            try {
                resultado = c_formulario_avaliar(v.comparacao, (m) => this.#Ler_Marcador(m));
                if (v.mostra_resultado) alert(`Comparação: ${v.comparacao} - Resultado: ${resultado}`);
            } catch (e) {
                console.error(`TESTA_VALIDACOES: (${v.id}) - ${e.message}`);
                continue;
            }
            if (typeof resultado !== "boolean") {
                console.error(`TESTA_VALIDACOES: (${v.id}) - A expressão não devolve verdadeiro/falso: ${v.comparacao}`);
                continue;
            }
            // O aviso geral só aparece ao validar o formulário completo
            this.#Colocar_Estado(v, resultado, coloca_focus_erro, alvo === undefined);
            if (resultado) {
                testados.add(chave);
                if (!existe_erros) { existe_erros = true; coloca_focus_erro = false; }
            }
        }
        return existe_erros;
    }

    // Limpa os erros; com reset limpa também o formulário, sem reset só retira os espaços
    Limpar_Validacoes(reset_formulario = true) {
        const classes = [c_formulario_constantes.classe_valido, c_formulario_constantes.classe_invalido,
                         c_formulario_constantes.classe_obj_valido, c_formulario_constantes.classe_obj_invalido];
        for (const v of this.validacoes) {
            const id = this.#Normaliza_Id(v.id);
            const obj = id && this.#Objeto(id);
            if (!obj) continue;
            obj.classList.remove(...classes);
            obj.removeAttribute("aria-invalid");
            delete obj.dataset.cFormularioErro;
            const div = document.getElementById(c_formulario_constantes.prefixo_erro + obj.id);
            if (div) { div.classList.add(c_formulario_constantes.classe_esconde); div.textContent = ""; }
        }
        c_formulario_tooltip.esconder();
        if (!this.formulario) return;
        if (reset_formulario) this.formulario.reset();
        else this.formulario.querySelectorAll("input, textarea").forEach(el => {
            if (!["checkbox", "radio", "file", "password", "hidden", "button", "submit", "reset"].includes(el.type)) el.value = el.value.trim();
        });
    }
}
