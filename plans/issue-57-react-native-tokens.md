# Plano: exportar tokens e preset Tailwind para React Native/NativeWind (issue #57)

## Contexto

O `indoor-media` terá um app mobile em React Native (Expo) com NativeWind. Ele não pode usar os
componentes do base-ds, que são React DOM, mas quer os mesmos tokens e os mesmos nomes de
utilitários (`bg-primary`, `p-4`, `text-lg`) para montar os próprios componentes.

Hoje o pacote publica só `.` (componentes) e `./styles` / `./styles/v4` (CSS). Os tokens
(`src/tokens/*.json`) e o `tailwind.config.js` não vão para o `dist`.

A issue pede:

1. os tokens exportados (cores primitivas e semânticas dos dois temas, tipografia, espaçamento,
   bordas e sombras);
2. um preset Tailwind v3, que é a versão usada pelo NativeWind;
3. avaliar se o preset pode usar `var(--color-…)` ou se precisa de valores diretos no React
   Native.

### O que a pesquisa mostrou

- **O NativeWind v5 (Tailwind v4) ainda é pré-lançamento**, "not intended for production use"
  ([docs](https://www.nativewind.dev/v5/guides/themes)). O alvo é o **NativeWind v4**, com
  Tailwind v3, como a issue diz.
- **No v4, o tema por variáveis** é feito com o helper `vars()`, que recebe um objeto
  `{ '--nome': 'valor' }` em JavaScript e aplica as variáveis numa `View`. O claro/escuro fica por
  conta do app, com `useColorScheme()` ([docs](https://www.nativewind.dev/docs/guides/themes)). A
  documentação não diz se uma variável pode apontar para outra (`var()` dentro de `var()`), e o
  `theme.css` faz isso em todos os tokens semânticos (`--color-primary: var(--color-blue-600)`).
- **O `tailwind.config.js` atual usa `var()` em tudo**: cores, espaçamento, tamanhos de fonte,
  pesos, sombras e raios. Um preset igual a ele exigiria que o app mobile definisse todas essas
  variáveis em tempo de execução.

## Desenho

A resposta para o item 3 é: **cores por variável, o resto com valor direto.**

- **Cores** mudam com o tema, então ficam como `var(--color-primary)` no preset, como na web. O
  pacote exporta, para cada tema, um objeto com **os valores já resolvidos em hex**
  (`{ '--color-primary': '#2563eb', … }`), sem nenhuma variável apontando para outra. O app passa
  esse objeto ao `vars()` na raiz e troca entre o claro e o escuro com o `useColorScheme()`. É o
  padrão que a documentação do NativeWind v4 mostra.
- **Espaçamento, tipografia, raios e bordas** não mudam com o tema, então entram no preset com o
  **valor direto** (`p-4` → `16px`). Funcionam no React Native sem nenhuma variável.

### 1. `@indianous/base-ds/tokens`

Um módulo TypeScript (`src/tokens/index.ts`), com ESM, CJS e tipos, que reexporta os JSONs
tipados e acrescenta os valores derivados:

```ts
import {
  colors,
  spacing,
  typography,
  borders,
  shadows,
  themeVariables,
} from '@indianous/base-ds/tokens'

colors.primitive.blue[600] // '#2563eb'
colors.semantic.primary // '#2563eb' (claro)
colors.semanticDark.primary // '#60a5fa'
themeVariables.light // { '--color-background': '#ffffff', '--color-primary': '#2563eb', … }
themeVariables.dark // { '--color-background': '#030712', … }
```

- `themeVariables` cobre todos os tokens semânticos de cor, nos dois temas. Os que não mudam com o
  tema (`overlay`, `chart-*`) aparecem nos dois.
- O `semantic-dark` do JSON vira `semanticDark` no módulo, por ser um nome de propriedade JS.
- Não importa React, DOM nem nenhum componente: pode ser importado num app React Native, num
  script de build ou num Server Component.

### 2. `@indianous/base-ds/tailwind-preset`

Um preset Tailwind v3 (`src/tailwind-preset.ts`), com ESM, CJS e tipos, para o app usar
`presets: [require('@indianous/base-ds/tailwind-preset')]`:

- `theme.extend.colors`: os **mesmos nomes** do `tailwind.config.js` (`primary`,
  `primary-foreground`, `code-token-keyword` …), apontando para `var(--color-…)`;
- `spacing`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `borderRadius` e
  `borderWidth` com valores diretos, gerados dos JSONs;
- `boxShadow` com os valores dos JSONs. No React Native, o NativeWind só aproveita parte das
  sombras, e o README avisa isso;
- `fontFamily` com as pilhas de fonte da web. No React Native, elas não servem (o RN pede o nome
  de uma fonte carregada), e o README diz para o app sobrescrever.

O preset também serve para apps web com Tailwind v3, com os mesmos utilitários. Os valores diretos
são iguais aos das variáveis.

### Fonte única dos valores

Hoje só as cores têm teste de sincronia entre o JSON e o `theme.css`. Espaçamento, tipografia,
bordas e sombras existem nos JSONs e no `theme.css` sem nada que garanta que são iguais. Como o
preset será gerado dos JSONs e a web usa o `theme.css`, um teste novo passa a garantir que os dois
batem. Assim, o mobile e a web não divergem.

### Build

- O `tsup` ganha duas entradas, `src/tokens/index.ts` e `src/tailwind-preset.ts`, em ESM e CJS,
  com tipos.
- `package.json` → `exports`: `"./tokens"` e `"./tailwind-preset"`, cada um com `types`,
  `import` e `require`.
- **Esses arquivos não podem receber o `'use client'`**: não são componentes, e o React Native
  não tem essa diretiva. O passo do `onSuccess` que prefixa a diretiva e o `check:dist` passam a
  ignorá-los.

## Testes (TDD, escritos antes)

- `src/tokens/index.test.ts`:
  - `themeVariables.light`/`.dark` têm uma entrada para cada token semântico de cor, com o mesmo
    hex que o teste de contraste resolve do `theme.css`, e nenhum valor contém `var(`;
  - `colors`, `spacing`, `typography`, `borders` e `shadows` batem com os JSONs.
- `src/tokens/sync.test.ts`: espaçamento, tipografia, bordas e sombras dos JSONs batem com o
  `theme.css`.
- `src/tailwind-preset.test.ts`:
  - o preset tem os mesmos nomes de cor e as mesmas chaves de espaçamento, tamanho de fonte etc.
    que o `tailwind.config.js` da web;
  - as cores usam `var(--color-…)`, e o resto não usa `var(`;
  - compilado pelo Tailwind v3 (que já é dependência), gera `bg-primary`, `p-4` e `text-lg` com os
    valores esperados.
- `src/bundle.test.ts`: importar `@indianous/base-ds/tokens` não leva React nem componente
  nenhum.
- `check:dist`: os arquivos dos dois subpaths existem e não começam com `'use client'`.

## Tamanhos de fonte em `rem`

No nativo, o NativeWind troca `rem` por `px` no build, com base de 14px por padrão. Na web, a base
é 16px. A opção `inlineRem` do `withNativeWind`, no `metro.config.js`, muda essa base
([docs](https://nativewind.dev/docs/api/with-nativewind)). O preset mantém os tamanhos em `rem`,
iguais aos da web, e o README indica `inlineRem: 16`, para `text-base` ter os mesmos 16px nas duas
plataformas.

## Verificação

Não haverá teste com o NativeWind nem app React Native: a verificação fica nos testes do
repositório (o preset compilado pelo Tailwind v3 e os subpaths no `check:dist`). O README diz que
o fluxo com o NativeWind segue a documentação dele e não foi testado num app real.

## README

Seção "React Native (NativeWind)":

- `tailwind.config.js` do app com `presets: [require('@indianous/base-ds/tailwind-preset')]`;
- na raiz do app, `vars(themeVariables[colorScheme])` com o `useColorScheme()`;
- `inlineRem: 16` no `withNativeWind`, para os tamanhos de fonte baterem com a web;
- `fontFamily` e sombras: o que sobrescrever e o que não funciona igual;
- o `tokens` também serve para outros usos (gráficos nativos, e-mails, scripts).

## Versão e changelog

Dois subpaths novos, sem mudar nada do que existe: **patch**, v0.5.2. "Adicionado":
`@indianous/base-ds/tokens` e `@indianous/base-ds/tailwind-preset`. "Ajustes necessários nos
apps": nenhum.

## Fora do escopo

- Componentes para React Native.
- Preset para Tailwind v4 / NativeWind v5, enquanto o v5 for pré-lançamento. Na web com Tailwind
  v4, o `@indianous/base-ds/styles/v4` continua sendo o caminho.
- Trocar o `tailwind.config.js` da web pelo preset: a web continua com as variáveis do
  `theme.css`.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

## Resultado (implementação)

Entregue como planejado. O que o build exigiu:

- O CJS do tsup devolvia `{ default: preset }` num `require()`. O `cjsInterop` resolve, mas o tsup
  só o aplica com `splitting` ligado. Por isso o CJS dos dados usa os dois, e o `check:dist`
  confere que o `require` devolve o preset.
- No ESM, o `splitting` vem ligado por padrão no tsup e criou um chunk compartilhado entre os dois
  subpaths, que recebia o `'use client'` do passo dos componentes. O ESM dos dados usa
  `splitting: false`, e cada arquivo fica completo. O chunk `.cjs` não é afetado, porque o passo da
  diretiva só olha arquivos `.js`. O `check:dist` trata todo `.cjs` que não seja o `index.cjs` como
  dado, sem `'use client'`.
- O teste de sincronia passou de primeira: os JSONs não-cor já estavam iguais ao `theme.css`.
