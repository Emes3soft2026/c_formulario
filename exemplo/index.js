// Exemplo da aplicação do C_FORMULÁRIO - Validador de formulários

const f = new c_formulario("inscricao");

// Cada validação: [id do campo, expressão que dá VERDADEIRO quando há erro, mensagem de erro]
f.Adiciona_Validacoes(["nome",        "«nome.len» < 2", "Indique o nome (mínimo 2 letras)"]);
f.Adiciona_Validacoes(["apelido",     "«apelido.len» < 2", "Indique o apelido"]);
f.Adiciona_Validacoes(["nascimento",  "«nascimento.dh_m» == false", "Indique uma data de nascimento válida (anterior a hoje)"]);
f.Adiciona_Validacoes(["genero?",     "«genero?.len» == 0", "Escolha uma opção"]);
f.Adiciona_Validacoes(["email",       "«email.email» == false", "Indique um email válido"]);
f.Adiciona_Validacoes(["telemovel",   "!«telemovel.isnumeric» || «telemovel.len» != 9 || «telemovel.val».charAt(0) != '9'", "Número com 9 dígitos, a começar por 9"]);
f.Adiciona_Validacoes(["codpostal",   "«codpostal.codpostal» == false", "Formato 0000-000"]);
f.Adiciona_Validacoes(["distrito",    "«distrito.val» == ''", "Escolha o distrito"]);
f.Adiciona_Validacoes(["website",     "«website.len» > 0 && !«website.url»", "Endereço inválido"]);
f.Adiciona_Validacoes(["data_evento", "«data_evento.dh_MI» == false", "A data tem de ser hoje ou futura"]);
f.Adiciona_Validacoes(["bilhete",     "«bilhete.val» == ''", "Escolha o bilhete"]);
f.Adiciona_Validacoes(["pessoas",     "!«pessoas.isnumeric» || «pessoas.val» < 1 || «pessoas.val» > 10", "Entre 1 e 10"]);
f.Adiciona_Validacoes(["codigo",      "«codigo.len» > 0 && «codigo.contar('PROMO')» == 0", "Código inválido"]);
f.Adiciona_Validacoes(["interesses?", "«interesses?.len» < 2", "Escolha pelo menos 2 interesses"]);
f.Adiciona_Validacoes(["passe",       "«passe.passe» == false", "A palavra-passe não cumpre os requisitos"]);
f.Adiciona_Validacoes(["confirmar",   "«confirmar.len» == 0 || «confirmar.val» != «passe.val»", "As palavras-passe não coincidem"]);
f.Adiciona_Validacoes(["nif",         "!«nif.isnumeric» || «nif.len» != 9", "O NIF tem 9 dígitos"]);
f.Adiciona_Validacoes(["empresa",     "«empresa.len» < 2", "Indique o nome da empresa"]);
f.Adiciona_Validacoes(["observacoes", "«observacoes.len» > 200 || «observacoes.contar('http')» > 2", "Máximo de 200 caracteres e 2 links"]);
f.Adiciona_Validacoes(["termos",      "«termos.checked» == false", "Tem de aceitar os termos"]);

const ids_validados = new Set(f.validacoes.map(v => v.id));
let ja_submeteu = false;

// Submissão do formulário (botão "Inscrever" ou tecla Enter num campo)
$("#inscricao").on("submit", function (e) {
    // Impede o envio normal do formulário (que recarregaria a página); neste exemplo os dados são só mostrados
    e.preventDefault();

    // A partir daqui, os campos passam a ser revalidados enquanto o utilizador escreve (ver o evento "input change" abaixo)
    ja_submeteu = true;

    // Testa todas as validações: devolve verdadeiro se houver erros.
    // Nesse caso, os erros já ficam assinalados nos campos, o foco vai para o primeiro erro
    // e aparece o aviso "Resolva os erros"; por isso basta sair da função.
    if (f.Testa_Validacoes()) return;

    // Sem erros: recolhe os dados do formulário num objeto { name: valor }
    const dados = {};
    // FormData lê todos os campos com atributo "name" (como numa submissão normal);
    // os campos desativados e as caixas não marcadas não são incluídos
    new FormData(this).forEach((valor, chave) => {
        // As palavras-passe não são mostradas
        if (chave === "passe" || chave === "confirmar") valor = "••••••";
        // Campos com o mesmo name (ex: várias checkboxes "interesses") são juntos numa lista
        dados[chave] = dados[chave] !== undefined ? [].concat(dados[chave], valor) : valor;
    });

    // Mostra os dados em JSON formatado (com 2 espaços) no cartão "Dados enviados" e torna-o visível.
    // Numa situação real, seria aqui que os dados seriam enviados para o servidor (ex: $.post(...))
    $("#resultado_dados").text(JSON.stringify(dados, null, 2));
    $("#resultado").removeClass("d-none");

    // Aviso de sucesso (c_aviso.js)
    c_aviso.sucesso("A inscrição foi registada.", "Inscrição concluída");
});

// Depois da primeira tentativa, cada campo é revalidado enquanto o utilizador corrige
$("#inscricao").on("input change", "input, select, textarea", function () {
    if (!ja_submeteu) return;
    const alvo = $(this).is(":radio") || this.name === "interesses" ? this.name + "?" : this.id;
    if (ids_validados.has(alvo)) f.Testa_Validacoes(alvo, false);
});

// Campos condicionais
$("#faturar_empresa").on("change", function () {
    $(".campos-empresa").toggleClass("d-none", !this.checked).find("input").prop("disabled", !this.checked);
});

$("#limpar").on("click", function () {
    ja_submeteu = false;
    f.Limpar_Validacoes(true);
    $("#faturar_empresa").trigger("change");
    $("#resultado").addClass("d-none");
});

$("#modo_aviso").on("change", function () {
    f.Limpar_Validacoes(false);
    f.tipo_aviso = this.value === "tooltip" ? tipos_aviso.aviso_tooltip : tipos_aviso.aviso_texto;
    if (ja_submeteu) f.Testa_Validacoes(undefined, false);
});

$("#tema").on("click", function () {
    const html = document.documentElement;
    html.dataset.bsTheme = html.dataset.bsTheme === "dark" ? "light" : "dark";
});
