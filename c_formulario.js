/***********************************************************/
/* C_FORMULÁRIO - Validador de formulários                 */
/* Desenvolvido por Marco Meneses (EMES3SOFT)              */
/* Versão 1.9                                              */
/***********************************************************/

// Testes se objecto necessários existem

if (!window.jQuery) {  
    console.error("A libraria jQuery está em falta.");
}

if (typeof bootstrap !== 'object') {
    console.error("A libraria bootstrap está em falta.");
}

if (typeof c_aviso !== 'object') {
    console.error("A libraria c_aviso está em falta.");
}

// Endereço deste script (obtido enquanto o script está a ser carregado)
const c_formulario_script_src = document.currentScript ? document.currentScript.src : undefined;

// Funções Adicionais

$.fn.atualiza_tooltip_c_formulario = function(texto, elem = this) {
    $(elem).apaga_tooltip_c_formulario();
    const bsTooltip_c_formulario = new bootstrap.Tooltip($(elem)[0], {container: 'body', placement: 'top', title: texto, customClass: 'erro_c_formulario_tooltip',
    template: '<div class="tooltip c_formulario" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'});
    // Se o campo já tem o foco (ex: validação enquanto escreve), mostra logo o tooltip
    if ($(elem)[0] === document.activeElement) bsTooltip_c_formulario.show();
    return bsTooltip_c_formulario;
}

$.fn.apaga_tooltip_c_formulario = function() {
    return this.each(function() {
        const tooltip = bootstrap.Tooltip.getInstance(this);
        if (tooltip) tooltip.dispose();
    });
}

$.fn.hasAttr_c_formulario = function(name) {
    return this.attr(name) !== undefined;
};

$.fn.contagem_cararteres = function(carateres) {
    const texto = this.is("input,textarea,select") ? String(this.val() ?? "") : this.text();
    const match = texto.match(new RegExp(carateres, 'g'));
    return match ? match.length : 0;
}

/**
 * Verifica se um valor é numérico
 * @param {Any} valor 
 * @returns {Boolean}
 */
function isNumeric(valor) {
    return !isNaN(valor) && !isNaN(parseFloat(valor));
}

function hora_valida(hora) {
    return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(String(hora))
}

function devolve_datadiff(data1, data2) {
    return Math.abs(data1.getTime() - data2.getTime())
}

// Classes

class comparacoes {
    constructor(expressao, objeto, propriedade, valor) {
        this.expressao = expressao;
        this.objeto = objeto;
        this.propriedade = propriedade;
        this.valor = valor;
    }
}

class mensagens {
    constructor(ficheiro, existe, tempo_de_espera) {
        this.ficheiro = ficheiro;
        this.existe = existe;
        this.tempo_de_espera = tempo_de_espera;
    }
}

class formulario_validacoes {
    constructor(id, comparacao, texto_erro, mostra_resultado=false) {
        this.num = 0; // definido ao adicionar ao vetor de validações
        this.id = id;
        this.comparacao = comparacao;
        this.texto_erro = texto_erro;
        this.mostra_resultado = mostra_resultado;
    }
}

class formulario_erros {
    constructor(funcao, mensagem_erro){
        this.num = 0; // definido ao adicionar ao vetor de erros
        this.funcao = funcao;
        this.mensagem_erro = mensagem_erro;
    }
}

class formulario_objetos {
    constructor(num, id, valor, escondido, testado = false){
        this.num = num;
        this.id = id;
        this.valor = valor;
        this.escondido = escondido;
        this.testado = testado
    }
}

class limitadores {
    static get inicial() { return '«' };
    static get final() { return '»' };
    static get separador() { return "." };
    static get includes_inicial() { return "('" };
    static get includes_final() { return "')" };
    static get valores_inicial() { return "((" };
    static get valores_final() { return "))" };
    static get separador_valores() { return ";;" }
}

class tipos_aviso {
    static get aviso_tooltip() { return 'tooltip' };
    static get aviso_texto() { return 'text' };
    static get aviso_toast() { return "toast" };
}

class constantes {
    static get classe_erro_tooltip() { return "erro_c_formulario_tooltip" };
    static get classe_esconde() { return "esconde_c_formulario" };
    static get classe_erro() { return "erro_c_formulario" };
    static get classe_geral_valido() { return "is-valid" };
    static get classe_geral_invalido() { return "is-invalid" };
    static get classe_obj_valido() { return "objeto_valido_c_formulario" };
    static get classe_obj_valido_cbd() { return "valido" };
    static get classe_obj_invalido() { return "objeto_invalido_c_formulario" };
    static get classe_obj_invalido_cbd() { return "invalido" };
    static get prefixo_obj_erro() { return "erro_" };
    static get tempo_espera() { return 3500 };
    static get email_regex() { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/ };
    static get passe_regex() { return /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).{10,25}$/ };
    static get ip_regex() { return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ };
    static get url_regex() { return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g }
    static get codigo_postal_regex() { return /^\d{4}-\d{3}?$/ }
    static get nome_ficheiro_json() { return "c_formulario.json" }
    static get nao_limpar_objectos() { return ["passe","complexity","check","checked"] }
}

// Classe c_formulario

class c_formulario {        
    constructor(id, ficheiro_json_mensagens_personalizadas = undefined) {
        // Headers('Access-Control-Allow-Origin', '*');
        this.erros = [];
        this.caminho = this.#Devolve_Diretoria_Local();

        this.msgs = new mensagens (this.caminho + constantes.nome_ficheiro_json, false, constantes.tempo_espera);
        this.msgs.dados = {};
        this.msgs.pendentes = new Set();
        this.msgs.carregado = this.#Carregar_Mensagens(ficheiro_json_mensagens_personalizadas);

        this.nome = id;
        this.id = this.#Verifica_String_SubString(id,'#') ? id : "#" + id;
        this.tipo_aviso = tipos_aviso.aviso_texto;

        this.formulario = $(this.id);
        this.formulario.encontrarobjetos = "input,textarea,select";
        this.formulario.filtro = "*";
        this.formulario.elementos = [];
        this.formulario.num_elementos = this.formulario.elementos.length;
        this.formulario.objetos = [];
        this.formulario.ficheiro_mensagens = ficheiro_json_mensagens_personalizadas;

        if (this.formulario.is("form")) {
            this.#RecolherElementos();
        }
        else
        {
            this.#mostra_mensagem_c_formulario("construtor",0);
            this.Adiciona_Erros(["Construtor", "O objeto não é um formulário " + this.id]);
            console.log(this.erros[0].funcao + ": " + this.erros[0].mensagem_erro + " " + this.id);
        }

        this.validacoes = [];
        this.validacoes.elemento_error = undefined;
    }

    #Verifica_se_IPV4(endereco_ip) {
        var blocks = endereco_ip.split(".");
        if(blocks.length === 4) {
            return blocks.every(function(block) {
                return parseInt(block,10) >=0 && parseInt(block,10) <= 255;
            });
        }
        return false;
    }
    // Verifica se existe uma substring dentro de uma string
    #Verifica_String_SubString(str = undefined, substr = undefined) {
        if (str === undefined || substr === undefined)
            return false;
        
        if (typeof str !== "string" || typeof substr !== "string")
            return false;
        
        return str.includes(substr);
    }

    // Devolve a posição de uma substring dentro de uma string, -1 se não existe
    #Devolve_Pos_String_SubString(str = undefined, substr = undefined) {
        if (str === undefined || substr === undefined)
            return false;
        if (typeof str !== "string" || typeof substr !== "string")
            return false;
        
        return str.indexOf(substr);
    }

    // Devolve a diretoria on se encontra o script do c_formulario
    #Devolve_Diretoria_Local() {
        let diretoria = undefined;

        if (c_formulario_script_src)
            return c_formulario_script_src.substring(0, c_formulario_script_src.lastIndexOf('/') + 1);

        $.each(document.querySelectorAll("script"), function() {
            if ($(this).attr("src") != undefined && $(this).attr("src").includes("c_formulario")) {
                let lastIndex = $(this).attr("src").lastIndexOf('/');
                diretoria = $(this).attr("src").substring(0, lastIndex + 1);
                return false;
            }
        });

        return diretoria ?? "";
    }

    // Carrega (uma única vez) o ficheiro JSON das mensagens e, se indicado, o ficheiro personalizado por cima deste
    #Carregar_Mensagens(ficheiro_personalizado = undefined) {
        const ler = (ficheiro) => new Promise((resolve) => {
            $.getJSON(ficheiro)
                .done((dados) => resolve(dados))
                .fail(() => {
                    console.error("Erro no acesso ao ficheiro de mensagens: " + ficheiro);
                    resolve({});
                });
        });

        const pedidos = [ler(this.msgs.ficheiro)];
        if (ficheiro_personalizado !== undefined) pedidos.push(ler(ficheiro_personalizado));

        return Promise.all(pedidos).then(([base, personalizado = {}]) => {
            this.msgs.dados = $.extend({}, base, personalizado);
            this.msgs.existe = Object.keys(this.msgs.dados).length > 0;
            if (this.msgs.dados.tempo_de_espera !== undefined)
                this.msgs.tempo_de_espera = this.msgs.dados.tempo_de_espera;
        });
    }

    // Ler a informação do ficheiro JSON das mensagens (já carregado)
    #ler_ficheiro_c_formulario(nome_dado, pos = -1) {
        if (!this.msgs.existe) {
            console.error("O ficheiro json de mensagens não existe: " + this.msgs.ficheiro);
            return -2;
        }

        let resp = this.msgs.dados[nome_dado];

        if (resp === undefined) {
            console.error('A informação ' + nome_dado + ' não se encontra no ficheiro ' + this.msgs.ficheiro);
            return -1;
        }

        return (pos > -1) ? resp[pos] : resp;
    }

    // Mostra mensagem toast do formulário
    #mostra_mensagem_c_formulario(variavel_mensagem, codigo_mensagem, com_titulo = false) {
        if (typeof c_aviso === "undefined") {
            console.error("O objeto c_aviso (ficheiro JS) não existe. Efetue o seu download, para as mensagens funcionem!");
            return false;
        }

        // Evita repetir a mesma mensagem enquanto o ficheiro JSON ainda está a ser carregado
        const chave = variavel_mensagem + "_" + codigo_mensagem;
        if (this.msgs.pendentes.has(chave)) return;
        this.msgs.pendentes.add(chave);

        this.msgs.carregado.then(() => {
            this.msgs.pendentes.delete(chave);
            let valor = this.#ler_ficheiro_c_formulario(variavel_mensagem);

            let info_msg = null;
            for (let i=0; i < valor.length; i++)
                if (valor[i][0] == codigo_mensagem)
                {
                    info_msg = valor[i];
                    break;
                }

            if (info_msg != null)
            {
                let tipo_mensagem = this.#ler_ficheiro_c_formulario("tipos_mensagens",info_msg[1]);

                c_aviso.mostrar(tipo_mensagem[2], info_msg[3], com_titulo ? tipo_mensagem[1] : '', this.msgs.tempo_de_espera, { codigo: info_msg[2] });
            }
            else
                c_aviso.mostrar('danger', "Variável não encontrada: " + variavel_mensagem, 'Erro', this.msgs.tempo_de_espera);
        });
    }

    // Transforma um id em objeto jQUERY
    #Transforma_id_em_objeto(num_ou_nome_objeto = undefined) {
        return $("#" + num_ou_nome_objeto)
    }
    
    // Adiciona erros ao vetor de erros
    Adiciona_Erros(dados = []) {
        if (dados.length != 2) return;
        const erro = new formulario_erros(...dados);
        erro.num = this.erros.length + 1;
        this.erros.push(erro);
    }

    // Apagar erros ao vetor de erros
    Apaga_Erros(funcao) {
        for(let i = this.erros.length - 1; i >= 0; i--) {
            if (this.erros[i].funcao.toUpperCase() === funcao.toUpperCase()) {
                this.erros.splice(i,1);
            }
        }
    }

    // Obtem os elementos relativos ao formulário
    ObterElementos() {
        if (this.erros.length === 0) {
            this.formulario.elementos = this.formulario.find(this.formulario.encontrarobjetos).filter(this.formulario.filtro);
            this.formulario.num_elementos = this.formulario.elementos.length;
        }
    }

    // Nova recolha de dados de formulario
    #RecolherElementos() {
        if (this.erros.length === 0) {
            let valor_id=0;
            this.ObterElementos();
            this.formulario.vetores = new formulario_objetos([],[],[],[]);
            this.formulario.objetos = [];

            for(let i=0; i < this.formulario.num_elementos; i++) {
                const elemento = this.formulario.elementos[i];
                valor_id = $(elemento).hasAttr_c_formulario("formulario-numobj") ? parseInt($(elemento).attr("formulario-numobj")) : i;
                if (elemento.id !== "") {
                    const escondido = $(elemento).hasClass(constantes.classe_esconde) || elemento.disabled;
                    let dados=[];
                    if ($(elemento).is(":checkbox") || elemento.id.includes("chk"))
                        dados = [valor_id, elemento.id, elemento.checked ? 1 : 0, escondido];
                    else
                        dados = [valor_id, elemento.id, elemento.value, escondido];
                    this.formulario.objetos.push(new formulario_objetos(...dados));

                    this.formulario.vetores.num.push(dados[0]);
                    this.formulario.vetores.id.push(dados[1]);
                    this.formulario.vetores.valor.push(dados[2]);
                    this.formulario.vetores.escondido.push(dados[3]);
                }
            }
        }
    }

    // validacoes -> teste de validação (true-erro or false-sem erro), mensagem de erro
    #Testa_Entrada_Dados(dados=[]) {
        if (this.erros.length === 0) {
            if (this.#Verifica_Elemento_Existe(dados[0]) == -1) {
                console.log("TESTA_ENTRADA_DADOS: O objeto não existe no formulário: " + dados[0]);
                return false;
            }
            else if (typeof dados[1] !== 'string') {
                console.log("TESTA_ENTRADA_DADOS: O objeto não é texto. " + dados[1]);
                return false;
            }
            else if (typeof dados[2] !== 'string') {
                console.log("TESTA_ENTRADA_DADOS: O objeto não é texto para o erro."  + dados[2]);
                return false;
            }
            else if (dados.length == 4)
                if (typeof dados[3] !== 'boolean') {
                    console.log("TESTA_ENTRADA_DADOS: O objeto não é um valor booleano. " + dados[3]);
                    return false;
            }

            return true;
        }

        console.log("TESTA_ENTRADA_DADOS: Existem erros no formulário");
        return false;
    }

    // Adiciona validações ao vetor de validações
    // id ou num do objeto, comparação, string com a mensagem de erro
    Adiciona_Validacoes(dados = []) {
        if (this.erros.length === 0) {
            if ([3, 4].includes(dados.length)) {
                if (this.#Testa_Entrada_Dados(dados)) {
                    dados = [...dados];
                    dados[0] = this.#Normaliza_Id(dados[0]);
                    const validacao = new formulario_validacoes(...dados);
                    validacao.num = this.validacoes.length + 1;
                    this.validacoes.push(validacao);
                    return true;
                }
            }
                
            console.log("ADICIONA_VALIDACOES: Deve introduzir 3 ou 4 dados como vetor ([id ou formulario-numobj do objeto, string de comparação, string com a mensagem de erro]): \n" + dados.length + " -- " + JSON.stringify(dados));
            return false;
        }
        else
            console.log('ADICIONA_VALIDACOES: O objeto definido não é um formulário');
    }

    // Devolve o valor do indice no vetor caso existe, caso contrário devolve -1
    #Existe_Valor_Vetor(valor, vetor) {
        return vetor.indexOf(valor);
    }

    // Converte o número do objeto (formulario-numobj) no seu id
    #Normaliza_Id(num_ou_nome_objeto) {
        if (typeof num_ou_nome_objeto !== "number") return num_ou_nome_objeto;

        let pos = this.#Posicao_Elemento_Objetos_Formulario(num_ou_nome_objeto);
        return (pos > -1) ? this.formulario.vetores.id[pos] : num_ou_nome_objeto;
    }

    // Devolve a valor da posição se o elemento existe, caso contrário devolve -1
    #Posicao_Elemento_Objetos_Formulario(num_ou_nome_objeto = undefined) {
        let encontrou_pos = -1;

        if (typeof num_ou_nome_objeto === "string" && num_ou_nome_objeto.includes("?")) {
            encontrou_pos = this.formulario.vetores.id.filter(str => str.includes(num_ou_nome_objeto.replace("?",""))).length - 1;
            if (encontrou_pos > -1) {
                encontrou_pos = this.#Existe_Valor_Vetor(this.formulario.vetores.id.filter(str => str.includes(num_ou_nome_objeto.replace("?","")))[0],this.formulario.vetores.id);
            }
        }
        else {
            encontrou_pos = this.#Existe_Valor_Vetor(num_ou_nome_objeto,this.formulario.vetores.num);
            if (encontrou_pos == -1) encontrou_pos = this.#Existe_Valor_Vetor(num_ou_nome_objeto,this.formulario.vetores.id);
        }
        
        return encontrou_pos;
    }

    // Verifica se o objeto existe no vetor dos objetos do formulário
    #Verifica_Elemento_Existe(num_ou_nome_objeto = undefined) {
        if (num_ou_nome_objeto === undefined) {
            console.error(`VERIFICA_ELEMENTO_EXISTE: = O ID do objeto ${num_ou_nome_objeto} é indefinido!`);
            return -1;
        }
        else if (typeof num_ou_nome_objeto !== 'number' && typeof num_ou_nome_objeto !== 'string'){
            console.error(`VERIFICA_ELEMENTO_EXISTE: O número ou o id do objeto ${num_ou_nome_objeto} do tipo errado!`);
            return -1;
        }

        let devolver = this.#Posicao_Elemento_Objetos_Formulario(num_ou_nome_objeto);

        if (devolver == -1){
            console.error(`VERIFICA_ELEMENTO_EXISTE: O objeto ${num_ou_nome_objeto} não existe no formulário!`);
            return -1;
        }

        return devolver;
    }

    //Verifica se o objeto existe no vetor dos objetos do formulário
    #Verifica_Elemento_Validacao_Existe(num_ou_nome_objeto = undefined) {
        let vetor_encontrou_pos_validacoes = [];
        
        if (this.validacoes.length ==0) {
            console.error(`VERIFICA_ELEMENTO_VALIDACAO_EXISTE: Não existem validações para testar!`);
            return -1;
        }

        for (let i = 0; i < this.validacoes.length; ++i)
            if (num_ou_nome_objeto == undefined || this.validacoes[i].id == num_ou_nome_objeto)
                vetor_encontrou_pos_validacoes.push(i);

        if (vetor_encontrou_pos_validacoes.length == 0) {
            console.error(`VERIFICA_ELEMENTO_VALIDACAO_EXISTE: O objeto ${num_ou_nome_objeto} não existe nas validações!`);
            return -1;
        }

        return vetor_encontrou_pos_validacoes;
    }

    // Devolve o texto entre dois limitadores
    #Devolve_texto_entre_limitadores(texto, limitador_inicial, limitador_final, inclui_limitadores = false) {
        if (!texto.includes(limitador_inicial) || !texto.includes(limitador_final)) {
            console.error(`DEVOLVE_TEXTO_ENTRE_LIMITADORES: O objeto ${texto} não contém os limitadores ${limitador_inicial} ou ${limitador_final}!`);
            return -1;
        }
        else {
            let pos_inicio = texto.indexOf(limitador_inicial) + limitador_inicial.length + (inclui_limitadores ? -1 : 0);
            let pos_final = texto.indexOf(limitador_final, pos_inicio) + (inclui_limitadores ? 1 : 0);

            return texto.substring(pos_inicio, pos_final)
        }
    }

    // Devolve verdadeiro ou false, caso seja um dicionário ou não
    #Verifica_Dicionario(valor_a_testar) {
        return Object.prototype.toString.call(valor_a_testar) === '[object Object]'
    }

    #QueryString_Para_Dicionario(texto) {
        if (typeof texto !== "string" || texto.trim() === "")
            return undefined;

        let params = new URLSearchParams(texto);
        let obj = {};

        for (const [chave, valor] of params.entries()) {
            obj[chave] = valor;
        }

        return Object.keys(obj).length > 0 ? obj : undefined;
    }

    #EDicionario(obj) {
        return typeof obj === "object" &&
            obj !== null &&
            !Array.isArray(obj) &&
            !(obj instanceof FormData);
    }

    #Pedido_Valores($ligacao = undefined, $dados = undefined) {
        if ($ligacao == undefined || $dados == undefined)
            return undefined;

        let $devolve = undefined;
        let form = undefined;

        // Testa se é FormData
        if ($dados instanceof FormData) {
            form = $dados;
        }
        else {
            let obj = undefined;

            // Testa se já é um dicionário/objeto simples
            if (this.#EDicionario($dados)) {
                obj = $dados;
            }
            else if (typeof $dados === "string") {
                // Tenta converter JSON
                try {
                    obj = JSON.parse($dados);
                }
                catch (e) {
                    // Se não for JSON, tenta converter querystring
                    obj = this.#QueryString_Para_Dicionario($dados);
                }
            }

            // Verifica se ficou um dicionário válido
            if (!this.#EDicionario(obj)) {
                console.error("Os dados enviados não são válidos.");
                return undefined;
            }

            // Converte objeto para FormData
            form = new FormData();
            for (const chave in obj) {
                form.append(chave, obj[chave]);
            }
        }

        $.ajax({
            url: $ligacao,
            type: "POST",
            data: form,
            async: false,
            contentType: false,
            processData: false,
            cache: false,
            success: function (data) {
                $devolve = data;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $devolve = xhr.status + " - " + xhr.responseText;
                console.log($devolve);
            }
        });

        return $devolve;
    }

    #Devolve_posicao_limitadores(texto_a_verificar, inicio_em = 0, incluir_limitadores = true) {
        let posicoes_limitadores = [-1,-1];
        let cont_limitadores = [0,0];

        inicio_em = texto_a_verificar.indexOf(limitadores.inicial, inicio_em);

        if (inicio_em == -1) 
            return posicoes_limitadores;

        for (let posicoes = inicio_em; posicoes <= texto_a_verificar.length; ++posicoes) {
            if (texto_a_verificar[posicoes] == limitadores.inicial) {
                cont_limitadores[0]++;
                posicoes_limitadores[0] = posicoes + (incluir_limitadores ? 0 : 1);
            }
            else if (texto_a_verificar[posicoes] == limitadores.final) {
                posicoes_limitadores[1] = posicoes + (incluir_limitadores ? 1 : 0);
                break;
            }
        }

        return posicoes_limitadores;
    }

    #formatISO(date) {
        return `${date.getFullYear()}-${
            String(date.getMonth() + 1).padStart(2, "0")
        }-${
            String(date.getDate()).padStart(2, "0")
        }`;
    }

    #dataParaISOUniversal(valor) {
        if (!valor) return null;

        // Se já for Date
        if (valor instanceof Date) {
            if (isNaN(valor)) return null;
            return this.#formatISO(valor);
        }

        // normalizar separadores
        const str = String(valor).trim().replace(/[/.]/g, "-");

        // formatos suportados
        const formatos = [
            "YYYY-MM-DD",
            "DD-MM-YYYY",
            "MM-DD-YYYY",
            "YY-MM-DD",
            "DD-MM-YY",
            "MM-DD-YY"
        ];

        for (const formato of formatos) {

            const f = formato.split("-");
            const p = str.split("-");

            if (f.length !== p.length) continue;

            let dia, mes, ano;
            let ok = true;

            for (let i = 0; i < f.length; i++) {

                if (!/^\d+$/.test(p[i])) {
                    ok = false;
                    break;
                }

                const n = Number(p[i]);

                if (f[i] === "DD") dia = n;
                else if (f[i] === "MM") mes = n;
                else if (f[i] === "YYYY") ano = n;
                else if (f[i] === "YY") ano = n < 50 ? 2000 + n : 1900 + n;
                else ok = false;
            }

            if (!ok) continue;

            const dt = new Date(ano, mes - 1, dia);

            if (
                dt.getFullYear() === ano &&
                dt.getMonth() === mes - 1 &&
                dt.getDate() === dia
            ) {
                return this.#formatISO(dt);
            }
        }

        // fallback (browser parse)
        const tentativa = new Date(str);
        if (!isNaN(tentativa)) return this.#formatISO(tentativa);

        return null;
    }

    // Converte datas em objetos Date (hora local), com a hora indicada (HH:mm:ss) ou a hora da própria data
    #Data_Hora(data = new Date(), hora = undefined) {
        if (data == null) return null;

        if (!(data instanceof Date)) {
            const iso = this.#dataParaISOUniversal(data);
            if (iso == null) return null;

            const [ano, mes, dia] = iso.split("-").map(Number);
            data = new Date(ano, mes - 1, dia);
        }

        if (isNaN(data)) return null;

        let horas = data.getHours(), minutos = data.getMinutes(), segundos = data.getSeconds();

        if (hora != undefined && hora_valida(hora))
            [horas, minutos, segundos] = String(hora).split(":").map(Number);

        return new Date(data.getFullYear(), data.getMonth(), data.getDate(), horas, minutos, segundos);
    }

    // Elabora o texto final de comparação com a substituição dos objetos pelos seus valores
    #Texto_Final(texto_comparacao, inicio = 0) {
        let txtstr = texto_comparacao;
        let pos_procura = inicio;

        while (txtstr.indexOf(limitadores.inicial, pos_procura) != -1) {
            let posicoes = this.#Devolve_posicao_limitadores(txtstr, pos_procura);

            if (posicoes[1] == -1) {
                console.error(`TEXTO_FINAL: Falta o limitador ${limitadores.final} na expressão: ${texto_comparacao}`);
                break;
            }

            let str_objeto = txtstr.substring(posicoes[0], posicoes[1]);

            let str_objeto_partes = [];
            if (str_objeto.includes("data_address") || str_objeto.includes("form_address")) {
                str_objeto_partes.push(str_objeto.substr(1, str_objeto.length-2));
            }
            else if (str_objeto.includes(limitadores.separador)) {
                let str_separador = str_objeto.indexOf(limitadores.separador)
                let parte_0 = str_objeto.substring(0, str_separador).replace(limitadores.inicial,"").replace(limitadores.final,"")
                let parte_1 = str_objeto.substring(str_separador + 1).replace(limitadores.inicial,"").replace(limitadores.final,"")

                str_objeto_partes.push(parte_0)
                str_objeto_partes.push(parte_1)
            }
            else{
                str_objeto_partes.push(str_objeto.replace(limitadores.inicial,"").replace(limitadores.final,""));
            }

            let str_objeto_valor = undefined;

            if (str_objeto_partes.length == 1) {
                if (str_objeto_partes[0].includes("data_address")) {
                    if (str_objeto_partes[0].indexOf(limitadores.valores_inicial) == -1 || str_objeto_partes[0].indexOf(limitadores.valores_final) == -1) {
                        str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE DATA_ADDRESS: Existem um ou os dois limitadores dos dados  - ${limitadores.valores_inicial} ou ${limitadores.valores_final}`;
                    }
                    else {
                        str_objeto_valor = this.#Devolve_texto_entre_limitadores(str_objeto_partes[0],limitadores.valores_inicial,limitadores.valores_final,false);

                        try {
                            str_objeto_valor = str_objeto_valor.split(limitadores.separador_valores);

                            if (str_objeto_valor[0] == undefined || typeof str_objeto_valor[0] !== "string") {
                                str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE DATA_ADDRESS: Valor de LINK (${str_objeto_valor[0]})`;
                            }
                            else if (str_objeto_valor[1] == undefined || typeof str_objeto_valor[1] !== "string") {
                                str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE DATA_ADDRESS: Valor de DATA inválida (${str_objeto_valor[1]})`;
                            }
                            else {
                                let valor_devolvido = this.#Pedido_Valores(str_objeto_valor[0], str_objeto_valor[1]);

                                str_objeto_valor = (isNumeric(valor_devolvido)) ? parseInt(valor_devolvido) : valor_devolvido;
                            }
                        }
                        catch (error) {
                            str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE DATA_ADDRESS \nTEXTO: ${str_objeto_valor} \nERRO: ${error.toString()}`;
                        }
                    }
                }
                else if (str_objeto_partes[0].includes("form_address")) {
                    // Envia todos os dados do formulário indicado: form_address((<ligação>;;<id do formulário>))
                    str_objeto_valor = this.#Devolve_texto_entre_limitadores(str_objeto_partes[0],limitadores.valores_inicial,limitadores.valores_final,false);

                    try {
                        str_objeto_valor = str_objeto_valor.split(limitadores.separador_valores);
                        const formulario_pedido = $("#" + String(str_objeto_valor[1]).replace("#","").trim());

                        if (typeof str_objeto_valor[0] !== "string" || str_objeto_valor[0].trim() == "") {
                            str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE FORM_ADDRESS: Valor de LINK inválido (${str_objeto_valor[0]})`;
                        }
                        else if (!formulario_pedido.is("form")) {
                            str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE FORM_ADDRESS: Valor de DATA inválida (${str_objeto_valor[1]})`;
                        }
                        else {
                            let valor_devolvido = this.#Pedido_Valores(str_objeto_valor[0].trim(), new FormData(formulario_pedido[0]));
                            str_objeto_valor = (isNumeric(valor_devolvido)) ? parseInt(valor_devolvido) : valor_devolvido;
                        }
                    }
                    catch (error) {
                        str_objeto_valor = `ERRO AO AVALIAR A PROPRIEDADE FORM_ADDRESS: ${error.toString()}`;
                    }
                }
            }
            else {
                // O texto original é usado para extrair conteúdos (ex: includes('ABC')), a versão em minúsculas para identificar a propriedade
                const propriedade_original = str_objeto_partes[1];
                const propriedade = /dh|datahoje/i.test(propriedade_original) ? propriedade_original : propriedade_original.toLowerCase();
                const por_nome = str_objeto_partes[0].includes("?");
                const nome = str_objeto_partes[0].replace("?","");
                const $campo = por_nome ? $("input[name*='" + nome + "']") : $("#" + nome);

                if (!por_nome && !constantes.nao_limpar_objectos.includes(propriedade) && typeof $campo.val() === "string") {
                    $campo.val($campo.val().trim())
                }

                const valor_campo = String($campo.val() ?? "");

                if (propriedade == "passe" || propriedade == "complexity") {
                    str_objeto_valor = constantes.passe_regex.test(valor_campo);
                }
                else if (propriedade.includes("contar") || propriedade.includes("count")) {
                    let conteudo = this.#Devolve_texto_entre_limitadores(propriedade_original,limitadores.includes_inicial,limitadores.includes_final)

                    if (typeof conteudo !== "string" || conteudo == "")
                        str_objeto_valor = -1;
                    else
                        str_objeto_valor = valor_campo.toLowerCase().split(conteudo.toLowerCase()).length - 1;
                }
                else if (propriedade == "val" || propriedade == "value")
                    str_objeto_valor = valor_campo;
                else if (propriedade == "valemail" || propriedade == "email"){
                    str_objeto_valor = constantes.email_regex.test(valor_campo);
                }
                else if (propriedade == "valurl" || propriedade == "url")
                    str_objeto_valor = constantes.url_regex.test(valor_campo);
                else if (propriedade == "valip" || propriedade == "ip")
                    str_objeto_valor = constantes.ip_regex.test(valor_campo)
                else if (propriedade == "valdata" || propriedade == "data")
                    // Atenção: devolve verdadeiro quando a data é INVÁLIDA
                    str_objeto_valor = this.#dataParaISOUniversal(valor_campo) == null;
                else if (/datahoje|dh/i.test(propriedade)) {
                    // Compara apenas as datas (sem horas); uma data inválida ou vazia devolve sempre falso
                    const data_hoje = this.#Data_Hora(new Date(), "00:00:00")
                    const data_objeto = this.#Data_Hora(valor_campo, "00:00:00")

                    str_objeto_valor = false
                    if (data_objeto != null) {
                        switch (propriedade.split("_")[1]) {
                            case "M":
                                str_objeto_valor = (data_objeto > data_hoje)
                                break
                            case "m":
                                str_objeto_valor = (data_objeto < data_hoje)
                                break
                            case "Mi":
                            case "MI":
                                str_objeto_valor = (data_objeto >= data_hoje)
                                break
                            case "mi":
                            case "mI":
                                str_objeto_valor = (data_objeto <= data_hoje)
                                break
                        }
                    }
                }
                else if (propriedade == "valcodpostal" || propriedade == "codpostal")
                    str_objeto_valor = constantes.codigo_postal_regex.test(valor_campo);
                else if (propriedade == "check" || propriedade == "checked")
                    str_objeto_valor = $campo.is(":checked");
                else if (propriedade == "length" || propriedade == "len") {
                    if (por_nome)
                        str_objeto_valor = $("input[name*='" + nome + "']:checked").length;
                    else
                        str_objeto_valor = valor_campo.length;
                }
                else if (propriedade.includes("isnumeric")) {
                    str_objeto_valor = isNumeric(valor_campo);
                }
                else if (propriedade.includes("includes")) {
                    if (propriedade.includes(limitadores.includes_inicial) && propriedade.includes(limitadores.includes_final)){
                        str_objeto_valor = this.#Devolve_texto_entre_limitadores(propriedade_original,limitadores.includes_inicial,limitadores.includes_final);
                        str_objeto_valor = valor_campo.includes(str_objeto_valor);
                    }
                    else
                        str_objeto_valor = "ERRO AO AVALIAR A PROPRIEDADE INCLUDES"
                }
                else if (propriedade.includes("indexof")) {
                    if (propriedade.includes(limitadores.includes_inicial) && propriedade.includes(limitadores.includes_final)){
                        str_objeto_valor = this.#Devolve_texto_entre_limitadores(propriedade_original,limitadores.includes_inicial,limitadores.includes_final);
                        str_objeto_valor = valor_campo.indexOf(str_objeto_valor) > -1
                    }
                    else
                        str_objeto_valor = "ERRO AO AVALIAR A PROPRIEDADE INDEXOF"
                }
                else
                    str_objeto_valor = "ERRO DE PROPRIEDADE NÃO IDENTIFICADO"
            }

            // Os textos são inseridos com escape, para que aspas ou código no valor não alterem a expressão
            if (typeof str_objeto_valor === 'string')
                str_objeto_valor = JSON.stringify(str_objeto_valor)

            txtstr = txtstr.substring(0, posicoes[0]) + str_objeto_valor + txtstr.substring(posicoes[1]);
            pos_procura = posicoes[0] + String(str_objeto_valor).length;
        }

        return txtstr;
    };

    // Efetua os testes iniciais
    #Testes_Iniciais(num_ou_nome_objeto = undefined) {
        if (this.erros.length !== 0) {
            console.log(`TESTES_INICIAIS: O objeto ${this.id} definido não é um formulário!`);
            return false;
        }

        if (num_ou_nome_objeto != undefined) {
            if (typeof num_ou_nome_objeto !== 'number' && typeof num_ou_nome_objeto !== 'string') {
                console.log(`TESTES_INICIAIS: O objeto ${num_ou_nome_objeto} definido não é do tipo correto (número ou texto)!`);
                return false;
            }

            if (this.#Verifica_Elemento_Existe(num_ou_nome_objeto) == -1) {
                console.log(`TESTES_INICIAIS: O objeto ${num_ou_nome_objeto} definido não existe no formulário!`);
                return false;
            }
        }

        return true;
    }

    // Colocar o estado da caixa segundo o valor_erro (verdadeiro ou falso)
    #Colocar_Estado_Caixa (pos_validacao_com_erro = undefined, valor_erro = undefined, colocar_focus_no_erro = true, mostrar_aviso = true) {
        if (pos_validacao_com_erro == undefined || !Number.isInteger(pos_validacao_com_erro)) {
            console.log(`COLOCAR_ESTADO_CAIXA: Não foi indicado o valor inteiro da posição do objeto, valor: ${pos_validacao_com_erro}`);
            return false;
        }

        if (valor_erro == undefined || typeof valor_erro != 'boolean') {
            console.log(`COLOCAR_ESTADO_CAIXA: Não foi indicado o valor booleano do erro do objeto, valor: ${valor_erro}`);
            return false;
        }

        let id_objeto =  this.validacoes[pos_validacao_com_erro].id.includes("?") ? this.validacoes[pos_validacao_com_erro].id.replace("?","") : this.validacoes[pos_validacao_com_erro].id;
        let objeto = "#" + id_objeto;
        let objeto_erro = "#" + constantes.prefixo_obj_erro + id_objeto;

        let classe_erro = constantes.classe_geral_invalido;
        let classe_valido = constantes.classe_geral_valido;

        if (!$(objeto).is("input,select,textarea")) {
            classe_erro = constantes.classe_obj_invalido;
            classe_valido = constantes.classe_obj_valido;
        }

        switch (this.tipo_aviso) {
            case tipos_aviso.aviso_tooltip:
                $(objeto).attr('data-bs-toggle','tooltip_c_formulario');
                break;
            case tipos_aviso.aviso_texto:
                let ultimo_objeto_div = $(objeto).closest("div");

                if ($(objeto).is(":checkbox") || this.validacoes[pos_validacao_com_erro].id.includes("?")) {
                    let objeto_anterior = ultimo_objeto_div.parent();

                    if (!objeto_anterior.find(objeto_erro).length) {
                        ultimo_objeto_div.after(`<div id="${ objeto_erro.replace("#","") }" class="${constantes.classe_erro} ${constantes.classe_esconde}" aria-live="polite"></div>`);
                    }
                }
                else {
                    if (!ultimo_objeto_div.find(objeto_erro).length) {
                        ultimo_objeto_div.append(`<div id="${ objeto_erro.replace("#","") }" class="${constantes.classe_erro} ${constantes.classe_esconde}" aria-live="polite"></div>`);
                    }
                }
                break;
            case tipos_aviso.aviso_toast:
                break;
        }

        if (!valor_erro) {
            $(objeto).removeClass(classe_erro + " " + constantes.classe_obj_invalido_cbd).removeAttr("aria-invalid");
            $(objeto).addClass(classe_valido + " " + constantes.classe_obj_valido_cbd);

            switch (this.tipo_aviso) {
                case tipos_aviso.aviso_tooltip:
                    $(objeto).apaga_tooltip_c_formulario();
                    break;
                case tipos_aviso.aviso_texto:
                    if ($(objeto_erro) !== undefined && !$(objeto_erro).hasClass(constantes.classe_esconde)) 
                        $(objeto_erro).addClass(constantes.classe_esconde).text("");
                    break;
                case tipos_aviso.aviso_toast:
                    break;            
            }            
        }
        else {
            if (mostrar_aviso && (typeof c_aviso === "undefined" || c_aviso.quantidade() == 0)) this.#mostra_mensagem_c_formulario("formulario",0);
            $(objeto).removeClass(classe_valido + " " + constantes.classe_obj_valido_cbd);
            $(objeto).addClass(classe_erro + " " + constantes.classe_obj_invalido_cbd).attr("aria-invalid", "true");

            switch (this.tipo_aviso) {
                case tipos_aviso.aviso_tooltip:
                    $(objeto).atualiza_tooltip_c_formulario(this.validacoes[pos_validacao_com_erro].texto_erro);
                    break;
                case tipos_aviso.aviso_texto:
                    if ($(objeto_erro) !== undefined) {
                        $(objeto_erro).removeClass(constantes.classe_esconde);
                        $(objeto_erro).html(this.validacoes[pos_validacao_com_erro].texto_erro);

                        const descritores = ($(objeto).attr("aria-describedby") || "").split(" ").filter(Boolean);
                        if (!descritores.includes(objeto_erro.replace("#","")))
                            $(objeto).attr("aria-describedby", [...descritores, objeto_erro.replace("#","")].join(" "));
                    }
                    break;
                case tipos_aviso.aviso_toast:
                    break;            
            }

            if (colocar_focus_no_erro && $(objeto).length) {
                $(objeto)[0].scrollIntoView({ behavior: "smooth", block: "center" });
                $(objeto)[0].focus({ preventScroll: true });
            }
        }
    }

    // Testa todas as validações existentes na lista de validações (ou só as do objeto indicado)
    // Devolve verdadeiro se existirem erros ou se não for possível validar, caso contrário falso
    Testa_Validacoes(num_ou_nome_objeto = undefined, coloca_focus_erro = true) {
        if (!this.#Testes_Iniciais(num_ou_nome_objeto)) return true;

        this.#RecolherElementos();
        num_ou_nome_objeto = this.#Normaliza_Id(num_ou_nome_objeto);
        let posicoes_validacoes_testar = this.#Verifica_Elemento_Validacao_Existe(num_ou_nome_objeto);

        if (posicoes_validacoes_testar == -1) return false;

        let existe_erros = false;

        for (const i of posicoes_validacoes_testar) {
            let pos_objeto =this.#Posicao_Elemento_Objetos_Formulario(this.validacoes[i].id);

            if (pos_objeto == -1) continue;

            if (this.formulario.objetos[pos_objeto].testado || this.formulario.objetos[pos_objeto].escondido) continue;

            // comparações
            let txtcomparacao = this.#Texto_Final(this.validacoes[i].comparacao);
            // console.warn(txtcomparacao)
            if (txtcomparacao == "") {
                console.log("TESTA_VALIDACOES: (" + this.validacoes[i].id + ") - Expressão de comparação vazia: " + txtcomparacao);
                continue;
            }

            let resultado = -1;

            try {
                resultado = eval?.(txtcomparacao);
                // console.log("Comparação: " + txtcomparacao + " - Resultado: " + resultado);
                if (this.validacoes[i].mostra_resultado)
                    alert(`Comparação: ${txtcomparacao} - Resultado: ${resultado}`);
            } catch (e) {
                console.error("TESTA_VALIDACOES: (" + this.validacoes[i].id + ") - " + e);
            }

            if (typeof resultado != "boolean") {
                console.error("TESTA_VALIDACOES: (" + num_ou_nome_objeto + ") - Erro ao executar a expressão: " + txtcomparacao);
                continue;
            }
            
            // O aviso geral só aparece ao validar o formulário completo (não ao validar campo a campo)
            this.#Colocar_Estado_Caixa(i, resultado, coloca_focus_erro, num_ou_nome_objeto === undefined);

            if (resultado) {
                this.formulario.objetos[pos_objeto].testado = true;
                
                if (!existe_erros) {
                    existe_erros = true;
                    coloca_focus_erro = false;
                }
            }
        }

        return existe_erros;
    }

    // Limpar as validações do formulário
    Limpar_Validacoes(reset_formulario = true) {
        this.#Limpar_Caixa_Erro();
        
        if (reset_formulario)
            this.formulario.trigger('reset');
        else
            this.formulario.find("input, textarea")
                .not(":checkbox, :radio, [type=file], [type=password], [type=hidden], [type=button], [type=submit], [type=reset]")
                .each(function () { this.value = this.value.trim(); });
    }
    
    // Limpa o estado (válido/inválido) e a mensagem de erro de uma validação ou, se não indicada, de todas
    #Limpar_Caixa_Erro(pos_validacao_com_erro = undefined) {    
        if (pos_validacao_com_erro != undefined && !Number.isInteger(pos_validacao_com_erro)) {
            console.log(`LIMPAR_CAIXA_ERRO: Não foi indicado o valor inteiro da posição do objeto, valor: ${pos_validacao_com_erro}`);
            return false;
        }

        const posicoes = (pos_validacao_com_erro === undefined) ? this.validacoes.map((_, i) => i) : [pos_validacao_com_erro];
        const classes = [constantes.classe_geral_valido, constantes.classe_geral_invalido,
                         constantes.classe_obj_valido, constantes.classe_obj_invalido,
                         constantes.classe_obj_valido_cbd, constantes.classe_obj_invalido_cbd].join(" ");

        for (const i of posicoes) {
            if (this.validacoes[i] === undefined) continue;

            let id_objeto = this.validacoes[i].id.replace("?","");

            $("#" + id_objeto).removeClass(classes).removeAttr("aria-invalid").apaga_tooltip_c_formulario();
            $("#" + constantes.prefixo_obj_erro + id_objeto).addClass(constantes.classe_esconde).text("");
        }
    }    
}
