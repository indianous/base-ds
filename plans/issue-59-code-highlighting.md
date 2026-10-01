# Plano: tokens de realce de código, `CodeBlock` e `Code` (issue #59)

## Contexto

O `portfolio` renderiza posts em Markdown no build e mapeia cada elemento para um componente do
base-ds. Os posts técnicos têm blocos de código, e hoje não dá para realçar a sintaxe só com os
tokens do base-ds:

- os temas dos realçadores (Shiki, highlight.js, Prism) trazem cores literais, que quebram a regra
  dos tokens e não acompanham o tema escuro;
- reaproveitar os tokens de status (`primary`, `success` …) como cor de texto não tem contraste
  garantido sobre o fundo de um bloco de código;
- não há componente para bloco de código nem para código inline.

A issue pede tokens de realce cobertos pelo teste de contraste nos dois temas e um jeito
documentado de ligá-los a um realçador que rode no build, sem JS no cliente. Os componentes
`CodeBlock` e `Code` são opcionais.

### O tema `css-variables` do Shiki

O Shiki tem um tema que, em vez de cores, escreve `var(--<prefixo>…)` em cada trecho
(`createCssVariablesTheme`, [docs](https://shiki.style/guide/theme-colors)). As variáveis são:
`foreground`, `background` e nove de token (`token-constant`, `token-string`, `token-comment`,
`token-keyword`, `token-parameter`, `token-function`, `token-string-expression`,
`token-punctuation` e `token-link`), além das cores ANSI, usadas só pela linguagem `ansi`. O
prefixo é configurável.

Se os tokens do base-ds usarem **exatamente esses nomes, com o prefixo `--color-code-`**, o app só
precisa de `variablePrefix: '--color-code-'`. Não há nenhum mapeamento intermediário para manter.
Os nomes ficam um pouco longos (`--color-code-token-keyword`), mas seguem o padrão `--color-*` dos
outros tokens semânticos.

O próprio Shiki avisa que esse tema é menos granular que os temas comuns: são 9 categorias em vez
de dezenas. Para posts de blog e estudos de caso, é suficiente.

## Tokens

Calculei o contraste de todos contra o fundo do bloco. Todos passam de 4,5:1 nos dois temas.

| token                                  | claro       | contraste | escuro      | contraste |
| -------------------------------------- | ----------- | --------- | ----------- | --------- |
| `--color-code-background`              | neutral-100 | —         | neutral-900 | —         |
| `--color-code-foreground`              | neutral-900 | 16,12     | neutral-100 | 16,12     |
| `--color-code-token-comment`           | neutral-600 | 6,87      | neutral-400 | 6,99      |
| `--color-code-token-keyword`           | violet-700  | 6,46      | violet-300  | 9,61      |
| `--color-code-token-string`            | green-800   | 6,48      | green-300   | 12,63     |
| `--color-code-token-string-expression` | green-900   | 8,28      | green-200   | 14,64     |
| `--color-code-token-constant`          | amber-800   | 6,44      | amber-300   | 12,30     |
| `--color-code-token-function`          | blue-700    | 6,09      | blue-300    | 9,84      |
| `--color-code-token-parameter`         | sky-800     | 6,87      | sky-300     | 10,64     |
| `--color-code-token-punctuation`       | neutral-700 | 9,37      | neutral-300 | 12,04     |
| `--color-code-token-link`              | blue-700    | 6,09      | blue-300    | 9,84      |

No tema claro, `string` e `constant` usam os tons 800 em vez dos 700: com os 700, ficariam em
4,56:1, no limite.

O fundo do bloco quase não se distingue do fundo da página (1,10:1 no claro e 1,13:1 no escuro).
Por isso, o `CodeBlock` tem borda (`border-border`).

Onde ficam:

- `src/styles/theme.css`: no `:root` e no `.dark`, como os outros semânticos;
- `src/tokens/colors.json`: em `semantic` e `semantic-dark`;
- `tailwind.config.js` e o `@theme` do `theme-v4.css`: um grupo de cores `code`, gerando
  utilitários como `bg-code-background` e `text-code-token-keyword`.

As cores ANSI do Shiki ficam de fora. Só a linguagem `ansi` as usa, e sem elas o texto cai na cor
`foreground`.

## Componentes

### `Code` (inline)

`<code>` com `font-mono`, `bg-code-background`, `text-code-foreground`, `rounded-sm`, um
`px` pequeno e o tamanho de fonte relativo ao texto em volta. Recebe `children` e `className`.

### `CodeBlock`

Duas formas de uso:

- `children`: código sem realce, renderizado em `<pre><code>`;
- `html`: a saída do `codeToHtml` do Shiki (um `<pre class="shiki">` completo), inserida com
  `dangerouslySetInnerHTML`. O README avisa que esse HTML deve vir do realçador, no build, e
  **nunca de texto do usuário**.

Mais:

- `language`: aparece num cabeçalho visível do bloco e vai para o `data-language`;
- `label`: nome acessível do bloco, com padrão `'Code'`, como pede a convenção dos rótulos;
- o `<pre>` rola na horizontal e pode receber foco pelo teclado (`tabIndex={0}`), para quem não
  usa mouse conseguir rolar. A regra `scrollable-region-focusable` do axe cobre isso. O Shiki já
  põe `tabindex="0"` no `<pre>` dele.
- estilo: `bg-code-background`, `text-code-foreground`, `font-mono`, `text-sm`, borda,
  `rounded-md` e padding pelos tokens. No caso do `html`, o fundo e o padding do `<pre>` do Shiki
  vêm por seletor de descendente (`[&_pre]:…`), para os dois casos ficarem iguais.

O elemento exato que leva o nome acessível (`<figure>` com `aria-label`, ou uma região) eu decido
na implementação, pelo que o axe aceitar sem violações.

## Integração com o Shiki (README)

Seção "Realce de código", com o exemplo para o build do app:

```ts
import { codeToHtml, createCssVariablesTheme } from 'shiki'

const baseDsTheme = createCssVariablesTheme({
  name: 'base-ds',
  variablePrefix: '--color-code-',
  fontStyle: true,
})

const html = await codeToHtml(code, { lang: 'ts', theme: baseDsTheme })
// <CodeBlock html={html} language="TypeScript" />
```

Também mostra o uso com o `rehype-pretty-code`/`@shikijs/rehype`, para quem converte Markdown, e
o `Code` para código inline. O base-ds **não** passa a depender do Shiki: o tema é criado no app,
e só os nomes das variáveis precisam bater.

## Testes (TDD, escritos antes)

- **Contraste** (`src/tokens/contrast.test.ts`): `code-foreground` e cada `code-token-*` sobre
  `code-background`, nos dois temas. A sincronia com o `colors.json` e a regra de que todo token
  claro tem versão escura já cobrem os tokens novos.
- **Integração com o Shiki** (`src/tokens/code-highlighting.test.ts`, projeto `unit`): o Shiki
  entra como `devDependency`. O teste realça trechos de TypeScript, CSS, Bash e Markdown com o tema
  `css-variables` e `variablePrefix: '--color-code-'`, coleta todas as `var(--color-code-…)` da
  saída e confere que cada uma existe no `theme.css`, nos dois temas. Se o Shiki mudar os nomes
  numa versão nova, o teste avisa.
- **`Code`**: renderiza `<code>` com o conteúdo e as classes dos tokens, sem violações no axe.
- **`CodeBlock`**:
  - com `children`: renderiza `<pre><code>`, o `<pre>` recebe foco, o nome acessível é o padrão
    `'Code'` e o `label` em português o substitui;
  - com `html` (uma saída real do Shiki, gerada no teste): o `<pre class="shiki">` aparece dentro
    do bloco, com os `var(--color-code-…)`;
  - `language` aparece no cabeçalho e no `data-language`;
  - sem violações no axe nos dois casos.

Stories: `Code` (num parágrafo) e `CodeBlock` (sem realce, com realce, sem `language` e
`CustomLabels`). A story com realce usa uma saída do Shiki gravada como string, para a story não
rodar o Shiki no navegador. O addon de a11y verifica o contraste dos tokens nos dois temas.

## Versão e changelog

Tokens e componentes novos, sem mudar nada do que existe: **patch**, v0.5.1. "Adicionado": os
tokens `code-*`, o `Code`, o `CodeBlock` e a seção do README. "Ajustes necessários nos apps":
nenhum.

## Fora do escopo

- Cores ANSI.
- Botão de copiar, numeração de linhas e realce de linhas no `CodeBlock`.
- Exportar o tema do Shiki pelo pacote: isso faria o base-ds depender do Shiki. Basta o
  `variablePrefix` no app.

## Verificação

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist` (o `CodeBlock` e o `Code` precisam aparecer como arquivos próprios e não podem
levar o Shiki para o bundle).
