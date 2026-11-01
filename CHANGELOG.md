# Alterações

## 2.0 (01/11/2026)

### Novo
- Analisador próprio para as condições: deixa de ser usado o `eval`, pelo que só são aceites marcadores `«...»`, textos, números, operadores de comparação e lógicos, `+ - * / %`, parênteses e algumas funções de texto (`charAt`, `toLowerCase`, `toUpperCase`, `trim`, `includes`, `startsWith`, `endsWith`, `indexOf`, `substring`, `slice`, `.length`).
- Tooltip de erro do próprio módulo (modo `aviso_tooltip`), por cima do campo, ao passar o rato ou com o foco.
- As mensagens pré-definidas estão também no `c_formulario.js`: as páginas funcionam abertas diretamente do disco (`file://`).
- Página de testes com mais testes (grupos de objetos, código rejeitado nas condições) e execução automática com `testes/index.html?auto`.

### Corrigido
- `data_address`: os marcadores dentro dos dados (ex: `{"email": «email.val»}`) são sempre substituídos antes do pedido.
- Os grupos (`nome?`) passam a procurar os objetos pelo `name` exato (antes bastava o `name` conter o texto).

### Alterado
- Deixa de depender do jQuery e do JS do Bootstrap (o CSS do Bootstrap continua a dar o aspeto dos campos).
- O exemplo passa a usar JavaScript sem jQuery e o código promocional mostra que é opcional.

## 1.9 (21/10/2026)

### Novo
- `c_aviso.js`: novas mensagens de aviso (toasts) que substituem o `b5toast.js`. Não dependem de outras librarias (ícones em SVG, deixa de ser necessário o Font Awesome), com barra de progresso, pausa ao passar o rato, modo escuro, posição configurável e adaptação a telemóveis.
- Propriedades `codpostal`, `contar('texto')`, `data` e comparação de datas com o dia de hoje (`dh_M`, `dh_m`, `dh_MI`, `dh_mi`); a propriedade `isnumeric` passa a estar documentada.
- Acessibilidade: `aria-invalid`, `aria-describedby` e `aria-live` nos objetos e mensagens de erro.
- Novo exemplo completo (vários campos por linha, grupos, campos condicionais, validação enquanto se escreve, erros em texto ou tooltip) e página de testes automáticos.

### Corrigido
- A validação de um só objeto (`Testa_Validacoes(id)`) não funcionava; agora também aceita o número do `formulario-numobj`.
- Um objeto com erro não era revalidado, pelo que o erro não desaparecia depois de corrigido.
- Aspas escritas num campo faziam com que a validação fosse ignorada (e permitiam executar código).
- Só eram substituídos os 3 primeiros objetos `«...»` de cada expressão.
- Objetos escondidos depois de criar o formulário continuavam a ser validados; os objetos desativados (`disabled`) também deixam de ser validados.
- `includes('...')` e `indexof('...')` passavam o texto a procurar para minúsculas.
- Datas: uma data vazia interrompia a validação, `dh_MI` não aceitava o dia de hoje e `dh_mi` funcionava como "maior".
- Modo tooltip: dava erro e não removia o tooltip quando o objeto ficava válido; o tooltip aparece agora por cima do objeto.
- `Limpar_Validacoes(false)` dava erro; a limpeza passa a remover todas as classes de estado.
- O ficheiro de mensagens personalizado não era utilizado.
- O email não aceitava domínios com mais de 3 letras (ex: `.info`).
- `Apaga_Erros`, `Adiciona_Erros` e a numeração das validações.
- `form_address`: os dados do formulário não eram lidos pelo servidor (ex: `$_POST` em PHP vazio); passam a ser enviados como `FormData`.

### Alterado
- `Testa_Validacoes()` devolve `true` (existem erros) quando não é possível validar (ex: objeto inexistente), para impedir a submissão do formulário.
- O ficheiro JSON das mensagens é lido uma única vez e de forma assíncrona (antes eram feitos vários pedidos síncronos por cada mensagem).
- O aviso geral "Resolva os erros" só aparece ao testar todas as validações e não se repete.
- O foco no primeiro erro centra o objeto no ecrã.
- Aspeto das mensagens de erro igual ao do Bootstrap (`invalid-feedback`), adaptado ao modo escuro.
- Removido código sem utilização.

### Removido
- `b5toast.js` (substituído pelo `c_aviso.js`) e `atributos.js`.
