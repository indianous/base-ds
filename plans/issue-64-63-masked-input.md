# Plano: entrada com máscara (formatos brasileiros e cartão de crédito) (issues #64 e #63)

## Contexto

As duas issues vêm do `ecommerce-frontend` e pedem a mesma coisa em lugares diferentes. Ambas pedem
"a mesma API":

- **#64**: máscaras de CPF, CNPJ, CEP, telefone e data no `Input`. O campo mostra o valor formatado
  e entrega o valor cru, aceita valor inicial formatado ou cru, alterna o telefone entre 8 e 9
  dígitos, usa o `inputMode` certo, não faz o cursor pular, aceita colar e funciona com `FormField`;
- **#63**: entrada de cartão para o checkout do PagBank, sem iframe e sem dependência de gateway. O
  número tem grupos de 4 (Amex `4-6-5`) e a bandeira detectada pelo prefixo e anunciada. A validade
  é `MM/AA` (aceitando colar `MM/AAAA`). O código de segurança tem 3 ou 4 dígitos conforme a
  bandeira e não pode aparecer na impressão. Nada é guardado nem registrado.

Por isso, um plano único: primeiro o mecanismo de máscara e os formatos brasileiros (lote 1, #64),
depois o cartão sobre o mesmo mecanismo (lote 2, #63).

### O CNPJ agora tem letras

Pela [Instrução Normativa RFB nº 2.229/2024][cnpj-rfb], o CNPJ passa a ter **letras e números nas 12
primeiras posições**, com os 2 dígitos verificadores numéricos, e a liberação é gradual desde julho
de 2026. O formato numérico continua válido. A issue não considera isso. Uma máscara só de dígitos
recusaria CNPJs novos, e o `inputMode="numeric"` esconderia as letras no celular. No plano:

- a máscara de CNPJ aceita letras e dígitos nas 12 primeiras posições (transformadas em maiúsculas)
  e só dígitos nas 2 últimas;
- o CNPJ usa `inputMode="text"`;
- o valor "cru" do CNPJ é alfanumérico (`12ABC34501DE35`), e não só de dígitos.

## Decisões

- **Componente à parte, `MaskedInput`, em vez de uma prop no `Input`.** Desde a v0.4.11, cada
  componente vira um arquivo próprio no bundle. Uma prop `mask` no `Input` levaria o mecanismo de
  máscara a todo app que usa `Input`. O `MaskedInput` renderiza o `Input` e repassa todas as props
  dele (`size`, `state`, `aria-*`), então funciona igual com o `FormField`.
- **Mecanismo próprio, sem dependência.** Todas as máscaras pedidas são de "posições": `0` é um
  dígito, `A` é uma letra, `*` é letra ou dígito, e o resto é literal. Algumas escolhem o padrão
  conforme o valor (telefone com 8 ou 9 dígitos, cartão por bandeira). Isso cabe em poucas centenas
  de linhas testáveis. Bibliotecas como `react-imask` e `react-number-format` resolvem casos muito
  mais amplos, mas trazem peso e uma API própria para o app aprender.
- **O valor cru vem por uma prop nova, `onValueChange(raw, formatted)`.** A issue sugere
  `onChange={(e) => setCpf(e.target.value)}` com o valor cru, mas o `e.target.value` é o valor do
  campo na tela, que está formatado, e o DOM não deixa trocar isso. O `onChange` nativo continua
  igual (com o valor formatado), para não quebrar nada nem surpreender quem já usa eventos.

```tsx
<FormField label="CPF" id="cpf">
  <MaskedInput id="cpf" mask="cpf" value={cpf} onValueChange={(raw) => setCpf(raw)} />
</FormField>
```

## Lote 1: `MaskedInput` e formatos brasileiros (#64)

### Máscaras prontas

| `mask`  | formato                                 | cru           | `inputMode` | `autoComplete` |
| ------- | --------------------------------------- | ------------- | ----------- | -------------- |
| `cpf`   | `000.000.000-00`                        | 11 dígitos    | `numeric`   | —              |
| `cnpj`  | `**.***.***/****-00` (letras e dígitos) | 14 posições   | `text`      | —              |
| `cep`   | `00000-000`                             | 8 dígitos     | `numeric`   | `postal-code`  |
| `phone` | `(00) 0000-0000` ou `(00) 00000-0000`   | 10–11 dígitos | `tel`       | `tel-national` |
| `date`  | `00/00/0000`                            | 8 dígitos     | `numeric`   | —              |

E um padrão próprio: `mask="00.000-0"`, com `0`, `A` e `*` como posições.

### Comportamento

- **Valor controlado**: `value` aceita o valor cru ou formatado (o backend manda qualquer um dos
  dois) e é exibido formatado. `defaultValue` também, para o uso não controlado.
- **Digitar**: caracteres que não cabem na posição são ignorados (uma letra no CPF). O que passa do
  tamanho da máscara é cortado. O `maxLength` é o da máscara formatada.
- **Telefone**: com até 10 dígitos usa `(00) 0000-0000`; o 11º dígito muda para `(00) 00000-0000`.
- **Cursor**: depois de cada mudança, o cursor fica logo após o mesmo número de caracteres
  "significativos" que havia antes dele, então editar no meio não joga o cursor para o fim. O
  Backspace sobre um literal (o `-` do CEP) apaga o caractere antes dele, em vez de parecer não
  fazer nada.
- **Colar**: texto formatado ou cru é limpo e reformatado.
- **Placeholder**: o formato da máscara (`000.000.000-00`), se o app não passar outro.
- **Acessibilidade**: as props `aria-*` vão para o `<input>`, então o `FormField` injeta o
  `aria-describedby` e o `aria-invalid` normalmente. O valor é um texto comum, então o leitor de
  tela lê o que está na tela, sem anunciar a máscara como erro.

### Utilitários

Também exportados, para o app validar sem duplicar regra:

- `isValidCpf(value)`: os dígitos verificadores do CPF;
- `isValidCnpj(value)`: os dígitos verificadores do CNPJ, **numérico e alfanumérico** (módulo 11,
  com cada caractere valendo o código ASCII menos 48, como define a Receita);
- `formatMasked(value, mask)` e `unmask(value, mask)`, para formatar ou limpar fora de um campo
  (uma tabela, um e-mail).

A validação semântica continua sendo do app (a issue pede assim): o `MaskedInput` não marca erro
sozinho.

## Lote 2: cartão de crédito (#63)

Três componentes, um por campo, porque cada um tem o próprio rótulo no `FormField` e o próprio
`autoComplete`:

| componente        | máscara                               | `autoComplete` | `inputMode` |
| ----------------- | ------------------------------------- | -------------- | ----------- |
| `CardNumberInput` | grupos de 4; Amex `4-6-5`             | `cc-number`    | `numeric`   |
| `CardExpiryInput` | `MM/AA`; colar `MM/AAAA` vira `MM/AA` | `cc-exp`       | `numeric`   |
| `CardCvcInput`    | 3 dígitos, 4 com Amex (prop `brand`)  | `cc-csc`       | `numeric`   |

- **Bandeira**: `detectCardBrand(number)`, exportado, identifica pelo prefixo Visa, Mastercard,
  Amex, Elo, Hipercard e Diners. O `CardNumberInput` avisa por `onBrandChange(brand)`, para o app
  repassar ao `CardCvcInput` e ao PagBank. Ele mostra a bandeira dentro do campo como **texto**
  ("Visa"), e não como logotipo: os logotipos são marcas registradas e o `lucide-react` não os tem.
  Ao lado vai um ícone genérico de cartão. A bandeira é anunciada ao leitor de tela por uma região
  `aria-live="polite"`, com o texto vindo de uma prop de rótulo
  (`brandLabel: (brand) => string`, como manda a convenção dos textos).
- **Faixas de prefixo (BIN)**: a tabela da Elo é longa e muda com o tempo. Os testes usam números
  de teste conhecidos de cada bandeira, e a tabela fica num único arquivo, com a fonte de cada faixa
  em comentário.
- **Validade**: só o formato e o mês entre 01 e 12. Saber se o cartão está vencido é do app e do
  gateway.
- **Código de segurança**: o tamanho segue a `brand`. Na impressão, o texto fica escondido
  (`print:text-transparent`), como a issue pede.
- **Sem guardar nada**: os componentes não usam `localStorage`, `sessionStorage` nem `console`, e
  não colocam o valor em atributos `data-*`. Um teste confere isso enquanto o usuário digita.
- `isValidCardNumber(number)` (Luhn), exportado, como os validadores do lote 1.

## Testes (TDD, escritos antes)

- **Mecanismo** (`src/utils/mask.test.ts`): formatar, limpar, ignorar caracteres inválidos, cortar o
  excesso, posições `0`/`A`/`*`, a máscara que escolhe o padrão pelo valor (telefone), e a posição
  do cursor depois de inserir, apagar e colar no meio.
- **Validadores**: CPFs válidos e inválidos (inclusive `111.111.111-11`), CNPJs numéricos e o
  alfanumérico do exemplo da Receita (`12.ABC.345/01DE-35`), e Luhn com números de teste.
- **`MaskedInput`** (Testing Library + `user-event`): digitar formata e chama
  `onValueChange(raw, formatted)`; o `value` cru ou formatado aparece formatado; o telefone muda de
  formato no 11º dígito; colar; editar no meio sem o cursor pular; Backspace sobre um literal; o
  `inputMode`, o `maxLength` e o placeholder de cada máscara; o CNPJ aceitando letras e as passando
  para maiúsculas; o `onChange` nativo continuando a funcionar; dentro de um `FormField`, o
  `aria-describedby` e o `aria-invalid` chegam ao `<input>`; `jest-axe` sem violações.
- **Cartão**: a bandeira de cada número de teste, o Amex com `4-6-5` e 15 dígitos, o
  `onBrandChange`, o anúncio na região `aria-live`, a validade colada como `MM/AAAA`, o código de
  segurança com 3 ou 4 dígitos, e o teste de "nada guardado" (espiões em `console` e `Storage`).
- **Stories**: uma por máscara, um formulário de cartão completo e as `CustomLabels`. A ordem do
  cursor no navegador real (Chromium) fica numa story com `play`, porque o jsdom não reproduz
  todos os detalhes da seleção de texto.

## Versão e changelog

Componentes novos, sem mudar o que existe: **patch** em cada lote.

A v0.5.5 (o arquivo de tema e a #62) está commitada, mas não publicada. O recomendado é publicá-la
antes do lote 1, que viria como v0.5.6, com o lote 2 como v0.5.7. Juntar os dois lotes na v0.5.5
deixaria uma única versão grande, com muita coisa nova para os apps conferirem de uma vez.

"Ajustes necessários nos apps": nenhum. O `ecommerce-frontend` troca o `Input` pelo `MaskedInput`
nos campos da tabela e pelos componentes de cartão no `PagBankCardPayment.tsx`.

## Fora do escopo

- Máscaras de moeda e de números com casas decimais (`R$ 1.234,56`): é outro tipo de máscara, da
  direita para a esquerda. Se o app pedir, vira issue própria.
- Validar se o cartão está vencido ou se a data existe (31/02).
- Logotipos de bandeiras.
- Um componente único com os três campos do cartão.

## Checklist final

Em cada lote: `npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`,
`npm run build` + `npm run check:dist` (os componentes novos em arquivos próprios, sem entrar no
bundle de quem importa só o `Input`).

[cnpj-rfb]: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
