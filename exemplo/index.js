// Exemplo da aplicação do C_FORMULÁRIO - Validador de formulários (sem jQuery)

const f = new c_formulario("inscricao");

// Cada validação: [id do campo, expressão que dá VERDADEIRO quando há erro, mensagem de erro]
f.Adiciona_Validacoes(["nome",        "«nome.len» < 2", "Indique o nome (mínimo 2 letras)"]);
f.Adiciona_Validacoes(["apelido",     "«apelido.len» < 2", "Indique o apelido"]);
f.Adiciona_Validacoes(["nascimento",  "«nascimento.dh_m» == false", "Indique uma data de nascimento válida (anterior a hoje)"]);
f.Adiciona_Validacoes(["genero?",     "«genero?.len» == 0", "Escolha uma opção"]);
f.Adiciona_Validacoes(["email",       "«email.email» == false", "Indique um email válido"]);
// Exemplo de pedido ao servidor (ex: saber se o email já existe na base de dados).
// Descomente e indique a ligação do seu servidor; deve devolver 1 se o email já existir.
// f.Adiciona_Validacoes(["email", `«data_address((/pedidos/existe_email.php;;{"email": «email.val»}))» == 1`, "Este email já está registado"]);
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

const formulario = document.getElementById("inscricao");
const ids_validados = new Set(f.validacoes.map(v => v.id));
let ja_submeteu = false;

// Submissão do formulário (botão "Inscrever" ou tecla Enter num campo)
formulario.addEventListener("submit", function (e) {
    // Neste exemplo os dados são só mostrados (não recarrega a página)
    e.preventDefault();
    // A partir daqui, os campos passam a ser revalidados enquanto o utilizador escreve
    ja_submeteu = true;

    // Verdadeiro = existem erros: já ficam assinalados, com o foco no primeiro e o aviso "Resolva os erros"
    if (f.Testa_Validacoes()) return;

    // Sem erros: recolhe os dados { name: valor } (os campos desativados e as caixas não marcadas não entram)
    const dados = {};
    new FormData(this).forEach((valor, chave) => {
        if (chave === "passe" || chave === "confirmar") valor = "••••••";
        dados[chave] = dados[chave] !== undefined ? [].concat(dados[chave], valor) : valor;
    });
    document.getElementById("resultado_dados").textContent = JSON.stringify(dados, null, 2);
    document.getElementById("resultado").classList.remove("d-none");

    c_aviso.sucesso("A inscrição foi registada.", "Inscrição concluída");
});

// Depois da primeira tentativa, cada campo é revalidado enquanto o utilizador corrige
function revalida(e) {
    if (!ja_submeteu || !e.target.matches("input, select, textarea")) return;
    const el = e.target;
    const alvo = el.type === "radio" || el.name === "interesses" ? el.name + "?" : el.id;
    if (ids_validados.has(alvo)) f.Testa_Validacoes(alvo, false);
}
formulario.addEventListener("input", revalida);
formulario.addEventListener("change", revalida);

// Campos condicionais: quando escondidos ficam desativados e não são validados
const faturar = document.getElementById("faturar_empresa");
function campos_empresa() {
    document.querySelectorAll(".campos-empresa").forEach(div => {
        div.classList.toggle("d-none", !faturar.checked);
        div.querySelectorAll("input").forEach(i => { i.disabled = !faturar.checked; });
    });
}
faturar.addEventListener("change", campos_empresa);

document.getElementById("limpar").addEventListener("click", function () {
    ja_submeteu = false;
    f.Limpar_Validacoes(true);
    campos_empresa();
    document.getElementById("resultado").classList.add("d-none");
});

document.getElementById("modo_aviso").addEventListener("change", function () {
    f.Limpar_Validacoes(false);
    f.tipo_aviso = this.value === "tooltip" ? tipos_aviso.aviso_tooltip : tipos_aviso.aviso_texto;
    if (ja_submeteu) f.Testa_Validacoes(undefined, false);
});

document.getElementById("tema").addEventListener("click", function () {
    const html = document.documentElement;
    html.dataset.bsTheme = html.dataset.bsTheme === "dark" ? "light" : "dark";
});
