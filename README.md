# c_formulario

Módulo JavaScript para criar formulários com validação dinâmica. <br>
Última versão: **1.9** <br>
Atualizada em **21/10/2026**

Desenvolvido para ser código aberto, por forma a qualquer pessoa poder acrescentar ou alterar funcionalidades. <br>
Caso detetem algum problema, enviem email para emes3soft@gmail.com com a descrição o mais detalhada possível. <br>

As alterações de cada versão estão em [CHANGELOG.md](CHANGELOG.md).

# Ficheiros

```
c_formulario/
├── c_formulario.js     módulo de validação
├── c_formulario.css    estilos dos erros e dos tooltips
├── c_formulario.json   mensagens do módulo
└── c_aviso.js          mensagens de aviso (toasts)  (NEW)
exemplo/                exemplo completo (index.html + index.js)
testes/                 página de testes automáticos
```

O `b5toast.js` e o `atributos.js` deixaram de ser necessários. **(UPDATE)**

# Outros módulos necessários

- jQuery: https://jquery.com/download/
- Bootstrap 5 (CSS e JS; o JS só é necessário para o modo de erros em tooltip): https://getbootstrap.com/docs/5.3/getting-started/download/

O `c_aviso.js` vem incluído e não depende de outras librarias (já não é necessário o Font Awesome). **(NEW)**

# Instalação

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="c_formulario/c_formulario.css">

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="c_formulario/c_aviso.js"></script>
<script src="c_formulario/c_formulario.js"></script>
```

- O `c_aviso.js` tem de ser carregado **antes** do `c_formulario.js`.
- O `c_formulario.json` tem de estar na mesma pasta do `c_formulario.js` (é encontrado automaticamente).
- As páginas têm de ser abertas através de um servidor (ex: `python3 -m http.server`), pois o ficheiro JSON não é lido a partir de `file://`.

# Associar formulário

```js
const f_Login = new c_formulario("frmLogin");
// ou, com um ficheiro de mensagens personalizado (as entradas deste substituem as do c_formulario.json)
const f_Login = new c_formulario("frmLogin", "mensagens/minhas_mensagens.json");
```

- O id pode ser indicado com ou sem `#`.
- Modo de apresentação dos erros: **(NEW)**
  - `f_Login.tipo_aviso = tipos_aviso.aviso_texto;` (pré-definido) texto por baixo do campo
  - `f_Login.tipo_aviso = tipos_aviso.aviso_tooltip;` tooltip do Bootstrap

# Associar validações

```js
f_Login.Adiciona_Validacoes([<id do objeto>, <condição>, <texto do erro>]);
```

- **id do objeto**: id do objeto html onde é colocado o erro
  - pode ser o número do atributo `formulario-numobj` do objeto (ex: `<input id="txtEmail" formulario-numobj="10">` e `Adiciona_Validacoes([10, ...])`) **(UPDATE)**
  - para um grupo de objetos (radios ou checkboxes) coloque o carater `?` (ver [Grupos de objetos](#grupos-de-objetos))
- **condição**: expressão JavaScript que deve dar **verdadeiro quando existe erro**
  - os objetos html são referidos pelo seu id entre `«` e `»`, seguido de `.` e da propriedade: `«txtUtilizador.val»`
  - pode usar qualquer operador de comparação (`<`, `>`, `==`, `<=`, `>=`, `!=`, `!==`, `===`, `!`) e os operadores `||` e `&&` para testar vários objetos na mesma validação
  - não existe limite de objetos `«...»` por expressão **(UPDATE)**
  - os valores dos campos são inseridos de forma segura: aspas ou código escritos pelo utilizador não alteram a expressão **(UPDATE)**
- **texto do erro**: aparece quando a condição é verdadeira (pode conter HTML)

## Propriedades disponíveis

| Propriedade | Devolve | Exemplo (verdadeiro = erro) |
|---|---|---|
| `val`, `value` | o valor (texto) | `"«txtUtilizador.val» == ''"` |
| `len`, `length` | o número de carateres | `"«txtPalavraPasse.len» < 10"` |
| `passe`, `complexity` | `true` se tiver 10 a 25 carateres, maiúsculas, minúsculas, números e símbolos, sem espaços | `"!«txtPalavraPasse.passe»"` |
| `email`, `valemail` | `true` se for um email válido | `"!«txtEmail.email»"` |
| `url`, `valurl` | `true` se for um url válido | `"!«txtSite.url»"` |
| `ip`, `valip` | `true` se for um IPv4 válido | `"!«txtIP.ip»"` |
| `codpostal`, `valcodpostal` | `true` se tiver o formato `0000-000` **(NEW)** | `"!«txtCodPostal.codpostal»"` |
| `isnumeric` | `true` se for numérico | `"!«txtNIF.isnumeric»"` |
| `check`, `checked` | `true` se a caixa estiver marcada | `"!«chkPolitica.checked»"` |
| `includes('texto')` | `true` se contiver o texto (distingue maiúsculas) | `"«txtUtilizador.includes(';')»"` |
| `indexof('texto')` | `true` se contiver o texto (igual ao `includes`) **(UPDATE)** | `"«txtUtilizador.indexof(',')»"` |
| `contar('texto')`, `count('texto')` | número de vezes que o texto aparece (ignora maiúsculas) **(NEW)** | `"«txtObs.contar('http')» > 2"` |
| `data`, `valdata` | `true` se a data for **inválida** **(NEW)** | `"«txtData.data»"` |
| `dh_M`, `dh_m`, `dh_MI`, `dh_mi` | compara a data com hoje: maior, menor, maior ou igual, menor ou igual (data vazia ou inválida devolve `false`) **(NEW)** | `"«txtEvento.dh_MI» == false"` |
| `data_address((...))`, `form_address((...))` | valor devolvido pelo servidor (ver abaixo) | |

Aceita datas nos formatos `AAAA-MM-DD`, `DD-MM-AAAA`, `MM-DD-AAAA` (e com ano de 2 dígitos), com `-`, `/` ou `.` como separador. <br>
Antes de cada teste é retirado o espaço no início e no fim dos campos (exceto nas propriedades `passe`, `complexity`, `check` e `checked`).

## Grupos de objetos

Para validar um grupo de radios ou checkboxes, coloque-os dentro de um contentor cujo id seja o `name` dos objetos e use o carater `?`:

```html
<div id="genero">
    <input type="radio" name="genero" id="genero_f" value="F"> Feminino
    <input type="radio" name="genero" id="genero_m" value="M"> Masculino
</div>
```

```js
f.Adiciona_Validacoes(["genero?", "«genero?.len» == 0", "Escolha uma opção"]);
```

Num grupo, o `len` devolve o número de objetos marcados e o `checked` devolve `true` se algum estiver marcado.

## Pedidos ao servidor (data_address e form_address)

Pode pedir dados a uma linguagem de servidor (PHP, Python, ...) indicando a ligação e os dados a enviar (em formato de dicionário JSON):

```js
f_Login.Adiciona_Validacoes(["txtPasse",
    `«data_address((/pedidos/dados.php;;{"txtUtil": «txtUtil.val», "txtPasse": «txtPasse.val»}))» != 1`,
    "* Utilizador ou palavra-passe inválidos"]);
```

- Estrutura: `data_address((<ligação>;;<dados>))`
- Utilize a acentuação grave (`` ` ``) para delimitar a condição, pois os dados usam aspas (`"`).
- Os dados são enviados por POST; se a resposta for numérica é convertida em número.

Também pode enviar todos os dados de um formulário, indicando a ligação e o id do formulário (form_address):

```js
f_Login.Adiciona_Validacoes(["txtPasse", `«form_address((/pedidos/dados.php;;frmEntrada))» != 1`, "* Utilizador ou palavra-passe inválidos"]);
```

- Estrutura: `form_address((<ligação>;;<id do formulário>))`
- Os campos são enviados por POST com o seu atributo `name` (como numa submissão normal do formulário). **(UPDATE)**

## Mensagem de erro em local próprio

Não é necessário criar o `<div>` do erro, pois é criado automaticamente. <br>
Contudo, pode criá-lo para escolher onde o erro aparece:
- o id deve ser `erro_<id do objeto>`
- deve ter as classes `esconde_c_formulario` e `erro_c_formulario`

```html
<input id="txtUtilizador" type="text">
<div id="erro_txtUtilizador" class="esconde_c_formulario erro_c_formulario"></div>
```

# Testar as validações

```js
$("#frmLogin").on("submit", function (e) {
    if (f_Login.Testa_Validacoes())   // verdadeiro = existem erros
        e.preventDefault();
});
```

| Função | Descrição |
|---|---|
| `Testa_Validacoes()` | testa todas as validações; devolve `true` se existirem erros ou se não for possível validar **(UPDATE)** |
| `Testa_Validacoes(id, focar = true)` | testa só as validações de um objeto (ex: validação enquanto o utilizador escreve) **(UPDATE)** |
| `Limpar_Validacoes(reset = true)` | limpa os erros; com `reset` limpa também o formulário, sem `reset` só retira os espaços no início e no fim dos campos |

- O foco é colocado no primeiro objeto com erro, centrando-o no ecrã.
- Ao testar todas as validações aparece uma mensagem de aviso geral ("Resolva os erros"); ao testar um só objeto, não.
- Os objetos com a classe `esconde_c_formulario` ou desativados (`disabled`) não são validados. **(UPDATE)**
- Os objetos com erro recebem `aria-invalid` e ficam ligados à mensagem de erro (`aria-describedby`), para os leitores de ecrã. **(NEW)**

Validação enquanto o utilizador escreve, depois da primeira submissão:

```js
let ja_submeteu = false;
$("#frmLogin").on("submit", function (e) { ja_submeteu = true; /* ... */ });
$("#frmLogin").on("input change", "input, select, textarea", function () {
    if (ja_submeteu) f_Login.Testa_Validacoes(this.id, false);
});
```

# Lógica das validações

Quando existe mais do que uma validação para um mesmo objeto, estas são testadas pela ordem em que foram inseridas. <br>
Imagine-se 3 validações para um objeto:
- se a primeira der erro, as outras duas são ignoradas, aparecendo o texto do erro da primeira;
- se só a segunda der erro, a terceira é ignorada, aparecendo o texto do erro da segunda;
- se as três não derem erro, o objeto é validado e o erro desaparece.

# Mensagens de aviso (c_aviso) **(NEW)**

O `c_aviso.js` substitui o `b5toast.js`. Pode também ser usado de forma independente:

```js
c_aviso.sucesso("Os dados foram gravados.", "Gravado");
c_aviso.erro("Não foi possível gravar.");
c_aviso.aviso("A sessão expira em 5 minutos.", "Atenção");
c_aviso.informacao("Existe uma nova versão disponível.");
c_aviso.mostrar("primary", "Só fecha no botão.", "Fixo", 0);                // tempo 0 = não fecha sozinho
c_aviso.mostrar("danger", "Resolva os erros", "", 4000, { codigo: "C_F - E0" });
```

- Tipos: `success`, `danger`, `warning`, `info`, `primary`, `secondary`, `dark` (ou `sucesso`, `erro`, `aviso`, `informacao`, `primario`, `secundario`, `escuro`).
- Barra de progresso, pausa ao passar o rato, modo escuro (segue o `data-bs-theme` do Bootstrap ou o tema do sistema) e adaptado a telemóveis.
- Configuração: `c_aviso.posicao` (`baixo-direita`, `baixo-esquerda`, `baixo-centro`, `topo-direita`, `topo-esquerda`, `topo-centro`), `c_aviso.tempo_de_espera_pre_definido` e `c_aviso.maximo_visiveis`.
- Outras funções: `c_aviso.fechar(elemento)`, `c_aviso.fechar_todos()`, `c_aviso.quantidade()`.
- O texto é inserido como texto simples; para HTML use a opção `{ html: true }`.

# Exemplo completo

Ficheiros disponíveis na pasta **[exemplo](exemplo)**: formulário de inscrição com vários campos por linha, grupos de objetos, campos condicionais, confirmação de palavra-passe, datas, validação enquanto o utilizador escreve e alternância entre erros em texto e em tooltip.

A pasta **[testes](testes)** contém uma página com testes automáticos do módulo.

# Licença

[GPL-3.0](LICENSE)
