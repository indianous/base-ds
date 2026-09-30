# Plano: tema escuro nos tokens (issue #52)

## Contexto

O `portfolio` precisa de modo claro/escuro. O base-ds define os tokens só em `:root`
(`src/styles/theme.css`, importado pelo `theme-v4.css`). O app teria que sobrescrever os tokens
semânticos por conta própria, o que contorna o design system e deixa o contraste sem verificação.

A issue pede:

- os tokens semânticos redefinidos sob `.dark` no `<html>`, com o claro continuando como padrão;
- `@custom-variant dark` no v4 e `darkMode: 'class'` documentado no v3;
- o teste de contraste cobrindo os dois temas;
- stories com alternância de tema, para o a11y rodar nos dois;
- README: como ativar e como evitar o flash do tema claro.

A escolha do tema (preferência salva, script anti-flash, botão de alternância) fica no app.

### O que o levantamento mostrou

- Os componentes já usam só utilitários semânticos (`bg-background`, `text-primary` …). A exceção é
  o polegar do `Switch` (`bg-white`, `Switch.tsx:47`), que continua visível no escuro, sobre o
  trilho `bg-primary` ou `bg-muted`. Ele fica como está, e isso é anotado aqui.
- O `Rating` usa `var(--color-warning)` direto, e o valor muda junto com o tema.
- O `Tooltip` usa `bg-foreground text-background`, que se inverte sozinho: no escuro ele fica claro.
- Os status aparecem como **texto sobre o fundo** em cerca de 34 lugares (`text-primary`,
  `text-destructive` …). O teste de contraste de hoje não cobre esse par. No escuro, ele decide a
  paleta: `blue-600` sobre um fundo escuro não passa, então os status precisam de tons mais claros,
  com texto escuro por cima.

## Paleta escura

Calculei o contraste de todos os pares abaixo. Todos passam em 4.5:1.

| token                 | claro (hoje)  | escuro      | par mais justo no escuro               |
| --------------------- | ------------- | ----------- | -------------------------------------- |
| `background`          | neutral-0     | neutral-950 |                                        |
| `foreground`          | neutral-900   | neutral-50  | sobre `background`: 19.27              |
| `muted`               | neutral-100   | neutral-800 |                                        |
| `muted-foreground`    | neutral-600   | neutral-400 | sobre `muted`: 5.78                    |
| `border`              | neutral-200   | neutral-800 |                                        |
| `input`               | neutral-300   | neutral-700 |                                        |
| `ring`                | blue-600      | blue-400    |                                        |
| `overlay`             | preto 50%     | preto 50%   |                                        |
| `<status>`            | tons 600/700  | tom 400     | `destructive` sobre `background`: 7.28 |
| `<status>-foreground` | neutral-0     | neutral-950 | sobre `destructive` (red-400): 7.28    |
| `<status>-hover`      | um tom abaixo | tom 300     |                                        |
| `<status>-active`     | dois tons     | tom 200     |                                        |
| `<status>-muted`      | tom 100       | tom 950     |                                        |
| `<status>-muted-fg`   | tom 700       | tom 300     | `primary` (blue-300 sobre 950): 8.15   |
| `<status>-border`     | tom 300       | tom 800     |                                        |

`<status>` é `primary` (blue), `secondary` (violet), `success` (green), `warning` (amber),
`destructive` (red) e `info` (sky). No escuro, hover e active clareiam em vez de escurecer, como é o
comum em temas escuros.

- **Gráficos**: a paleta `chart-*` fica igual. As quatro cores categóricas passam de 3:1 sobre o
  fundo escuro (a menor é `chart-1`, com 4.56). Os tons mais escuros da escala sequencial se
  confundem com o fundo escuro. Se isso incomodar, vira outra issue.
- **Sombras**: ficam iguais. No escuro elas aparecem pouco, e os componentes já têm borda.
- **Bordas**: `border` sobre `background` fica em 1.37 no escuro. No claro, `neutral-200` sobre
  branco fica em 1.2, então a relação se mantém. A borda é decorativa, e os campos usam `input`.

## Mudanças

### `src/styles/theme.css`

Um bloco `.dark { … }` depois do `:root`, só com os tokens semânticos de cor, mais
`color-scheme: dark`. O `color-scheme` faz as barras de rolagem, o autofill e os controles nativos
(`<select>`, `date`) seguirem o tema. O `:root` ganha `color-scheme: light`.

O seletor é `.dark`, não `:root.dark`. Assim também funciona num trecho da página (uma seção com
`class="dark"`), já que os tokens são variáveis herdadas. Ele tem a mesma especificidade que
`:root` e vem depois no arquivo, então vence no `<html>`.

### `src/styles/theme-v4.css`

`@custom-variant dark (&:where(.dark, .dark *));`, para os apps usarem `dark:` quando precisarem.
O bloco `@theme inline` não muda: os utilitários já apontam para as variáveis.

### `src/tokens/colors.json`

Uma chave nova, `"semantic-dark"`, com o hex de cada token do bloco `.dark`, espelhando o
`"semantic"`.

### `src/tokens/contrast.test.ts` (TDD: muda antes do CSS)

- Ler os blocos `:root` e `.dark` separadamente. No tema escuro, um token resolve primeiro no
  `.dark` e depois cai no `:root` (onde estão os primitivos).
- Rodar os pares de texto nos dois temas (`describe.each(['light', 'dark'])`).
- Pares novos, nos dois temas: `<status>` sobre `background` (os status como texto) e
  `<status>-foreground` sobre `<status>-hover` (botão com o mouse em cima). No claro todos já
  passam: o menor é `destructive` sobre branco, com 4.83.
- Sincronia: `colors.json` `semantic-dark` ↔ bloco `.dark`, como já é feito com o `semantic`.
- Um teste de que o `.dark` redefine **todo** token semântico de cor do `:root` (menos `overlay` e
  `chart-*`, que são iguais nos dois temas). Assim, um token novo no claro não fica sem versão
  escura.

Esse teste falha antes do bloco `.dark` existir e passa depois.

### Storybook

- `preview.tsx`: um `globalTypes.theme` (claro/escuro) com botão na barra de ferramentas e um
  decorator que liga a classe `dark` no `<html>`. O `globals.css` não define o fundo do `body`, e
  o fundo branco do canvas do Storybook faria o a11y medir o contraste errado. Por isso, o
  decorator também aplica `bg-background text-foreground` no `body` do preview. Isso fica no
  Storybook e não entra no CSS publicado, que é responsabilidade do app. Os docs do autodocs
  ficam claros, porque isso não é pedido pela issue.
- **a11y nos dois temas**: um segundo projeto do Vitest, `storybook-dark`, igual ao `storybook`,
  que abre as stories com o tema escuro (via `initialGlobals`, lido de uma variável definida só
  nesse projeto). O `test:stories` passa a rodar os dois projetos, e o tempo dele dobra.
  **Ponto a validar primeiro**: se o `storybookTest` respeita um `initialGlobals` diferente por
  projeto. Se não respeitar, a alternativa é o decorator ler a variável diretamente. O workflow de
  publicação já chama `npm run test:stories`, então ele não muda.
- Stories que fixam cores ou fundos próprios aparecem como falha no a11y escuro e são corrigidas
  no mesmo trabalho. Não dá para saber quantas são antes de rodar.

### README

Seção nova, "Tema escuro":

- ativar com `class="dark"` no `<html>`, ou num trecho da página;
- v4: o `dark:` já vem do `@custom-variant`. v3: `darkMode: 'class'` no `tailwind.config` do app,
  para os utilitários `dark:` do próprio app;
- evitar o flash do tema claro: aplicar a classe antes da primeira pintura, com um script inline
  no `<head>` que lê a preferência salva e o `prefers-color-scheme`. Exemplo curto, com a nota de
  que, no Next.js, o `next-themes` (`attribute="class"`) já faz isso;
- o que fica por conta do app: salvar a preferência e o botão de alternância.

## Versão e changelog

Recurso novo, opcional, sem ajuste obrigatório nos apps: **patch**, v0.4.10. Entrada em
"Adicionado": tokens do tema escuro sob `.dark`, `color-scheme`, `@custom-variant dark` no v4,
alternância de tema no Storybook. "Ajustes necessários nos apps": nenhum. Quem quiser o tema escuro
segue o README.

## Fora do escopo

- Paleta de gráficos própria para o escuro.
- Trocar o `bg-white` do `Switch` por um token.
- Um componente `ThemeToggle` ou um hook de tema. Se os apps pedirem, vira outra issue.

## Verificação

`npm run lint`, `format:check`, `typecheck`, `npm test` (inclui o contraste nos dois temas),
`npm run test:stories` (a11y nos dois temas) e `npm run build`. Conferir também que o
`dist/styles/theme.css` sai com o bloco `.dark`.
